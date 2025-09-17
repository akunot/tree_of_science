from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.core import serializers as django_serializers
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
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
    Obtener historial de árboles generados por el usuario
    """
    trees = Tree.objects.filter(user=request.user)
    serializer = TreeListSerializer(trees, many=True)
    return Response(serializer.data)

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
    except Tree.DoesNotExist:
        raise Http404("Árbol no encontrado")

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
            
            # Título
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 750, f"Árbol de la Ciencia - {tree.title or f'ID: {tree.id}'}")
            
            # Información básica
            p.setFont("Helvetica", 12)
            y = 720
            p.drawString(100, y, f"Semilla: {tree.seed}")
            y -= 20
            p.drawString(100, y, f"Fecha de generación: {tree.fecha_generado.strftime('%Y-%m-%d %H:%M')}")
            y -= 20
            
            if tree.bibliography:
                p.drawString(100, y, f"Bibliografía: {tree.bibliography.nombre_archivo}")
                y -= 20
            
            # Datos del árbol (simplificado)
            y -= 20
            p.drawString(100, y, "Estructura del árbol:")
            y -= 20
            
            # Mostrar algunos nodos del árbol
            nodes = tree.arbol_json.get('nodes', [])
            for i, node in enumerate(nodes[:10]):  # Mostrar solo los primeros 10 nodos
                p.drawString(120, y, f"- {node.get('label', 'Nodo sin etiqueta')} ({node.get('type', 'tipo desconocido')})")
                y -= 15
                if y < 100:  # Nueva página si es necesario
                    p.showPage()
                    y = 750
            
            p.save()
            buffer.seek(0)
            
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="arbol_{tree.id}.pdf"'
            return response
            
        else:
            return Response({'error': 'Formato no soportado. Use: json, pdf'}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
    except Tree.DoesNotExist:
        raise Http404("Árbol no encontrado")

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
    except Tree.DoesNotExist:
        raise Http404("Árbol no encontrado")