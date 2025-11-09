from rest_framework import serializers
from .models import Tree
from bibliography.serializers import BibliographyListSerializer
from .models import Bibliography
import networkx as nx
import json
from bibx import read_scopus_csv, read_wos, Sap
import io
from datetime import datetime


class TreeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tree
        fields = ('seed', 'bibliography', 'title')

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user

        # Obtener la instancia de la bibliografía y el archivo
        bibliography_instance = validated_data['bibliography']
        bibliography_file = bibliography_instance.archivo  # FieldFile

        # Generar el árbol usando la semilla y el archivo de bibliografía
        arbol_json = self.generate_tree_from_seed(validated_data['seed'], bibliography_file)

        # Crear la instancia del árbol y asignar el arbol_json
        tree_instance = Tree.objects.create(**validated_data, arbol_json=arbol_json)
        return tree_instance

    def generate_tree_from_seed(self, seed, archivo):
        """
        Genera el árbol de la ciencia a partir de la semilla y la bibliografía.
        Detecta el tipo de archivo de la bibliografía y usa la función adecuada.
        Retorna el grafo en formato JSON serializable compatible con el frontend.
        """
        filename = archivo.name.lower()

        # Leer archivo según tipo
        if filename.endswith('.csv'):
            with archivo.open('rb') as f:
                text_file = io.TextIOWrapper(f, encoding='utf-8')
                c = read_scopus_csv(text_file)
        elif filename.endswith('.txt'):
            with archivo.open('rb') as f:
                text_file = io.TextIOWrapper(f, encoding='utf-8')
                c = read_wos(text_file)
        else:
            raise ValueError("Formato de archivo de bibliografía no soportado.")

        # Generar árbol
        s = Sap()
        g = s.create_graph(c)
        g = s.clean_graph(g)
        g = s.tree(g)

        # CRÍTICO: Extraer nodos con TODOS sus atributos del grafo
        nodes_with_attributes = []
        for node_id, node_data in g.nodes(data=True):
            # node_data contiene TODOS los atributos del nodo
            node_dict = {
                'id': node_id,
                'label': node_data.get('label', node_id),
                # Extraer valores de clasificación (root, trunk, leaf)
                'root': float(node_data.get('root', 0)),
                'trunk': float(node_data.get('trunk', 0)),
                'leaf': float(node_data.get('leaf', 0)),
                # Extraer métricas importantes
                '_sap': float(node_data.get('_sap', 0)),
                # Enlaces externos (si existen)
                'url': node_data.get('url'),
                'doi': node_data.get('doi'),
                'pmid': node_data.get('pmid'),
                'arxiv_id': node_data.get('arxiv_id'),
            }
            
            # Agregar cualquier otro atributo que exista
            for key, value in node_data.items():
                if key not in node_dict and isinstance(value, (int, float, str, bool, type(None))):
                    node_dict[key] = value
            
            nodes_with_attributes.append(node_dict)

        # Obtener enlaces
        raw_data = nx.node_link_data(g)
        
        # TRANSFORMACIÓN: Adaptar al formato del frontend
        transformed_data = {
            "nodes": nodes_with_attributes,  # ← Usar nodos procesados
            "links": raw_data.get("links", []),
            "metadata": {
                "algorithm_version": "1.0",
                "seed": seed,
                "total_nodes": len(nodes_with_attributes),
                "generated_at": datetime.now().isoformat()
            }
        }
        
        return transformed_data

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