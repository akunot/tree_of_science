from rest_framework import serializers
from .models import Tree
from bibliography.serializers import BibliographyListSerializer

class TreeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tree
        fields = ('seed', 'bibliography', 'title')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Aquí se generaría el árbol basado en la semilla
        # Por ahora, creamos un JSON de ejemplo
        validated_data['arbol_json'] = self.generate_tree_from_seed(validated_data['seed'])
        return super().create(validated_data)
    
    def generate_tree_from_seed(self, seed):
        """
        Función placeholder para generar el árbol de la ciencia
        En una implementación real, aquí iría la lógica para generar
        el árbol basado en la semilla y la bibliografía
        """
        return {
            "seed": seed,
            "nodes": [
                {"id": 1, "label": "Raíz", "type": "root", "children": [2, 3]},
                {"id": 2, "label": "Rama 1", "type": "branch", "children": [4, 5]},
                {"id": 3, "label": "Rama 2", "type": "branch", "children": [6]},
                {"id": 4, "label": "Hoja 1", "type": "leaf", "children": []},
                {"id": 5, "label": "Hoja 2", "type": "leaf", "children": []},
                {"id": 6, "label": "Hoja 3", "type": "leaf", "children": []}
            ],
            "metadata": {
                "generated_at": "2024-01-01T00:00:00Z",
                "algorithm_version": "1.0"
            }
        }

class TreeSerializer(serializers.ModelSerializer):
    bibliography = BibliographyListSerializer(read_only=True)
    
    class Meta:
        model = Tree
        fields = ('id', 'arbol_json', 'fecha_generado', 'bibliography', 'seed', 'title')
        read_only_fields = ('id', 'arbol_json', 'fecha_generado')

class TreeListSerializer(serializers.ModelSerializer):
    bibliography_name = serializers.CharField(source='bibliography.nombre_archivo', read_only=True)
    
    class Meta:
        model = Tree
        fields = ('id', 'title', 'seed', 'fecha_generado', 'bibliography_name')
        read_only_fields = ('id', 'fecha_generado', 'bibliography_name')