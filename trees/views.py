from rest_framework import status, pagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.db.models import Q
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import networkx as nx
import json
import io
import textwrap
from .models import Tree, Bibliography
from .serializers import TreeCreateSerializer, TreeSerializer, TreeListSerializer

# ─── CAMPOS LIGEROS para listados (excluye arbol_json que puede pesar MB) ──────
_LIST_FIELDS = ('id', 'title', 'seed', 'fecha_generado', 'bibliography_id')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tree_generate(request):
    """
    Generar un nuevo árbol de la ciencia.
    
    Parámetros opcionales:
    - quick: bool - Si True, genera un árbol más pequeño y rápido (recomendado)
    """
    # Verificar si es modo rápido
    quick_mode = request.data.get('quick', False)
    
    serializer = TreeCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        tree = serializer.save()
        return Response(
            TreeSerializer(tree, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tree_generate_quick(request):
    """
    Generar un árbol de la ciencia en modo rápido.
    
    Este método usa parámetros optimizados para generar árboles más pequeños
    y rápidos, ideal para previsualización o cuando el tiempo es crítico.
    Mantiene la precisión del algoritmo (ghost nodes y Jaro-Winkler).
    """
    from .science_tree_builder import ScienceTreeBuilder
    from .models import Tree
    from django.utils import timezone
    
    seed = request.data.get('seed')
    bibliography_id = request.data.get('bibliography')
    title = request.data.get('title', f'Árbol rápido - {seed[:30]}')
    
    if not seed or not bibliography_id:
        return Response(
            {'error': 'Se requieren los campos seed y bibliography'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        bibliography = Bibliography.objects.get(pk=bibliography_id, user=request.user)
    except Bibliography.DoesNotExist:
        return Response(
            {'error': 'Bibliografía no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Usar parámetros rápidos pero manteniendo precisión
    try:
        builder = ScienceTreeBuilder(
            min_degree=1,
            min_cocitations=2,
            include_ghost_nodes=True,  # ✅ Mantener para precisión
            exclude_self_citations=True,
            use_jaro_winkler=True,    # ✅ Mantener para precisión
            fast_sap=True,
            use_lcc=True,
            leaf_window=3,              # Ventana más pequeña
            top_trunk_limit=15,         # Menos nodos
            top_root_limit=10,
            top_leaf_limit=25,
            max_nodes=50,               # Máximo 50 nodos
        )
        graph = builder.build_from_file(bibliography.archivo)
        
        # Extraer nodos y estadísticas
        nodes_with_attributes = []
        stats = {'roots': 0, 'trunks': 0, 'leaves': 0, 'total_value': 0, 'sum_sap': 0, 'max_sap': 0, 'min_sap': float('inf')}
        
        for node_id, node_data in graph.nodes(data=True):
            root_val = float(node_data.get('root', 0))
            trunk_val = float(node_data.get('trunk', 0))
            leaf_val = float(node_data.get('leaf', 0))
            total_val = root_val + trunk_val + leaf_val
            sap_val = float(node_data.get('_sap', 0))
            
            if total_val == 0:
                continue
            
            dominant_group = node_data.get('group', 'leaf')
            
            if dominant_group == 'root':
                stats['roots'] += 1
            elif dominant_group == 'trunk':
                stats['trunks'] += 1
            else:
                stats['leaves'] += 1
            
            stats['total_value'] += total_val
            stats['sum_sap'] += sap_val
            stats['max_sap'] = max(stats['max_sap'], sap_val)
            if sap_val > 0:
                stats['min_sap'] = min(stats['min_sap'], sap_val)
            
            node_dict = {
                'id': str(node_id),
                'label': node_data.get('label', str(node_id)),
                'root': root_val,
                'trunk': trunk_val,
                'leaf': leaf_val,
                'total_value': total_val,
                'group': dominant_group,
                'type_label': 'Raíz' if dominant_group == 'root' else ('Tronco' if dominant_group == 'trunk' else 'Hoja'),
                '_sap': sap_val,
                'url': node_data.get('url'),
                'doi': node_data.get('doi'),
                'year': node_data.get('year'),
                'authors': node_data.get('authors'),
                'times_cited': int(node_data.get('times_cited', 0)) if node_data.get('times_cited') else 0,
            }
            nodes_with_attributes.append(node_dict)
        
        # Ordenar por SAP
        nodes_with_attributes.sort(key=lambda x: x.get('_sap', 0), reverse=True)
        
        # Extraer enlaces
        links = nx.node_link_data(graph).get('links', [])
        
        # Componer resultado
        stats['total'] = len(nodes_with_attributes)
        stats['min_sap'] = stats['min_sap'] if stats['min_sap'] != float('inf') else 0
        
        tree_data = {
            'nodes': nodes_with_attributes,
            'links': links,
            'statistics': {
                'roots': stats['roots'],
                'trunks': stats['trunks'],
                'leaves': stats['leaves'],
                'total': stats['total'],
                'total_value': stats['total_value'],
                'average_sap': stats['sum_sap'] / stats['total'] if stats['total'] > 0 else 0,
                'max_sap': stats['max_sap'],
                'min_sap': stats['min_sap'],
            },
            'metadata': {
                'algorithm_version': '2.0-quick',
                'seed': seed,
                'total_nodes': len(nodes_with_attributes),
                'total_links': len(links),
                'generated_at': timezone.now().isoformat(),
                'quick_mode': True,
            }
        }
        
        # Crear árbol
        tree = Tree.objects.create(
            user=request.user,
            bibliography=bibliography,
            seed=seed,
            title=title,
            arbol_json=tree_data
        )
        
        return Response(
            TreeSerializer(tree, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {'error': f'Error generando árbol: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_history(request):
    """
    Obtener historial de árboles generados por el usuario (paginado y con búsqueda).

    OPTIMIZACIONES:
    - select_related('bibliography') elimina el N+1: antes se hacía 1 query por fila
      para obtener bibliography.nombre_archivo; ahora es 1 sola query con JOIN.
    - .only(*_LIST_FIELDS, 'bibliography__nombre_archivo') evita traer arbol_json
      (que puede pesar varios MB por árbol) cuando solo se necesita el listado.
    """
    trees = (
        Tree.objects
        .filter(user=request.user)
        .select_related('bibliography')               # ← FIX N+1
        .only(                                         # ← FIX: no cargar arbol_json
            'id', 'title', 'seed', 'fecha_generado',
            'bibliography__nombre_archivo',
        )
        .order_by('-fecha_generado')
    )

    if search := request.query_params.get('search'):
        trees = trees.filter(
            Q(title__icontains=search)
            | Q(seed__icontains=search)
            | Q(bibliography__nombre_archivo__icontains=search)
        )

    paginator = pagination.PageNumberPagination()
    paginator.page_size_query_param = 'page_size'

    try:
        page_size = int(request.query_params.get('page_size', 50))
    except (TypeError, ValueError):
        page_size = 50
    if page_size <= 0:
        page_size = 50

    # Cap de seguridad: evitar page_size=9999 que traiga todo de golpe
    paginator.page_size = min(page_size, 100)

    page = paginator.paginate_queryset(trees, request)
    serializer = TreeListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_detail(request, pk):
    """
    Obtener detalles de un árbol específico.

    OPTIMIZACIÓN: select_related('bibliography') evita la segunda query
    al acceder a tree.bibliography dentro del TreeSerializer.
    """
    try:
        tree = (
            Tree.objects
            .select_related('bibliography')            # ← FIX N+1
            .get(pk=pk, user=request.user)
        )
        serializer = TreeSerializer(tree, context={'request': request})
        return Response(serializer.data)
    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_download(request, pk, format_type):
    """
    Descargar árbol en JSON o PDF.

    OPTIMIZACIÓN: select_related('bibliography') igual que en tree_detail.
    """
    try:
        tree = (
            Tree.objects
            .select_related('bibliography')            # ← FIX N+1
            .get(pk=pk, user=request.user)
        )

        if format_type.lower() == 'json':
            response = HttpResponse(
                json.dumps(tree.arbol_json, indent=2, ensure_ascii=False),
                content_type='application/json',
            )
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.json"'
            return response

        elif format_type.lower() == 'pdf':
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            nodes = tree.arbol_json.get('nodes', []) or []
            stats = tree.arbol_json.get('statistics', {}) or {}

            MARGIN      = 50
            COL_TITLE   = MARGIN
            COL_YEAR    = MARGIN + 230
            COL_TYPE    = MARGIN + 275
            COL_SAP     = MARGIN + 345
            COL_CITES   = MARGIN + 400
            LINE_H      = 11
            ROW_PAD     = 2

            def draw_header(title_suffix=""):
                p.setFillColorRGB(0.15, 0.25, 0.45)
                p.rect(0, height - 100, width, 100, fill=1, stroke=0)
                p.setFillColorRGB(1, 1, 1)
                p.setFont("Helvetica-Bold", 15)
                title = f"Árbol de la Ciencia — {tree.title or f'ID: {tree.id}'}"
                if title_suffix:
                    title += f" ({title_suffix})"
                p.drawString(MARGIN, height - 30, title[:90])
                p.setFont("Helvetica", 9)
                p.drawString(MARGIN, height - 47, f"Semilla: {tree.seed}   |   Fecha: {tree.fecha_generado.strftime('%Y-%m-%d %H:%M')}   |   Nodos: {len(nodes)}")
                if tree.bibliography:
                    p.drawString(MARGIN, height - 59, f"Bibliografía: {getattr(tree.bibliography, 'nombre_archivo', '')[:60]}")
                p.setFillColorRGB(0.22, 0.35, 0.58)
                p.rect(0, height - 100, width, 30, fill=1, stroke=0)
                p.setFillColorRGB(0.85, 0.92, 1)
                p.setFont("Helvetica-Bold", 9)
                for x, text in [
                    (MARGIN,       f"Raíces: {stats.get('roots', 0)}"),
                    (MARGIN + 90,  f"Troncos: {stats.get('trunks', 0)}"),
                    (MARGIN + 190, f"Hojas: {stats.get('leaves', 0)}"),
                    (MARGIN + 285, f"SAP Prom: {stats.get('average_sap', 0):.2f}"),
                    (MARGIN + 380, f"SAP Máx: {stats.get('max_sap', 0)}"),
                    (MARGIN + 460, f"SAP Mín: {stats.get('min_sap', 0)}"),
                ]:
                    p.drawString(x, height - 89, text)
                p.setFillColorRGB(0.93, 0.95, 0.98)
                p.rect(MARGIN - 4, height - 122, width - MARGIN * 2 + 8, 18, fill=1, stroke=0)
                p.setFillColorRGB(0.1, 0.1, 0.3)
                p.setFont("Helvetica-Bold", 9)
                for x, label in [(COL_TITLE, "Título"), (COL_YEAR, "Año"), (COL_TYPE, "Tipo"), (COL_SAP, "SAP"), (COL_CITES, "Citas")]:
                    p.drawString(x, height - 112, label)
                p.setStrokeColorRGB(0.15, 0.25, 0.45)
                p.setLineWidth(1)
                p.line(MARGIN - 4, height - 124, width - MARGIN + 4, height - 124)
                return height - 130

            y = draw_header()
            p.setFillColorRGB(0, 0, 0)

            for idx, node in enumerate(nodes):
                label     = str(node.get("label", "Nodo sin etiqueta"))
                year      = str(node.get("year", ""))[:6] if node.get("year") else "—"
                node_type = str(node.get("type_label", node.get("group", "")))[:12]
                sap_val   = node.get("_sap", 0)
                cites     = str(node.get("times_cited", 0))
                wrapped   = textwrap.wrap(label, width=55) or [""]
                row_h     = len(wrapped) * LINE_H + ROW_PAD * 2

                if y - row_h < 50:
                    p.showPage()
                    y = draw_header(title_suffix=f"cont. pág. {idx + 1}")
                    p.setFillColorRGB(0, 0, 0)

                if idx % 2 == 0:
                    p.setFillColorRGB(0.96, 0.97, 1.0)
                    p.rect(MARGIN - 4, y - row_h, width - MARGIN * 2 + 8, row_h, fill=1, stroke=0)
                    p.setFillColorRGB(0, 0, 0)

                p.setFont("Helvetica", 8.5)
                text_y = y - LINE_H
                for line in wrapped:
                    p.drawString(COL_TITLE, text_y, line)
                    text_y -= LINE_H

                mid_y = y - (row_h / 2) - 3
                p.drawString(COL_YEAR,  mid_y, year)
                p.drawString(COL_TYPE,  mid_y, node_type)
                p.drawString(COL_SAP,   mid_y, f"{sap_val:.2f}" if isinstance(sap_val, (int, float)) else str(sap_val))
                p.drawString(COL_CITES, mid_y, cites)
                p.setStrokeColorRGB(0.8, 0.84, 0.9)
                p.setLineWidth(0.4)
                p.line(MARGIN - 4, y - row_h, width - MARGIN + 4, y - row_h)
                y -= row_h

            p.save()
            buffer.seek(0)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.pdf"'
            return response

        else:
            return Response(
                {'error': 'Formato no soportado. Use: json, pdf'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def tree_delete(request, pk):
    """
    Eliminar un árbol.
    """
    try:
        tree = Tree.objects.get(pk=pk, user=request.user)
        tree.delete()
        return Response({'message': 'Árbol eliminado exitosamente.'})
    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e