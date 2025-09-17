from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, Http404
from .models import Bibliography
from .serializers import BibliographySerializer, BibliographyListSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bibliography_list(request):
    """
    Obtener lista de bibliografías del usuario
    """
    bibliographies = Bibliography.objects.filter(user=request.user)
    serializer = BibliographyListSerializer(bibliographies, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def bibliography_upload(request):
    """
    Subir un archivo de bibliografía
    """
    serializer = BibliographySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        bibliography = serializer.save()
        return Response(BibliographyListSerializer(bibliography, context={'request': request}).data, 
                       status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bibliography_download(request, pk):
    """
    Descargar un archivo de bibliografía
    """
    try:
        bibliography = Bibliography.objects.get(pk=pk, user=request.user)
        response = HttpResponse(bibliography.archivo.read(), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{bibliography.nombre_archivo}"'
        return response
    except Bibliography.DoesNotExist:
        raise Http404("Bibliografía no encontrada")

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def bibliography_delete(request, pk):
    """
    Eliminar una bibliografía
    """
    try:
        bibliography = Bibliography.objects.get(pk=pk, user=request.user)
        bibliography.delete()
        return Response({'message': 'Bibliografía eliminada exitosamente.'})
    except Bibliography.DoesNotExist:
        raise Http404("Bibliografía no encontrada")