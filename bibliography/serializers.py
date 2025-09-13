from rest_framework import serializers
from .models import Bibliografia, ArbolCiencia

class BibliografiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bibliografia
        fields = ("id", "nombre_archivo", "archivo", "fecha_subida")

class ArbolCienciaSerializer(serializers.ModelSerializer):
    bibliografia = BibliografiaSerializer(read_only=True)
    class Meta:
        model = ArbolCiencia
        fields = ("id", "bibliografia", "arbol_json", "fecha_generado")
