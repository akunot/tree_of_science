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
        extra_kwargs = {
            'seed': {'required': True},
            'bibliography': {'required': True},
            'title': {'required': True},
        }

    def _get_type_label(self, group: str) -> str:
        """
        Devuelve una etiqueta legible para el tipo de nodo según su grupo dominante.
        Ajusta los textos si quieres otros nombres.
        """
        group = (group or '').lower()
        if group == 'root':
            return 'Raíz'
        if group == 'trunk':
            return 'Tronco'
        return 'Hoja' if group == 'leaf' else 'Desconocido'

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user

        # Obtener la instancia de la bibliografía y el archivo
        bibliography_instance = validated_data['bibliography']
        bibliography_file = bibliography_instance.archivo  # FieldFile

        # Generar el árbol usando la semilla y el archivo de bibliografía
        arbol_json = self.generate_tree_from_seed(validated_data['seed'], bibliography_file)

        # Crear la instancia del árbol y asignar el arbol_json
        return Tree.objects.create(**validated_data, arbol_json=arbol_json)

    def generate_tree_from_seed(self, seed, archivo):
        """
        Genera el árbol de la ciencia a partir de la semilla y la bibliografía.

        1) Lee el archivo de bibliografía (CSV/TXT).
        2) Genera y limpia el grafo con Sap.
        3) Extrae nodos, los filtra y clasifica.
        4) Si no hay nodos válidos, lanza error de validación.
        5) Calcula estadísticas y compone el JSON final optimizado.
        """
        from rest_framework.exceptions import ValidationError

        graph = self._build_graph_from_file(archivo)
        nodes_with_attributes, stats = self._extract_nodes_with_stats(graph)

        if not nodes_with_attributes:
            raise ValidationError(
                "No se pudo generar el árbol: el archivo de bibliografía no contiene información procesable."
            )

        links = self._extract_links(graph)
        return self._compose_transformed_data(seed, nodes_with_attributes, links, stats)

    def _build_graph_from_file(self, archivo):
        """
        Lee el archivo de bibliografía y construye el grafo base usando Sap.
        Lanza un error de validación si el archivo no es procesable.
        """
        from rest_framework.exceptions import ValidationError
        from bibx.exceptions import InvalidIsiLineError

        filename = (archivo.name or "").lower()

        try:
            if filename.endswith('.csv'):
                with archivo.open('rb') as f:
                    text_file = io.TextIOWrapper(f, encoding='utf-8')
                    corpus = read_scopus_csv(text_file)
            elif filename.endswith('.txt'):
                with archivo.open('rb') as f:
                    text_file = io.TextIOWrapper(f, encoding='utf-8')
                    corpus = read_wos(text_file)
            else:
                raise ValidationError(
                    "Formato de archivo de bibliografía no soportado. Use archivos CSV (Scopus) o TXT (WoS/ISI)."
                )
        except InvalidIsiLineError:
            # Archivo TXT no sigue el formato ISI/WoS esperado
            raise ValidationError(
                "El archivo de bibliografía no tiene el formato ISI/WoS válido. "
                "Verifique que haya sido exportado correctamente desde la base de datos."
            )
        except Exception as exc:
            # Cualquier otro error de parsing se reporta como archivo no procesable
            raise ValidationError(
                f"No se pudo procesar el archivo de bibliografía: {str(exc)}"
            )

        sap = Sap()
        graph = sap.create_graph(corpus)
        graph = sap.clean_graph(graph)
        graph = sap.tree(graph)
        return graph

    def _extract_nodes_with_stats(self, graph):
        """
        Recorre los nodos del grafo, filtra ruido, clasifica y acumula estadísticas.
        """
        nodes_with_attributes = []
        stats = {
            'roots': 0,
            'trunks': 0,
            'leaves': 0,
            'total_value': 0,
            'max_sap': 0,
            'min_sap': float('inf'),
        }

        for node_id, node_data in graph.nodes(data=True):
            node_dict, classification = self._build_node_dict(node_id, node_data)
            if node_dict is None:
                # Nodo descartado por falta de relevancia (total_value == 0)
                continue

            dominant_group, total_val, sap_val = classification

            # Actualizar contadores por grupo
            if dominant_group == 'root':
                stats['roots'] += 1
            elif dominant_group == 'trunk':
                stats['trunks'] += 1
            else:
                stats['leaves'] += 1

            # Actualizar estadísticas globales
            stats['total_value'] += total_val
            stats['max_sap'] = max(stats['max_sap'], sap_val)
            if sap_val > 0:
                stats['min_sap'] = min(stats['min_sap'], sap_val)

            nodes_with_attributes.append(node_dict)

        return nodes_with_attributes, stats

    def _build_node_dict(self, node_id, node_data):
        """
        Construye el diccionario de un nodo, determinando su grupo dominante
        y devolviendo también los valores relevantes para estadísticas.

        Retorna:
        - (node_dict, (dominant_group, total_val, sap_val)) si el nodo es válido.
        - (None, None) si el nodo se descarta por total_val == 0.
        """
        root_val = float(node_data.get('root', 0))
        trunk_val = float(node_data.get('trunk', 0))
        leaf_val = float(node_data.get('leaf', 0))
        total_val = root_val + trunk_val + leaf_val
        sap_val = float(node_data.get('_sap', 0))

        # FILTRADO CRÍTICO: eliminar nodos sin relevancia
        if total_val == 0:
            return None, None

        # Clasificación dominante
        if root_val > trunk_val and root_val > leaf_val:
            dominant_group = 'root'
        elif trunk_val > root_val and trunk_val > leaf_val:
            dominant_group = 'trunk'
        else:
            dominant_group = 'leaf'

        node_dict = {
            # Identificadores
            'id': str(node_id),
            'label': node_data.get('label', str(node_id)),

            # Valores de clasificación
            'root': root_val,
            'trunk': trunk_val,
            'leaf': leaf_val,
            'total_value': total_val,

            # PRE-CALCULADOS
            'group': dominant_group,
            'type_label': self._get_type_label(dominant_group),

            # Métricas importantes
            '_sap': sap_val,

            # Enlaces externos
            'url': node_data.get('url'),
            'doi': node_data.get('doi'),
            'pmid': node_data.get('pmid'),
            'arxiv_id': node_data.get('arxiv_id'),

            # Metadatos opcionales
            'year': node_data.get('year'),
            'authors': node_data.get('authors'),
            'times_cited': int(node_data.get('times_cited', 0)) if node_data.get('times_cited') else 0,
        }

        # Agregar atributos adicionales simples que no sean estándar
        for key, value in node_data.items():
            if key not in node_dict and isinstance(value, (int, float, str, bool, type(None))):
                node_dict[key] = value

        return node_dict, (dominant_group, total_val, sap_val)

    @staticmethod
    def _extract_links(graph):
        """
        Extrae los enlaces del grafo en formato node-link.
        """
        raw_data = nx.node_link_data(graph)
        return raw_data.get("links", [])

    @staticmethod
    def _compose_transformed_data(seed, nodes_with_attributes, links, stats):
        """
        Compone el diccionario final arbol_json con nodos, enlaces, estadísticas y metadatos.
        """
        # Ordenar por SAP descendente (más relevantes primero)
        nodes_with_attributes.sort(key=lambda x: x.get('_sap', 0), reverse=True)

        # Completar estadísticas finales
        stats['total'] = len(nodes_with_attributes)
        stats['min_sap'] = stats['min_sap'] if stats['min_sap'] != float('inf') else 0

        statistics = {
            "roots": stats['roots'],
            "trunks": stats['trunks'],
            "leaves": stats['leaves'],
            "total": stats['total'],
            "total_value": stats['total_value'],
            "average_sap": stats['total_value'] / stats['total'] if stats['total'] > 0 else 0,
            "max_sap": stats['max_sap'],
            "min_sap": stats['min_sap'],
        }

        metadata = {
            "algorithm_version": "2.0",
            "seed": seed,
            "total_nodes": len(nodes_with_attributes),
            "total_links": len(links),
            "generated_at": datetime.now().isoformat(),
            "optimization": "nodes_pre_filtered_and_classified",
        }

        return {
            "nodes": nodes_with_attributes,
            "links": links,
            "statistics": statistics,
            "metadata": metadata,
        }


