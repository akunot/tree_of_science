from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Bibliografia, ArbolCiencia
from .serializers import BibliografiaSerializer, ArbolCienciaSerializer
from .services import process_file_by_ext

class UploadBibliographyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        nombre = file.name
        bibliografia = Bibliografia.objects.create(
            usuario=request.user,
            nombre_archivo=nombre,
            archivo=file,
        )

        try:
            file_path = bibliografia.archivo.path
            tree = process_file_by_ext(file_path)
        except Exception as e:
            bibliografia.delete()
            return Response({"detail": f"Error procesando archivo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        arbol = ArbolCiencia.objects.create(bibliografia=bibliografia, arbol_json=tree)
        ser = ArbolCienciaSerializer(arbol)
        return Response(ser.data, status=status.HTTP_201_CREATED)


class UserBibliographiesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BibliografiaSerializer

    def get_queryset(self):
        return Bibliografia.objects.filter(usuario=self.request.user).order_by("-fecha_subida")


class RetrieveTreeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = ArbolCiencia.objects.all()
    serializer_class = ArbolCienciaSerializer
