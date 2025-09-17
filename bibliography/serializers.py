from rest_framework import serializers
from .models import Bibliography

class BibliographySerializer(serializers.ModelSerializer):
    class Meta:
        model = Bibliography
        fields = ('id', 'nombre_archivo', 'archivo', 'fecha_subida', 'user')
        read_only_fields = ('id', 'fecha_subida', 'user')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class BibliographyListSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Bibliography
        fields = ('id', 'nombre_archivo', 'fecha_subida', 'archivo_url')
        read_only_fields = ('id', 'fecha_subida', 'archivo_url')
    
    def get_archivo_url(self, obj):
        request = self.context.get('request')
        if obj.archivo and request:
            return request.build_absolute_uri(obj.archivo.url)
        return None
