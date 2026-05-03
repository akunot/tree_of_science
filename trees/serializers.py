from rest_framework import serializers
from .models import Tree
from bibliography.serializers import BibliographyListSerializer
import networkx as nx
from datetime import datetime
from rest_framework.exceptions import ValidationError
from .science_tree_builder import ScienceTreeBuilder


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
        try:
            # Parámetros que mantienen la precisión del algoritmo
            # Solo optimizamos lo que no afecta la calidad del árbol
            return ScienceTreeBuilder(
                min_degree=1,
                min_cocitations=2,
                include_ghost_nodes=True,  # ✅ Mantener ghost nodes para completitud
                exclude_self_citations=True,
                use_jaro_winkler=True,   # ✅ Mantener deduplicación para evitar duplicados
                fast_sap=False,           # ✅ O(N) - rápido sin perder precisión
                use_lcc=True,
                leaf_window=5,
                top_trunk_limit=30,
                top_root_limit=20,
                top_leaf_limit=60,
                max_nodes=90,            # Mantener nodos completos
            ).build_from_file(archivo)
        except ValueError as e:
            raise ValidationError(str(e)) from e
        except Exception as exc:
            raise ValidationError(
                f"No se pudo procesar el archivo de bibliografía: {str(exc)}"
            ) from exc

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
            'sum_sap': 0,
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
            stats['sum_sap'] += sap_val
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

        # Clasificación dominante: ya viene calculada por ScienceTreeClassifier
        dominant_group = node_data.get('group', 'leaf')

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
            
            # Ghost node flag - importante para verificar precisión del algoritmo
            'is_ghost': node_data.get('_is_ghost', False),
        }

        # Agregar atributos adicionales simples que no sean estándar
        for key, value in node_data.items():
            if key not in node_dict and isinstance(value, (int, float, str, bool, type(None))):
                node_dict[key] = value

        # Asegurar que el flag is_ghost esté presente (copia defensiva)
        if '_is_ghost' in node_data:
            node_dict['is_ghost'] = node_data['_is_ghost']
        elif 'is_ghost' in node_data:
            node_dict['is_ghost'] = node_data['is_ghost']
        else:
            node_dict['is_ghost'] = False

        return node_dict, (dominant_group, total_val, sap_val)

    @staticmethod
    def _extract_links(graph):
        raw_data = nx.node_link_data(graph)
        # nx >= 3.0 usa "edges"; nx 2.x usaba "links"
        return raw_data.get("edges", raw_data.get("links", []))

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
            "average_sap": stats['sum_sap'] / stats['total'] if stats['total'] > 0 else 0,  
            "max_sap": stats['max_sap'],
            "min_sap": stats['min_sap'],
        }

        # Contar ghost nodes para estadísticas
        ghost_count = sum(bool(n.get('is_ghost', False))
                      for n in nodes_with_attributes)
        statistics['ghost_nodes'] = ghost_count
        statistics['corpus_nodes'] = stats['total'] - ghost_count

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