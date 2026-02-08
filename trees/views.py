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

            def draw_header(title_suffix=""):
                p.setFont("Helvetica-Bold", 16)
                title = f"Árbol de la Ciencia - {tree.title or f'ID: {tree.id}'}"
                if title_suffix:
                    title = f"{title} ({title_suffix})"
                p.drawString(50, height - 50, title)

                p.setFont("Helvetica", 10)
                y_header = height - 70
                p.drawString(50, y_header, f"Semilla: {tree.seed}")
                p.drawString(300, y_header, f"Fecha: {tree.fecha_generado.strftime('%Y-%m-%d %H:%M')}")

                y_header -= 14
                if tree.bibliography:
                    p.drawString(50, y_header, f"Bibliografía: {getattr(tree.bibliography, 'nombre_archivo', '')[:50]}")
                p.drawString(300, y_header, f"Nodos: {len(nodes)}")

                # Estadísticas resumidas
                y_header -= 20
                p.setFont("Helvetica-Bold", 10)
                p.drawString(50, y_header, "Raíces")
                p.drawString(120, y_header, "Troncos")
                p.drawString(200, y_header, "Hojas")
                p.drawString(280, y_header, "SAP Prom.")
                p.drawString(360, y_header, "SAP Max")
                p.drawString(430, y_header, "SAP Min")

                y_header -= 12
                p.setFont("Helvetica", 10)
                p.drawString(50, y_header, str(stats.get("roots", 0)))
                p.drawString(120, y_header, str(stats.get("trunks", 0)))
                p.drawString(200, y_header, str(stats.get("leaves", 0)))
                p.drawString(280, y_header, f"{stats.get('average_sap', 0):.2f}")
                p.drawString(360, y_header, str(stats.get("max_sap", 0)))
                p.drawString(430, y_header, str(stats.get("min_sap", 0)))

                # Encabezado de tabla
                y_header -= 22
                p.setFont("Helvetica-Bold", 9)
                p.drawString(50, y_header, "Título")
                p.drawString(280, y_header, "Año")
                p.drawString(320, y_header, "Tipo")
                p.drawString(380, y_header, "SAP")
                p.drawString(430, y_header, "Citas")

                # Línea divisoria
                y_header -= 4
                p.line(50, y_header, width - 50, y_header)

                return y_header - 12  # posición inicial para filas

            y = draw_header()

            p.setFont("Helvetica", 9)
            line_height = 12
            max_width_title = 220  # px aprox para columna título

            for idx, node in enumerate(nodes):
                if y < 60:  # espacio para footer
                    p.showPage()
                    y = draw_header(title_suffix=f"cont. pág. {idx+1}")

                    p.setFont("Helvetica", 9)

                label = str(node.get("label", "Nodo sin etiqueta"))
                year = str(node.get("year", "")) if node.get("year") else ""
                node_type = str(node.get("type_label", node.get("group", "")))
                sap_val = node.get("_sap", 0)
                cites = node.get("times_cited", 0)

                # recortar el título a una longitud razonable
                if len(label) > 120:
                    label = f"{label[:117]}..."

                p.drawString(50, y, label[:80])  # primera parte (visual)
                if len(label) > 80:
                    # segunda línea para títulos muy largos
                    y -= line_height
                    p.drawString(50, y, label[80:160])

                p.drawString(280, y, year[:6])
                p.drawString(320, y, node_type[:10])
                p.drawString(380, y, f"{sap_val:.2f}" if isinstance(sap_val, (int, float)) else str(sap_val))
                p.drawString(430, y, str(cites))

                y -= line_height

            # Footer simple con número de páginas se puede añadir si usas PageTemplates,
            # pero para algo sencillo así lo dejamos.

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