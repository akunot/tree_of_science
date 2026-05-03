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
    Generar un nuevo árbol de la ciencia
    """
    serializer = TreeCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        tree = serializer.save()
        return Response(
            TreeSerializer(tree, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            # Generar PDF síncrono y servir directamente
            from .export_utils import generate_pdf_sync
            pdf_content = generate_pdf_sync(tree)
            
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.pdf"'
            response['Content-Length'] = len(pdf_content)
            return response
        
        elif format_type.lower() == 'csv':
            # Generar CSV de nodos
            from .export_utils import generate_csv_sync, save_temp_file
            csv_content = generate_csv_sync(tree)
            download_url, filename = save_temp_file(csv_content, f'arbol_{tree.id}.csv', 'text/csv')
            
            return Response({
                'download_url': download_url,
                'filename': f'arbol_{tree.id}.csv',
                'message': 'CSV generado exitosamente'
            })

        else:
            return Response(
                {'error': 'Formato no soportado. Use: json, pdf, csv'},
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