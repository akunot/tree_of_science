import os
import bibx
from bibx import Sap

def process_bibtex(file_path):
    # abrir archivo .bib
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        coleccion = bibx.load(f)  # parsear referencias en formato dict/list
    
    # elegir semilla: primer artículo de la colección
    articulo_semilla = next(iter(coleccion))
    
    # construir árbol con el algoritmo SAP
    tree = Sap.build_tree(articulo_semilla, coleccion)
    return tree


def process_file_by_ext(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".bib":
        return process_bibtex(file_path)
    else:
        raise ValueError(f"Formato no soportado: {ext}")