class TreeSerializer(serializers.ModelSerializer):
    bibliography = BibliographyListSerializer(read_only=True)
    
    class Meta:
        model = Tree
        fields = ('id', 'arbol_json', 'fecha_generado', 'bibliography', 'seed', 'title')
        read_only_fields = ('id', 'arbol_json', 'fecha_generado')


class TreeListSerializer(serializers.ModelSerializer):
    bibliography_name = serializers.SerializerMethodField()
    nodes_count = serializers.SerializerMethodField()

    class Meta:
        model = Tree
        fields = (
            'id',
            'title',
            'seed',
            'fecha_generado',
            'bibliography_name',
            'nodes_count',
        )
        read_only_fields = ('id', 'fecha_generado', 'bibliography_name')

    def get_bibliography_name(self, obj):
        """
        Devuelve un nombre legible de la bibliografía asociada (si existe).
        Ajusta según tu modelo real de bibliografía.
        """
        if bibliography := getattr(obj, 'bibliography', None):
            return next(
                (
                    getattr(bibliography, attr)
                    for attr in ('nombre_archivo', 'file_name', 'name')
                    if hasattr(bibliography, attr)
                ),
                str(bibliography),
            )
        else:
            return None

    def get_nodes_count(self, obj):
        """
        Cuenta los nodos del arbol_json si existe.
        """
        arbol = getattr(obj, 'arbol_json', None) or {}
        nodes = arbol.get('nodes', [])
        try:
            return len(nodes)
        except TypeError:
            return 0