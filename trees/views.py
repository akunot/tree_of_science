from rest_framework import status, pagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.core import serializers as django_serializers
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.db.models import Q
import json
import io
from .models import Tree
from .serializers import TreeCreateSerializer, TreeSerializer, TreeListSerializer
import textwrap
from reportlab.lib import colors

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tree_generate(request):
    """
    Generar un nuevo árbol de la ciencia
    """
    serializer = TreeCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        tree = serializer.save()
        return Response(TreeSerializer(tree, context={'request': request}).data, 
                       status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_history(request):
    """
    Obtener historial de árboles generados por el usuario (paginado y con búsqueda)
    """
    trees = Tree.objects.filter(user=request.user).order_by('-fecha_generado')

    if search := request.query_params.get('search'):

        trees = trees.filter(
            Q(title__icontains=search) |
            Q(seed__icontains=search) |
            Q(bibliography__nombre_archivo__icontains=search)
        )

    paginator = pagination.PageNumberPagination()
    paginator.page_size_query_param = 'page_size'

    try:
        page_size = int(request.query_params.get('page_size', 50))
    except (TypeError, ValueError):
        page_size = 50
    if page_size <= 0:
        page_size = 50

    paginator.page_size = page_size

    page = paginator.paginate_queryset(trees, request)
    serializer = TreeListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_detail(request, pk):
    """
    Obtener detalles de un árbol específico
    """
    try:
        tree = Tree.objects.get(pk=pk, user=request.user)
        serializer = TreeSerializer(tree, context={'request': request})
        return Response(serializer.data)
    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tree_download(request, pk, format_type):
    """
    Descargar información del árbol en formato específico
    """
    try:
        tree = Tree.objects.get(pk=pk, user=request.user)

        if format_type.lower() == 'json':
            response = HttpResponse(
                json.dumps(tree.arbol_json, indent=2, ensure_ascii=False),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.json"'
            return response

        elif format_type.lower() == 'pdf':
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            nodes = tree.arbol_json.get('nodes', []) or []
            stats = tree.arbol_json.get('statistics', {}) or {}

            # --- Constantes de layout ---
            MARGIN = 50
            COL_TITLE   = MARGIN         # 0–220
            COL_YEAR    = MARGIN + 230   # 280
            COL_TYPE    = MARGIN + 275   # 325
            COL_SAP     = MARGIN + 345   # 395
            COL_CITES   = MARGIN + 400   # 450
            TITLE_MAX_W = 220            # caracteres visual aprox.
            LINE_H      = 11
            ROW_PAD     = 2

            def draw_header(title_suffix=""):
                # Fondo del header
                p.setFillColorRGB(0.15, 0.25, 0.45)
                p.rect(0, height - 100, width, 100, fill=1, stroke=0)

                # Título principal
                p.setFillColorRGB(1, 1, 1)
                p.setFont("Helvetica-Bold", 15)
                title = f"Árbol de la Ciencia — {tree.title or f'ID: {tree.id}'}"
                if title_suffix:
                    title += f" ({title_suffix})"
                p.drawString(MARGIN, height - 30, title[:90])

                # Subtítulo: metadatos
                p.setFont("Helvetica", 9)
                p.drawString(MARGIN, height - 47, f"Semilla: {tree.seed}   |   Fecha: {tree.fecha_generado.strftime('%Y-%m-%d %H:%M')}   |   Nodos: {len(nodes)}")
                if tree.bibliography:
                    p.drawString(MARGIN, height - 59, f"Bibliografía: {getattr(tree.bibliography, 'nombre_archivo', '')[:60]}")

                # Stats box (fondo más claro)
                p.setFillColorRGB(0.22, 0.35, 0.58)
                p.rect(0, height - 100, width, 30, fill=1, stroke=0)

                p.setFillColorRGB(0.85, 0.92, 1)
                p.setFont("Helvetica-Bold", 9)
                stat_items = [
                    (MARGIN,        f"Raíces: {stats.get('roots', 0)}"),
                    (MARGIN + 90,   f"Troncos: {stats.get('trunks', 0)}"),
                    (MARGIN + 190,  f"Hojas: {stats.get('leaves', 0)}"),
                    (MARGIN + 285,  f"SAP Prom: {stats.get('average_sap', 0):.2f}"),
                    (MARGIN + 380,  f"SAP Máx: {stats.get('max_sap', 0)}"),
                    (MARGIN + 460,  f"SAP Mín: {stats.get('min_sap', 0)}"),
                ]
                for x, text in stat_items:
                    p.drawString(x, height - 89, text)

                # Encabezado de columnas de tabla
                p.setFillColorRGB(0.93, 0.95, 0.98)
                p.rect(MARGIN - 4, height - 122, width - MARGIN * 2 + 8, 18, fill=1, stroke=0)

                p.setFillColorRGB(0.1, 0.1, 0.3)
                p.setFont("Helvetica-Bold", 9)
                p.drawString(COL_TITLE,  height - 112, "Título")
                p.drawString(COL_YEAR,   height - 112, "Año")
                p.drawString(COL_TYPE,   height - 112, "Tipo")
                p.drawString(COL_SAP,    height - 112, "SAP")
                p.drawString(COL_CITES,  height - 112, "Citas")

                # Línea bajo encabezado
                p.setStrokeColorRGB(0.15, 0.25, 0.45)
                p.setLineWidth(1)
                p.line(MARGIN - 4, height - 124, width - MARGIN + 4, height - 124)

                return height - 130  # y inicial para filas

            y = draw_header()
            p.setFillColorRGB(0, 0, 0)

            for idx, node in enumerate(nodes):
                label     = str(node.get("label", "Nodo sin etiqueta"))
                year      = str(node.get("year", ""))[:6] if node.get("year") else "—"
                node_type = str(node.get("type_label", node.get("group", "")))[:12]
                sap_val   = node.get("_sap", 0)
                cites     = str(node.get("times_cited", 0))

                # Wrap del título a ~55 chars por línea (ajusta según fuente 9pt)
                wrapped = textwrap.wrap(label, width=55) or [""]
                row_height = len(wrapped) * LINE_H + ROW_PAD * 2

                # Salto de página si no hay espacio
                if y - row_height < 50:
                    p.showPage()
                    y = draw_header(title_suffix=f"cont. pág. {idx + 1}")
                    p.setFillColorRGB(0, 0, 0)

                # Fondo alternado de filas
                if idx % 2 == 0:
                    p.setFillColorRGB(0.96, 0.97, 1.0)
                    p.rect(MARGIN - 4, y - row_height, width - MARGIN * 2 + 8, row_height, fill=1, stroke=0)
                    p.setFillColorRGB(0, 0, 0)

                # Título (multi-línea)
                p.setFont("Helvetica", 8.5)
                text_y = y - LINE_H
                for line in wrapped:
                    p.drawString(COL_TITLE, text_y, line)
                    text_y -= LINE_H

                # Columnas de datos (alineadas al centro vertical de la fila)
                mid_y = y - (row_height / 2) - 3
                p.setFont("Helvetica", 8.5)
                p.drawString(COL_YEAR,  mid_y, year)
                p.drawString(COL_TYPE,  mid_y, node_type)
                p.drawString(COL_SAP,   mid_y, f"{sap_val:.2f}" if isinstance(sap_val, (int, float)) else str(sap_val))
                p.drawString(COL_CITES, mid_y, cites)

                # Línea separadora entre filas
                p.setStrokeColorRGB(0.8, 0.84, 0.9)
                p.setLineWidth(0.4)
                p.line(MARGIN - 4, y - row_height, width - MARGIN + 4, y - row_height)

                y -= row_height

            p.save()
            buffer.seek(0)

            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.pdf"'
            return response

        else:
            return Response({'error': 'Formato no soportado. Use: json, pdf'}, 
                          status=status.HTTP_400_BAD_REQUEST)

    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def tree_delete(request, pk):
    """
    Eliminar un árbol
    """
    try:
        tree = Tree.objects.get(pk=pk, user=request.user)
        tree.delete()
        return Response({'message': 'Árbol eliminado exitosamente.'})
    except Tree.DoesNotExist as e:
        raise Http404("Árbol no encontrado") from e