"""
science_tree_builder.py — Tree of Science (ToS) · Alta Precisión + Alto Rendimiento
=====================================================================================
Clasificación root/trunk/leaf basada en posición estructural en el grafo de citaciones.

Lógica del árbol de ciencia (grafo dirigido A→B = "A cita a B"):
  ROOT  : sink nodes   — in_degree > 0, out_degree = 0  (papers fundacionales)
  TRUNK : intermedios  — in_degree > 0, out_degree > 0  (conectores)
  LEAF  : source nodes — in_degree = 0                  (papers frontera / recientes)

CHANGELOG:
  v1 — Algoritmo base con ghost nodes
  v2 — Labels enriquecidos (V:P), exclusión de auto-citas
  v3 — SAP real BFS O(V+E), Jaro-Winkler puro, graph.simplify()
  v4 — FIX rendimiento JW (bucketing por apellido+año+vol/pág), fix Django CSV parser
  v5 — _generate_canonical_id, LCC filtering, SAP O(N) fast_sap, streaming BIB,
       reporte de rendimiento G.graph["_perf"].
  v6 — Clasificación temporal de hojas (leaf_window): año máximo dinámico,
       dead_leaf (hojas antiguas), isolated, eliminación de p75_tc heurístico.
  v7 — Tronco de élite (top_trunk_limit): branch/trunk, top-N por SAP,
       CLI --trunk-limit=N, atributo "branch" en nodos.
  v7.1 — HOTFIX: SAP=0 en roots y leaves. Separar SAP-de-ranking del SAP-final
         por tipo de nodo (root→in_degree, leaf→out_degree, trunk/branch→in×out).
  v8 — Filtros de élite para raíces y hojas: minor_root / minor_leaf,
       top_root_limit=20, top_leaf_limit=25. CLI: --root-limit / --leaf-limit.
  v9 — [Este archivo]
       FIX ScopusBibParser._entry: "references": [] hardcodeado → has_refs=False
       → MetadataOnlyClassifier generaba nodos con valores decimales en lugar
       del árbol estructural real.
       Cambios en _entry:
       1. refs_raw_str = f.get("references","").strip() — capta el campo si
          existe en el BIB; cadena vacía si el BIB de Scopus no lo exporta.
       2. "references": refs_ids — IDs normalizados (DOI o autor_año), misma
          lógica que ScopusCSVParser._parse_refs; ya no hardcodeado como [].
       3. "_refs_strings": refs_strings — strings crudos separados por ";",
          campo que faltaba y es necesario para Jaro-Winkler y ghost nodes.
"""


import csv, io, re, os, time, networkx as nx
from collections import defaultdict, Counter
from typing import Optional


# ═══════════════════════════════════════════════════════════════════════════════
# UTILIDADES COMPARTIDAS
# ═══════════════════════════════════════════════════════════════════════════════

# Stopwords para canonical_id (palabras sin valor semántico)
_STOP = frozenset({
    "a", "an", "the", "of", "in", "on", "and", "for", "to", "with",
    "by", "from", "is", "are", "that", "this", "at", "as", "or",
    "its", "via", "using", "based", "new",
})


def _generate_canonical_id(author: str, year: int, title: str) -> str:
    """
    Genera un identificador canónico semántico: PrimerAutor_Año_3PalabrasClave.
    """
    # PROTECCIÓN: Si el autor viene vacío o es una coma suelta
    author_str = (author or "").split(",")[0].strip()
    author_words = author_str.split()
    first_author = re.sub(r'\W+', '', author_words[0]).lower() if author_words else "unk"
    
    year_s = str(year) if year else "0000"
    
    # Palabras significativas del título (sin stopwords, solo alfanuméricas)
    words = re.findall(r'[a-z]+', (title or "").lower())
    sig   = [w for w in words if len(w) > 2 and w not in _STOP][:3]
    title_key = "_".join(sig) if sig else "unk"
    
    return f"{first_author}_{year_s}_{title_key}"


# ═══════════════════════════════════════════════════════════════════════════════
# PARSERS
# ═══════════════════════════════════════════════════════════════════════════════

class TextRecordParser:
    """
    Parser híbrido para archivos .txt exportados desde Web of Science (ISI)
    o Scopus (Plain Text).

    · O(1) de memoria por línea en el path WoS (streaming).
    · O(N) proporcional al número de registros en el path Scopus.
    · Mismo contrato de salida para ambos formatos (dict con las
      mismas claves: id, label, title, authors, year, doi, times_cited,
      references, _refs_raw, url, source).
    """

    # =========================================================================
    # ENRUTADOR PRINCIPAL
    # =========================================================================

    def parse(self, file_obj) -> list:
        """
        Lee el archivo completo, detecta el formato y delega al parser
        correspondiente.

        Detección:
          · "Scopus" en las primeras líneas  → _parse_scopus_txt()
          · "EXPORT DATE:" en las primeras líneas → _parse_scopus_txt()
          · Cualquier otro caso              → _parse_wos_isi()
        """
        text = file_obj.read() if hasattr(file_obj, "read") else file_obj
        if isinstance(text, bytes):
            text = text.decode("utf-8", errors="replace")
        text = text.lstrip("\ufeff")

        # Inspeccionar solo el encabezado para minimizar trabajo de detección
        head = text[:500]
        if re.search(r'^Scopus\b', head, re.MULTILINE) or "EXPORT DATE:" in head:
            return self._parse_scopus_txt(text)
        return self._parse_wos_isi(text)

    # =========================================================================
    # PATH WoS ISI — lógica ORIGINAL sin ninguna modificación
    # =========================================================================

    def _parse_wos_isi(self, text: str) -> list:
        """
        Contenido exacto del método parse() original de WoSParser.
        No se modificó ninguna línea de la lógica interna.
        Procesamiento en streaming línea a línea — O(1) de memoria.
        """
        papers, current, current_tag, in_cr = [], {}, None, False
        for line in text.splitlines():
            if line.strip() == "ER":
                if current:
                    papers.append(self._finalize(current))
                current, current_tag, in_cr = {}, None, False
                continue
            if line.startswith("   "):
                val = line.strip()
                if in_cr:
                    current.setdefault("_refs", []).append(val)
                elif current_tag and current_tag in current:
                    v = current[current_tag]
                    current[current_tag] = (v if isinstance(v, list) else [v]) + [val]
                continue
            if (len(line) >= 3 and line[2] == " "
                    and line[:2].upper() == line[:2]
                    and not line[:2].isspace()):
                tag, val = line[:2], line[3:].strip()
                current_tag = tag
                in_cr = (tag == "CR")
                if in_cr:
                    if val:
                        current.setdefault("_refs", []).append(val)
                elif tag in current:
                    v = current[tag]
                    current[tag] = (v if isinstance(v, list) else [v]) + [val]
                else:
                    current[tag] = val
        return papers

    def _finalize(self, r: dict) -> dict:
        """_finalize original de WoSParser — sin modificaciones."""
        def j(v): return " ".join(v) if isinstance(v, list) else (v or "")
        def i(v):
            try: return int(str(v).strip())
            except: return 0

        title   = j(r.get("TI", ""))
        doi     = (r.get("DI", "") or "").strip()
        if isinstance(doi, list): doi = doi[0].strip()
        authors = r.get("AU", [])
        if isinstance(authors, str): authors = [authors]
        year    = i(r.get("PY", ""))
        refs    = self._parse_refs(r.get("_refs", []))

        pid = doi or _generate_canonical_id(
            authors[0] if authors else "", year, title
        )
        return {
            "id": pid, "label": title, "title": title, "authors": authors,
            "year": year, "doi": doi or None,
            "times_cited": i(r.get("TC", "0")),
            "references": refs,
            "_refs_raw": r.get("_refs", []),   # strings crudos para ghost nodes
            "url": None, "source": "wos",
        }

    # =========================================================================
    # PATH Scopus Plain Text — parser NUEVO
    # =========================================================================

    # Palabras clave que identifican el inicio de la sección de metadatos/refs
    _SCOPUS_FOOTER_RE = re.compile(
        r'^(REFERENCES:|DOCUMENT TYPE:|PUBLICATION STAGE:|OPEN ACCESS:)',
        re.MULTILINE,
    )

    def _parse_scopus_txt(self, text: str) -> list:
        """
        Parsea archivos .txt exportados desde Scopus en formato Plain Text.

        Estructura del archivo:
          • Encabezado: "Scopus\\nEXPORT DATE: DD Month YYYY"
          • Registros separados por líneas en blanco, donde cada registro
            ocupa DOS bloques consecutivos (separados por \\n\\n):
              CHUNK-A: autores / AUTHOR FULL NAMES / IDs / título /
                       (año) revista "Cited X times." / DOI: ... / URL
              CHUNK-B: REFERENCES: ref1; ref2; ...
                       DOCUMENT TYPE: ...
                       PUBLICATION STAGE: ...
                       [OPEN ACCESS: ...]
        """
        # Dividir en bloques por una o más líneas en blanco
        chunks = [c.strip() for c in re.split(r'\n{2,}', text) if c.strip()]

        # Saltar chunk(s) de encabezado
        i = 0
        while i < len(chunks) and re.match(
            r'^(Scopus\b|EXPORT DATE:)', chunks[i], re.IGNORECASE
        ):
            i += 1

        papers: list = []
        while i < len(chunks):
            chunk_a = chunks[i]
            i += 1

            # El chunk siguiente es el pie del registro si empieza con
            # REFERENCES:, DOCUMENT TYPE: o PUBLICATION STAGE:
            chunk_b = ""
            if i < len(chunks) and self._SCOPUS_FOOTER_RE.match(chunks[i]):
                chunk_b = chunks[i]
                i += 1

            if p := self._parse_scopus_record(chunk_a, chunk_b):
                papers.append(p)

        return papers

    def _parse_scopus_record(
        self, chunk_a: str, chunk_b: str
    ) -> Optional[dict]:
        """
        Extrae los campos de un registro Scopus Plain Text a partir de
        los dos bloques que lo componen (ver _parse_scopus_txt).

        Campos extraídos con regex:
          title        — línea inmediatamente anterior a la línea "(año) …"
          year         — primer grupo (\\d{4}) en la línea de info
          times_cited  — "Cited X times" en la línea de info
          doi          — "DOI: 10.xxx" en chunk_a
          authors      — línea "AUTHOR FULL NAMES: …" (sin IDs numéricos)
          _refs_raw    — todo el texto tras "REFERENCES:" dividido por ";"
          references   — IDs normalizados vía _parse_refs() compartida
        """
        def to_int(v: str) -> int:
            try:
                return int(v.strip())
            except: return 0

        lines = [ln for ln in chunk_a.splitlines() if ln.strip()]
        if not lines:
            return None

        # ── Authors ──────────────────────────────────────────────────────────
        full_names_m = re.search(
            r'^AUTHOR FULL NAMES:\s*(.+)$', chunk_a, re.MULTILINE
        )
        if full_names_m:
            raw_names = full_names_m.group(1)
            authors = [
                re.sub(r'\s*\(\d+\)', '', n).strip()
                for n in raw_names.split(';')
                if n.strip() and re.search(r'[A-Za-z]', n)
            ]
        else:
            # Fallback: primera línea con los nombres cortos
            authors = [
                a.strip() for a in lines[0].split(',')
                if a.strip() and re.search(r'[A-Za-z]', a)
            ]

        # ── Título ───────────────────────────────────────────────────────────
        # El título es la línea que precede inmediatamente a la línea "(año) …"
        title = ""
        for idx, line in enumerate(lines):
            if re.match(r'^\(\d{4}\)', line.strip()):
                title = lines[idx - 1].strip() if idx > 0 else ""
                break

        # ── Año y veces citado ────────────────────────────────────────────────
        year, times_cited = 0, 0
        for line in lines:
            m = re.match(r'^\((\d{4})\)', line.strip())
            if m:
                year = to_int(m.group(1))
                cm   = re.search(r'Cited\s+(\d+)\s+times', line, re.I)
                times_cited = to_int(cm.group(1)) if cm else 0
                break

        # ── DOI ───────────────────────────────────────────────────────────────
        doi_m = re.search(r'^DOI:\s*(10\.\S+)', chunk_a, re.MULTILINE | re.I)
        doi   = doi_m.group(1).rstrip('.,)') if doi_m else ""

        # ── Referencias ───────────────────────────────────────────────────────
        # Captura todo el texto entre "REFERENCES:" y la siguiente sección
        # de metadatos (DOCUMENT TYPE / PUBLICATION STAGE / OPEN ACCESS).
        refs_raw: list = []
        refs_ids: list = []
        if chunk_b:
            refs_m = re.search(
                r'^REFERENCES:\s*(.*?)(?=\n(?:DOCUMENT TYPE|PUBLICATION STAGE|OPEN ACCESS):|\Z)',
                chunk_b,
                re.DOTALL | re.MULTILINE,
            )
            if refs_m:
                refs_block = refs_m.group(1)
                # Dividir por ";" y limpiar entradas vacías
                refs_raw = [r.strip() for r in refs_block.split(';') if r.strip()]
                # ✅ Reutiliza la misma función estática _parse_refs que WoS
                refs_ids = self._parse_refs(refs_raw)

        # ── ID del paper ──────────────────────────────────────────────────────
        pid = doi or _generate_canonical_id(
            authors[0] if authors else "", year, title
        )

        return {
            "id":          pid,
            "label":       title,
            "title":       title,
            "authors":     authors,
            "year":        year,
            "doi":         doi or None,
            "times_cited": times_cited,
            "references":  refs_ids,
            "_refs_raw":   refs_raw,   # strings crudos para ghost nodes / JW
            "url":         None,
            "source":      "scopus_txt",
        }

    @staticmethod
    def _parse_refs(refs: list) -> list:
        ids: list = []
        seen: set = set()
        for ref in refs:
            if m := re.search(r'DOI\s+(10\.\S+)', ref, re.IGNORECASE):
                rid = m[1].rstrip(",. ").lower()
            else:
                parts = [p.strip() for p in ref.split(",")]

                # PROTECCIÓN: Extraer autor en Web of Science
                author_words = parts[0].split() if parts else []
                a = author_words[0].lower() if author_words else "unk"

                if ym := re.search(r'\((\d{4})\)', ref):
                    y = ym[1]
                else:
                    y = parts[1].strip()[:4] if len(parts) > 1 else "0000"
                rid = f"{a}_{y}"
            if rid not in seen:
                seen.add(rid)
                ids.append(rid)
        return ids


class ScopusCSVParser:
    """
    Parser para exportaciones Scopus en CSV.
    Detecta modo binario por comportamiento (no herencia) para compatibilidad
    con Django FieldFile, BytesIO y archivos abiertos normalmente.
    """

    def parse(self, file_obj) -> list:
        # Detectar binario por comportamiento: lee 1 byte de prueba
        if isinstance(file_obj, bytes):
            file_obj = io.StringIO(file_obj.decode("utf-8-sig"))
        else:
            probe = file_obj.read(1)
            if isinstance(probe, bytes):
                rest = file_obj.read()
                file_obj = io.TextIOWrapper(
                    io.BytesIO(probe + rest), encoding="utf-8-sig"
                )
            else:
                rest = file_obj.read()
                file_obj = io.StringIO(probe + rest)
        return [self._row(r) for r in csv.DictReader(file_obj)]

    def _row(self, row: dict) -> dict:
        def i(v):
            try: return int(str(v or "0").strip())
            except: return 0

        title    = row.get("Title", "").strip()
        doi      = row.get("DOI", "").strip()
        year     = i(row.get("Year", ""))
        tc       = i(row.get("Cited by", "0") or "0")
        authors  = [a.strip() for a in (row.get("Authors", "") or "").split(";") if a.strip()]
        refs_str = row.get("References", "")

        refs         = self._parse_refs(refs_str)
        refs_strings = [r.strip() for r in refs_str.split(";") if r.strip()] if refs_str else []

        pid = doi or _generate_canonical_id(
            authors[0] if authors else "", year, title
        )
        return {
            "id": pid, "label": title, "title": title, "authors": authors,
            "year": year, "doi": doi or None, "times_cited": tc,
            "references": refs,
            "_refs_strings": refs_strings,   # strings crudos para ghost nodes / JW
            "url": (row.get("Link") or "").strip() or None,
            "source": "scopus_csv",
        }

    @staticmethod
    def _parse_refs(s: str) -> list:
        if not s.strip():
            return []
        ids: list = []
        seen: set = set()    # set() para dedup O(1)
        for ref in s.split(";"):
            ref = ref.strip()
            if not ref: continue
            if m := re.search(r'10\.\d{4,}/\S+', ref):
                rid = m[0].rstrip(",. )").lower()
            else:
                ym = re.search(r'\((\d{4})\)', ref)
                y  = ym[1] if ym else "0000"
                
                # PROTECCIÓN: Extraer autor de la referencia
                ref_first_part = ref.split(",")[0].strip() if ref else ""
                ref_words = ref_first_part.split()
                a = ref_words[0].lower() if ref_words else "unk"
                
                rid = f"{a}_{y}"
            if rid not in seen:
                seen.add(rid)
                ids.append(rid)
        return ids


class ScopusBibParser:
    """
    Parser para archivos BibTeX exportados por Scopus.
    Generador incremental de entradas: evita cargar todo el archivo en
    una lista intermedia antes de procesar.
    """

    def parse(self, file_obj) -> list:
        text = file_obj.read() if hasattr(file_obj, "read") else file_obj
        if isinstance(text, bytes):
            text = text.decode("utf-8", errors="replace")
        text = text.lstrip("\ufeff")
        # Generador incremental: procesa cada entrada sin acumularlas todas
        return [p for p in self._iter_entries(text) if p]

    def _iter_entries(self, text: str):
        """Generador: yield un paper por cada entrada @ARTICLE/@INPROCEEDINGS/..."""
        for entry in re.finditer(r'@\w+\s*\{[^@]+', text, re.DOTALL):
            yield self._entry(entry.group(0))

    def _entry(self, e: str) -> Optional[dict]:
        if not re.match(r'@\w+\s*\{', e):
            return None
        f = {
            m.group(1).lower(): (m.group(2) or m.group(3) or m.group(4) or "").strip()
            for m in re.finditer(
                r'(\w+)\s*=\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)"|([\w\d]+))',
                e, re.DOTALL
            )
        }
        title   = f.get("title", "").strip("{} \n")
        doi     = f.get("doi", "").strip("{} \n")
        try:    year = int(f.get("year", "0").strip("{} \n")[:4])
        except: year = 0
        cm = re.search(r'Cited by:\s*(\d+)', f.get("note", ""), re.IGNORECASE)
        tc = int(cm[1]) if cm else 0
        authors = [a.strip() for a in re.split(r'\s+and\s+', f.get("author", ""), flags=re.IGNORECASE) if a.strip()]

        pid = doi.strip() or _generate_canonical_id(
            authors[0] if authors else "", year, title
        )

        # ── Referencias: extraer del campo BibTeX si existe ───────────────────
        # Scopus BIB estándar no exporta referencias; si el campo está presente
        # (e.g. BIB generados por otras herramientas), lo procesamos correctamente.
        refs_raw_str  = f.get("references", "").strip("{} \n")
        # Strings crudos: necesarios para Jaro-Winkler y ghost nodes
        refs_strings  = [r.strip() for r in refs_raw_str.split(";") if r.strip()]
        # IDs normalizados: DOI si existe, si no → autor_año (mismo formato que CSV)
        refs_ids: list = []
        seen_ids: set  = set()
        for ref in refs_strings:
            if m := re.search(r'10\.\d{4,}/\S+', ref):
                rid = m[0].rstrip(",. )").lower()
            else:
                ym  = re.search(r'\((\d{4})\)', ref)
                y   = ym[1] if ym else "0000"
                a   = ref.split(",")[0].split()[0].lower() if ref else "unk"
                rid = f"{a}_{y}"
            if rid not in seen_ids:
                seen_ids.add(rid)
                refs_ids.append(rid)

        return {
            "id": pid, "label": title, "title": title, "authors": authors,
            "year": year, "doi": doi or None, "times_cited": tc,
            "references":    refs_ids,      # IDs normalizados para construir aristas
            "_refs_strings": refs_strings,  # strings crudos para JW y ghost nodes
            "url": f.get("url", "").strip("{} \n") or None,
            "source": "scopus_bib",
        }


class ScopusRISParser:
    """Parser para archivos RIS exportados por Scopus."""

    def parse(self, file_obj) -> list:
        text = file_obj.read() if hasattr(file_obj, "read") else file_obj
        if isinstance(text, bytes):
            text = text.decode("utf-8", errors="replace")
        text = text.lstrip("\ufeff")
        papers, cur = [], defaultdict(list)
        for line in text.splitlines():
            if line.startswith("ER  -"):
                if cur:
                    papers.append(self._fin(dict(cur)))
                cur = defaultdict(list)
                continue
            if m := re.match(r'^([A-Z][A-Z0-9])\s{2}-\s*(.*)', line):
                cur[m[1]].append(m[2].strip())
        return papers

    def _fin(self, r: dict) -> dict:
        def f(t): return (r.get(t) or [""])[0]
        title = f("TI")
        doi   = f("DO").strip()
        try:    year = int((f("PY") or "0")[:4])
        except: year = 0
        cm = re.search(r'Cited By:\s*(\d+)', f("N1"), re.IGNORECASE)
        tc = int(cm[1]) if cm else 0
        authors = r.get("AU", [])
        pid = doi or _generate_canonical_id(
            authors[0] if authors else "", year, title
        )
        return {
            "id": pid, "label": title, "title": title, "authors": authors,
            "year": year, "doi": doi or None, "times_cited": tc,
            "references": [],
            "url": f("UR") or None,
            "source": "scopus_ris",
        }


# ═══════════════════════════════════════════════════════════════════════════════
# DEDUPLICADOR JARO-WINKLER (con bucketing eficiente)
# ═══════════════════════════════════════════════════════════════════════════════

class JaroWinklerDeduplicator:
    """
    Fusiona variantes tipográficas de la misma referencia.

    Bucketing por (apellido + año + vol/pág) → O(n·k) comparaciones.
    Guards DOI/año/volumen previenen fusiones erróneas entre papers distintos.
    """

    def __init__(self, threshold: float = 0.96):
        self.threshold = threshold

    # ── Jaro-Winkler puro (sin dependencias externas) ──────────────────────────

    @staticmethod
    def _jaro(s1: str, s2: str) -> float:
        if s1 == s2: return 1.0
        l1, l2 = len(s1), len(s2)
        if l1 == 0 or l2 == 0: return 0.0
        dist = max(l1, l2) // 2 - 1
        s1m = [False] * l1; s2m = [False] * l2
        matches = 0
        for i in range(l1):
            lo = max(0, i - dist); hi = min(i + dist + 1, l2)
            for j in range(lo, hi):
                if s2m[j] or s1[i] != s2[j]: continue
                s1m[i] = s2m[j] = True; matches += 1; break
        if matches == 0: return 0.0
        k = t = 0
        for i in range(l1):
            if not s1m[i]: continue
            while not s2m[k]: k += 1
            if s1[i] != s2[k]: t += 1
            k += 1
        return (matches / l1 + matches / l2 + (matches - t / 2) / matches) / 3

    def similarity(self, s1: str, s2: str, p: float = 0.1) -> float:
        j = self._jaro(s1, s2)
        prefix = sum(a == b for a, b in zip(s1[:4], s2[:4]))
        return j + prefix * p * (1 - j)

    # ── Guards ─────────────────────────────────────────────────────────────────

    @staticmethod
    def _extract(pattern: str, s: str) -> Optional[str]:
        m = re.search(pattern, s)
        return m.group(1) if m else None

    def _should_merge(self, s1: str, s2: str) -> bool:
        d1 = self._extract(r'DOI\s+(\S+)', s1); d2 = self._extract(r'DOI\s+(\S+)', s2)
        if d1 and d2 and d1.lower() != d2.lower(): return False
        y1 = self._extract(r',\s*(\d{4})\s*,', s1); y2 = self._extract(r',\s*(\d{4})\s*,', s2)
        if y1 and y2 and y1 != y2: return False
        v1 = self._extract(r',\s*V(\d+)\s*,', s1); v2 = self._extract(r',\s*V(\d+)\s*,', s2)
        if v1 and v2 and v1 != v2: return False
        return self.similarity(s1, s2) > self.threshold

    # ── Claves de bucket por formato ───────────────────────────────────────────

    @staticmethod
    def _key_wos(ref_str: str) -> str:
        """WoS: apellido(6) + año + volumen(3)"""
        parts = [p.strip() for p in ref_str.split(",")]
        last  = parts[0].split()[0].lower() if parts else "unk"
        year  = parts[1].strip()[:4] if len(parts) > 1 else "0000"
        vm    = re.search(r'\bV(\d+)\b', ref_str)
        vol   = vm[1][:3] if vm else ""
        return f"{last[:6]}_{year}_{vol}"

    @staticmethod
    def _key_csv(ref_str: str) -> str:
        """CSV: apellido(6) + año + primera_página(3)"""
        last = ref_str.split(",")[0].strip().split()[0].lower() if ref_str else "unk"
        ym   = re.search(r'\((\d{4})\)', ref_str)
        year = ym[1] if ym else "0000"
        pm   = re.search(r'pp\.\s*(\d+)', ref_str)
        page = pm[1][:3] if pm else ""
        return f"{last[:6]}_{year}_{page}"

    def build_duplicates(self, labels: list, fmt: str = ".txt") -> dict:
        """
        Devuelve {variante → canónico}.
        fmt: ".txt" para WoS, ".csv" para Scopus CSV.
        """
        key_fn = self._key_wos if fmt == ".txt" else self._key_csv
        buckets: dict = defaultdict(list)
        for lbl in labels:
            buckets[key_fn(lbl)].append(lbl)
        duplicates: dict = {}
        for bucket in buckets.values():
            if len(bucket) <= 1: continue
            sorted_b = sorted(bucket)
            for i in range(len(sorted_b)):
                canon = duplicates.get(sorted_b[i], sorted_b[i])
                for j in range(i + 1, len(sorted_b)):
                    if self._should_merge(canon, sorted_b[j]):
                        duplicates[sorted_b[j]] = canon
        return duplicates


# ═══════════════════════════════════════════════════════════════════════════════
# CLASIFICADOR
# ═══════════════════════════════════════════════════════════════════════════════

class ScienceTreeClassifier:
    """
    Clasifica nodos y calcula SAP (flujo de savia).

    Clasificación estructural O(N) — v8:
      ROOT       : out_degree == 0  AND  in_degree > 0  AND  top-N por in_degree
                   (élite de fundacionales: los top_root_limit más citados)
      MINOR_ROOT : out_degree == 0  AND  in_degree > 0  AND  fuera del top-N
                   (fundacionales de menor impacto — ocultos en el árbol visible)
      TRUNK      : in_degree > 0   AND  out_degree > 0  AND  top-N por SAP in×out
                   (élite de conectores: los top_trunk_limit con mayor flujo)
      BRANCH     : in_degree > 0   AND  out_degree > 0  AND  fuera del top-N trunk
                   (conectores secundarios; visibles pero no forman el tronco)
      LEAF       : in_degree == 0  AND  out_degree > 0
                   AND  año >= año_maximo - leaf_window  AND  top-N por out_degree
                   (élite del frente de investigación reciente)
      MINOR_LEAF : in_degree == 0  AND  out_degree > 0
                   AND  año >= año_maximo - leaf_window  AND  fuera del top-N leaf
                   (hojas activas de menor conectividad — ocultas en el árbol visible)
      DEAD_LEAF  : in_degree == 0  AND  out_degree > 0
                   AND  año < año_maximo - leaf_window   (papers antiguos sin receptores)
      ISOLATED   : in_degree == 0  AND  out_degree == 0  (sin conexiones)

    Grupos visibles en el árbol final: root, trunk, branch, leaf.
    Grupos ocultos (eliminados por _apply_max_nodes): minor_root, minor_leaf,
    dead_leaf, isolated.
    """

    def __init__(self, fast_sap: bool = True, leaf_window: int = 5,
                 top_trunk_limit: int = 20, top_root_limit: int = 10,
                 top_leaf_limit: int = 40):
        """
        fast_sap        : True → SAP O(N) por grado (defecto, recomendado).
                          False → SAP O(V+E) por BFS (mayor fidelidad ToS).
        leaf_window     : ventana temporal en años para leaf activa (defecto 5).
        top_trunk_limit : máximo de intermediarios que forman el tronco (defecto 20).
        top_root_limit  : máximo de raíces visibles, ordenadas por in_degree (defecto 10).
        top_leaf_limit  : máximo de hojas visibles, ordenadas por out_degree (defecto 40).
        """
        self.fast_sap        = fast_sap
        self.leaf_window     = leaf_window
        self.top_trunk_limit = top_trunk_limit
        self.top_root_limit  = top_root_limit
        self.top_leaf_limit  = top_leaf_limit

    def classify(self, G: nx.DiGraph) -> nx.DiGraph:
        if not G.nodes:
            return G

        # ── 1. Año máximo dinámico del dataset ────────────────────────────────
        años_validos: list = []
        for _, d in G.nodes(data=True):
            try:
                if d.get("year"):
                    años_validos.append(int(d["year"]))
            except (ValueError, TypeError):
                pass
        año_maximo            = max(años_validos, default=2026)
        limite_temporal_hojas = año_maximo - self.leaf_window

        # ── 2. Clasificación base ─────────────────────────────────────────────
        # Pre-calcular grados en un solo pase
        in_deg  = dict(G.in_degree())
        out_deg = dict(G.out_degree())

        intermedios_temp: list = []   # candidatos a trunk (in>0, out>0)

        for n in G.nodes():
            ndata = G.nodes[n]
            ind   = in_deg[n]
            outd  = out_deg[n]

            # SAP de ranking: in×out solo tiene sentido para intermediarios
            # (root: outd=0 → 0; leaf: ind=0 → 0). Se usa exclusivamente para
            # ordenar candidatos a trunk en el paso 3; se sobreescribe después.
            ndata["_sap"] = ind * outd

            # Año del nodo — robusto ante None y strings inválidos
            try:
                año_nodo = int(ndata.get("year", 0) or 0)
            except (ValueError, TypeError):
                año_nodo = 0

            # ROOTS: fundacionales — solo reciben citas
            if outd == 0 and ind > 0:
                ndata["group"] = "root"

            # LEAVES: frente de investigación (con filtro temporal)
            elif ind == 0 and outd > 0:
                ndata["group"] = "leaf" if año_nodo >= limite_temporal_hojas else "dead_leaf"

            # INTERMEDIOS: conectores — candidatos a trunk o branch
            elif ind > 0 and outd > 0:
                ndata["group"] = "branch"   # etiqueta provisional
                intermedios_temp.append(n)

            # ISOLATED: sin aristas (raro tras LCC)
            else:
                ndata["group"] = "isolated"

        # ── 3. Filtro de tronco estricto (Top SAP) ───────────────────────────
        # Ordenar candidatos de mayor a menor in×out y promover la élite a "trunk"
        intermedios_ordenados = sorted(
            intermedios_temp,
            key=lambda x: G.nodes[x]["_sap"],
            reverse=True
        )
        trunk_set = set(intermedios_ordenados[:self.top_trunk_limit])
        for n in intermedios_temp:
            if n in trunk_set:
                G.nodes[n]["group"] = "trunk"
            # los demás quedan como "branch" (ya asignado arriba)

        # ── 4. Filtro de élite para raíces (Top in_degree) ───────────────────
        # Solo los top_root_limit clásicos más citados permanecen como "root".
        # Los demás reciben "minor_root" y serán eliminados del árbol visible.
        raices_temp = [n for n, d in G.nodes(data=True) if d.get("group") == "root"]
        raices_ordenadas = sorted(raices_temp, key=lambda x: in_deg[x], reverse=True)
        for n in raices_ordenadas[self.top_root_limit:]:
            G.nodes[n]["group"] = "minor_root"

        # ── 5. Filtro de élite para hojas (Top out_degree) ───────────────────
        # Solo las top_leaf_limit hojas más conectadas permanecen como "leaf".
        # Las demás reciben "minor_leaf" y serán eliminadas del árbol visible.
        hojas_temp = [n for n, d in G.nodes(data=True) if d.get("group") == "leaf"]
        hojas_ordenadas = sorted(hojas_temp, key=lambda x: out_deg[x], reverse=True)
        for n in hojas_ordenadas[self.top_leaf_limit:]:
            G.nodes[n]["group"] = "minor_leaf"

        # ── 6. SAP final O(N): fórmula correcta por tipo de nodo ─────────────
        # IMPORTANTE: sobreescribe el _sap de ranking del paso 2.
        #   root / minor_root  → in_degree   (cuántos papers del corpus los citan)
        #   trunk / branch     → in×out      (proxy de flujo — ya correcto)
        #   leaf / minor_leaf / dead_leaf → out_degree (amplitud del frente)
        #   isolated           → 0
        if self.fast_sap:
            for n in G.nodes():
                g    = G.nodes[n]["group"]
                ind  = in_deg[n]
                outd = out_deg[n]
                if g in ("root", "minor_root"):
                    G.nodes[n]["_sap"] = ind
                elif g in ("trunk", "branch"):
                    pass          # in×out ya está calculado y es correcto
                elif g in ("leaf", "minor_leaf", "dead_leaf"):
                    G.nodes[n]["_sap"] = outd
                else:             # isolated
                    G.nodes[n]["_sap"] = 0
        else:
            # Modo BFS O(V+E): mayor fidelidad ToS (sobreescribe todo)
            sap_bfs = self._sap_bfs(G, in_deg)
            for n, val in sap_bfs.items():
                G.nodes[n]["_sap"] = val

        # ── 7. Normalizar y escribir atributos finales ────────────────────────
        max_sap = max((G.nodes[n]["_sap"] for n in G.nodes), default=1) or 1
        for n in G.nodes:
            ndata = G.nodes[n]
            s     = ndata["_sap"]
            g     = ndata["group"]
            ndata["_sap_norm"]   = s / max_sap
            # Compatibilidad con serializer Django (campos root/trunk/leaf históricos).
            # minor_root/minor_leaf heredan los scores de root/leaf para coherencia
            # métrica, pero serán eliminados del grafo visible por _apply_max_nodes.
            ndata["root"]        = s if g in ("root", "minor_root")               else 0
            ndata["trunk"]       = s if g == "trunk"                              else 0
            ndata["leaf"]        = s if g in ("leaf", "minor_leaf", "dead_leaf")  else 0
            ndata["branch"]      = s if g == "branch"                             else 0
            ndata["total_value"] = s

        return G

    def _sap_bfs(self, G: nx.DiGraph, in_deg: dict) -> dict:
        """
        SAP O(V+E) por BFS — modo preciso (fast_sap=False).

        minor_root y minor_leaf participan en el BFS igual que root y leaf
        (tienen la misma posición estructural; solo difieren en si son visibles).
        trunk y branch son conectores equivalentes.
        dead_leaf, isolated reciben valores directos sin BFS.
        """
        roots      = [n for n, d in G.nodes(data=True) if d["group"] in ("root", "minor_root")]
        leaves     = [n for n, d in G.nodes(data=True) if d["group"] in ("leaf", "minor_leaf")]
        dead_leaves= [n for n, d in G.nodes(data=True) if d["group"] == "dead_leaf"]
        connectors = [n for n, d in G.nodes(data=True)
                      if d["group"] in ("trunk", "branch")]
        result: dict = {n: 0 for n in G.nodes()}

        for r in roots:
            result[r] = in_deg[r]

        for leaf in leaves:
            lengths      = nx.single_source_shortest_path_length(G, leaf)
            result[leaf] = sum(r in lengths for r in roots)

        # dead_leaf: proxy directo (no participan en flujo de trunks/branches)
        for dl in dead_leaves:
            result[dl] = G.out_degree(dl)

        G_rev = G.reverse(copy=False)
        for c in connectors:
            result[c] += sum(
                result[r]
                for r in roots
                if r in nx.single_source_shortest_path_length(G, c)
            )
            result[c] += sum(
                result[lf]
                for lf in leaves
                if lf in nx.single_source_shortest_path_length(G_rev, c)
            )

        return result


# ═══════════════════════════════════════════════════════════════════════════════
# CLASIFICADOR POR METADATOS (BIB/RIS sin referencias)
# ═══════════════════════════════════════════════════════════════════════════════

class MetadataOnlyClassifier:
    def classify(self, papers: list, ref_year: int = 2025) -> list:
        if not papers:
            return papers
        cites_nz = sorted(c for c in (p.get("times_cited", 0) for p in papers) if c > 0)
        p75 = cites_nz[int(len(cites_nz) * 0.75)] if cites_nz else 1
        mc  = max(p.get("times_cited", 0) for p in papers) or 1
        res = []
        for p in papers:
            c   = p.get("times_cited", 0)
            yr  = p.get("year") or 0
            age = ref_year - yr if yr else 0
            nc  = c / mc; na = min(age / 20, 1.0)
            if   c > 0 and c >= p75 and age > 3:
                g = "root";  rs, ts, ls = nc*0.7+na*0.3, nc*0.3, 0.1
            elif yr and age <= 3:
                g = "leaf";  rs, ts, ls = nc*0.2, nc*0.3, (1-na)*0.8
            elif c > 0 and age > 3:
                g = "trunk"; rs, ts, ls = nc*0.4, 0.5+nc*0.3, (1-nc)*0.3
            else:
                g = "leaf";  rs, ts, ls = 0.05, 0.1, 0.3
            s = {"root": rs, "trunk": ts, "leaf": ls}[g]
            res.append({**p, "root": rs, "trunk": ts, "leaf": ls, "group": g,
                        "_sap": s, "_sap_norm": s, "total_value": rs + ts + ls})
        return res


# ═══════════════════════════════════════════════════════════════════════════════
# EXTRACTOR DE NODOS FANTASMA (referencias externas co-citadas)
# ═══════════════════════════════════════════════════════════════════════════════

class ReferenceNodeExtractor:
    @staticmethod
    def from_wos_cr(ref_str: str) -> dict:
        ref_str = ref_str.strip()
        doi_m   = re.search(r'DOI\s+(10\.\S+)', ref_str, re.IGNORECASE)
        doi     = doi_m[1].rstrip(",. ").lower() if doi_m else None
        parts   = [p.strip() for p in ref_str.split(",")]
        author  = parts[0] if parts else "Unknown"
        year    = None
        if len(parts) > 1:
            try: year = int(parts[1].strip())
            except: pass
        journal = parts[2].strip() if len(parts) > 2 else ""
        vol_m   = re.search(r'\bV(\d+)\b', ref_str)
        page_m  = re.search(r'\bP(\d+)\b', ref_str)
        volume  = f"V{vol_m[1]}" if vol_m else ""
        page    = f"P{page_m[1]}" if page_m else ""
        vp      = f" {volume}:{page}" if volume and page else (f" {volume}" if volume else "")
        label   = f"{author} ({year}) {journal}{vp}".strip()
        node_id = doi or f"{author.split()[0].lower()}_{year}"
        return {
            "id": node_id, "label": label, "title": label, "authors": [author],
            "year": year, "doi": doi, "times_cited": 0, "references": [],
            "url": None, "source": "wos_reference", "_is_ghost": True,
        }

    @staticmethod
    def from_scopus_csv(ref_str: str) -> dict: 
            ref_str = ref_str.strip()
            doi_m   = re.search(r'10\.\d{4,}/\S+', ref_str)
            doi = doi_m[0].rstrip(",. )").lower() if doi_m else None
            year_m  = re.search(r'\((\d{4})\)', ref_str)
            year = int(year_m[1]) if year_m else None
            parts   = [p.strip() for p in ref_str.split(",")]

            # --- NUEVA PROTECCIÓN ---
            author = parts[0] if parts and parts[0] else "Unknown"
            author_words = author.split()
            # Si author_words tiene algo, tomamos la primera palabra, si no, usamos "unknown"
            first_author_word = author_words[0].lower() if author_words else "unknown"

            node_id = doi or f"{first_author_word}_{year}"
            # ------------------------

            return {
                "id": node_id, "label": f"{author} ({year})".strip(),
                "title": f"{author} ({year})".strip(), "authors": [author],
                "year": year, "doi": doi, "times_cited": 0, "references": [],
                "url": None, "source": "csv_reference", "_is_ghost": True,
            }


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTOR PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

class ScienceTreeBuilder:
    PARSERS = {
        ".csv": ScopusCSVParser,
        ".txt": TextRecordParser,
        ".bib": ScopusBibParser,
        ".ris": ScopusRISParser,
    }

    def __init__(self,
                 min_degree: int = 1,
                 min_cocitations: int = 1,
                 include_ghost_nodes: bool = True,
                 exclude_self_citations: bool = True,
                 use_jaro_winkler: bool = True,
                 fast_sap: bool = True,
                 use_lcc: bool = True,
                 leaf_window: int = 5,
                 top_trunk_limit: int = 30,
                 top_root_limit: int = 20,
                 top_leaf_limit: int = 60,
                 max_nodes: int = 90):
        """
        Parámetros:
          min_cocitations  : umbral co-citaciones para ghost nodes.
                             None → auto-escala: max(4, corpus//50).
          fast_sap         : True → SAP O(N) por in×out (defecto, recomendado).
                             False → SAP O(V+E) por BFS, mayor fidelidad ToS.
          use_lcc          : True (defecto) → extrae el mayor componente débilmente
                             conectado antes de clasificar.
          leaf_window      : ventana temporal (años) para leaf activa. Defecto 5.
          top_trunk_limit  : máximo de intermediarios que forman el tronco (defecto 20).
          top_root_limit   : máximo de raíces visibles, por in_degree (defecto 10).
          top_leaf_limit   : máximo de hojas visibles, por out_degree (defecto 40).
          max_nodes        : recorte proporcional del grafo final (None = sin límite).
        """
        self.min_degree             = min_degree
        self._min_coc_override      = min_cocitations
        self.include_ghost_nodes    = include_ghost_nodes
        self.exclude_self_citations = exclude_self_citations
        self.use_jaro_winkler       = use_jaro_winkler
        self.fast_sap               = fast_sap
        self.use_lcc                = use_lcc
        self.leaf_window            = leaf_window
        self.top_trunk_limit        = top_trunk_limit
        self.top_root_limit         = top_root_limit
        self.top_leaf_limit         = top_leaf_limit
        self.max_nodes              = max_nodes
        self.clf  = ScienceTreeClassifier(
            fast_sap=fast_sap,
            leaf_window=leaf_window,
            top_trunk_limit=top_trunk_limit,
            top_root_limit=top_root_limit,
            top_leaf_limit=top_leaf_limit,
        )
        self.meta = MetadataOnlyClassifier()
        self.jw   = JaroWinklerDeduplicator()

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _resolve_min_cocitations(self, corpus_size: int) -> int:
        if self._min_coc_override is not None:
            return self._min_coc_override
        return max(4, corpus_size // 50)

    # ── Punto de entrada principal ────────────────────────────────────────────

    def build_from_file(self, archivo) -> nx.DiGraph:
        """
        Construye el árbol de ciencia a partir de un archivo de bibliografía.

        El grafo resultante incluye G.graph["_perf"] con métricas de rendimiento:
          parse_s        : tiempo de parseo
          ghost_s        : tiempo de ghost nodes + JW
          build_s        : tiempo de construcción del grafo
          lcc_s          : tiempo de extracción LCC
          classify_s     : tiempo de clasificación + SAP
          total_s        : tiempo total
          corpus_papers  : papers en el archivo
          total_papers   : papers + ghost nodes
          lcc_nodes      : nodos en el LCC
          discarded_lcc  : nodos descartados por LCC
          n_components   : número de componentes débiles
          sap_mode       : "fast_O(N)" o "bfs_O(V+E)"
          min_cocitations: umbral de co-citación usado
        """
        t_total = time.perf_counter()
        ext = os.path.splitext((getattr(archivo, "name", None) or str(archivo)).lower())[1]
        cls = self.PARSERS.get(ext)
        if not cls:
            raise ValueError(f"Formato '{ext}' no soportado. Use: {', '.join(self.PARSERS)}")

        # ── Parseo ────────────────────────────────────────────────────────────
        t0 = time.perf_counter()
        opener = (archivo.open("rb") if hasattr(archivo, "open") else open(archivo, "rb")) or ____ # type: ignore
        with opener as f:
            papers = cls().parse(f)
        perf: dict = {"parse_s": round(time.perf_counter() - t0, 4)}
        if not papers:
            raise ValueError("El archivo no contiene papers procesables.")

        corpus_size = len(papers)
        self.min_cocitations = self._resolve_min_cocitations(corpus_size)
        has_refs = any(p.get("references") for p in papers)

        perf["corpus_papers"]    = corpus_size
        perf["min_cocitations"]  = self.min_cocitations
        perf["sap_mode"]         = "fast_O(N)" if self.fast_sap else "bfs_O(V+E)"
        perf["leaf_window"]      = self.leaf_window
        perf["top_trunk_limit"]  = self.top_trunk_limit
        perf["top_root_limit"]   = self.top_root_limit
        perf["top_leaf_limit"]   = self.top_leaf_limit

        if not has_refs:
            G = self._to_graph(self.meta.classify(papers))
            perf |= {
                "ghost_s": 0,
                "build_s": 0,
                "lcc_s": 0,
                "classify_s": 0,
                "total_papers": corpus_size,
                "lcc_nodes": G.number_of_nodes(),
                "discarded_lcc": 0,
                "n_components": 1,
            }
            return self._extracted_from_build_from_file_57(t_total, perf, G)
        # ── Ghost nodes ───────────────────────────────────────────────────────
        t0 = time.perf_counter()
        if self.include_ghost_nodes:
            papers = self._add_ghost_nodes(papers, ext)
        perf["ghost_s"]       = round(time.perf_counter() - t0, 4)
        perf["total_papers"]  = len(papers)

        # ── Construcción del grafo ────────────────────────────────────────────
        t0 = time.perf_counter()
        G  = self._build_graph(papers)
        G.remove_edges_from(list(nx.selfloop_edges(G)))
        prev = -1
        while prev != G.number_of_nodes():
            prev = G.number_of_nodes()
            G.remove_nodes_from([n for n in list(G.nodes) if G.degree(n) < self.min_degree])
        perf["build_s"] = round(time.perf_counter() - t0, 4)

        if G.number_of_nodes() == 0 or G.number_of_edges() == 0:
            G2 = self._to_graph(self.meta.classify(papers))
            perf |= {
                "lcc_s": 0,
                "classify_s": 0,
                "lcc_nodes": G2.number_of_nodes(),
                "discarded_lcc": 0,
                "n_components": 1,
            }
            return self._extracted_from_build_from_file_57(t_total, perf, G2)
        # ── LCC: mayor componente débilmente conectado ────────────────────────
        t0 = time.perf_counter()
        if self.use_lcc:
            components      = list(nx.weakly_connected_components(G))
            lcc_nodes       = max(components, key=len)
            n_before        = G.number_of_nodes()
            G               = G.subgraph(lcc_nodes).copy()   # libera memoria
            perf["n_components"]   = len(components)
            perf["lcc_nodes"]      = G.number_of_nodes()
            perf["discarded_lcc"]  = n_before - G.number_of_nodes()
        else:
            perf["n_components"]   = 1
            perf["lcc_nodes"]      = G.number_of_nodes()
            perf["discarded_lcc"]  = 0
        perf["lcc_s"] = round(time.perf_counter() - t0, 4)

        # ── Clasificación + SAP ───────────────────────────────────────────────
        t0 = time.perf_counter()
        G  = self.clf.classify(G)
        perf["classify_s"] = round(time.perf_counter() - t0, 4)

        return self._extracted_from_build_from_file_57(t_total, perf, G)

    # TODO Rename this here and in `build_from_file`
    def _extracted_from_build_from_file_57(self, t_total, perf, arg2):
        perf["total_s"] = round(time.perf_counter() - t_total, 4)
        arg2.graph["_perf"] = perf
        return self._apply_max_nodes(arg2)

    # ── Ghost nodes ────────────────────────────────────────────────────────────

    def _add_ghost_nodes(self, papers: list, ext: str) -> list:
        extractor = ReferenceNodeExtractor()

        corpus_first_author: dict = {}
        for p in papers:
            if p.get("authors"):
                fa_parts = p["authors"][0].split(",")[0].split()
                if fa_parts:  # Solo lo asigna si sobrevivió al split
                    corpus_first_author[p["id"]] = fa_parts[0].lower()

        all_ref_strings: list = []
        paper_refs_map:  dict = {}
        for p in papers:
            raw = p.get("_refs_raw", []) if ext == ".txt" else p.get("references", p.get("_refs_strings", []))
            
            # Filtramos strings vacíos que nos genere Scopus:
            raw = [r for r in raw if r.strip()] 
            
            paper_refs_map[p["id"]] = raw
            all_ref_strings.extend(raw)

        jw_map: dict = {}
        if self.use_jaro_winkler and all_ref_strings:
            unique_raws = list(set(all_ref_strings))
            jw_map = self.jw.build_duplicates(unique_raws, fmt=ext)

        def canonical(s: str) -> str:
            return jw_map.get(s, s)

        def ref_to_rid(ref_str: str) -> str:
            if ext == ".txt":
                if m := re.search(r'DOI\s+(10\.\S+)', ref_str, re.IGNORECASE):
                    return m[1].rstrip(",. ").lower()
                pts = [x.strip() for x in ref_str.split(",")]
                
                # PROTECCIÓN WOS
                a_parts = pts[0].split() if pts and pts[0] else []
                a = a_parts[0].lower() if a_parts else "unk"
                
                y = pts[1].strip()[:4] if len(pts) > 1 else "0000"
                return f"{a}_{y}"
            else:
                if m := re.search(r'10\.\d{4,}/\S+', ref_str):
                    return m[0].rstrip(",. )").lower()
                ym = re.search(r'\((\d{4})\)', ref_str)
                y  = ym[1] if ym else "0000"
                
                # PROTECCIÓN SCOPUS
                first_comma_part = ref_str.split(",")[0].strip() if ref_str else ""
                a_parts = first_comma_part.split()
                a = a_parts[0].lower() if a_parts else "unk"
                
                return f"{a}_{y}"

        ref_count: Counter = Counter()
        ref_raw:   dict    = {}
        for p in papers:
            paper_fa = corpus_first_author.get(p["id"], "")
            seen:    set = set()
            for ref_str in paper_refs_map.get(p["id"], []):
                canon = canonical(ref_str)
                rid   = ref_to_rid(canon)
                if rid in seen: continue
                seen.add(rid)
                if self.exclude_self_citations and paper_fa:
                    pts = [x.strip() for x in canon.split(",")]
                    rf_parts = pts[0].split() if pts else []
                    rf  = rf_parts[0].lower() if rf_parts else ""
                    if rf and rf == paper_fa: continue
                ref_count[rid] += 1
                ref_raw[rid]    = canon

        existing_ids  = {p["id"] for p in papers}
        existing_dois = {p["doi"].lower() for p in papers if p.get("doi")}

        ghost_map: dict = {}
        for rid, count in ref_count.items():
            if count < self.min_cocitations or rid in existing_ids: continue
            raw   = ref_raw[rid]
            ghost = extractor.from_wos_cr(raw) if ext == ".txt" else extractor.from_scopus_csv(raw)
            if ghost.get("doi") and ghost["doi"] in existing_dois: continue
            ghost_map[rid] = ghost

        return papers + list(ghost_map.values())

    # ── Construcción del grafo ─────────────────────────────────────────────────

    def _build_graph(self, papers: list) -> nx.DiGraph:
        G   = nx.DiGraph()
        idx: dict = {}

        for p in papers:
            pid   = p["id"]
            attrs = {k: p.get(k) for k in (
                "label", "title", "authors", "year", "doi",
                "times_cited", "url", "source"
            )}
            attrs["_is_ghost"] = p.get("_is_ghost", False)
            G.add_node(pid, **attrs)

            # Índice multi-clave para matching de referencias
            idx[pid.lower()] = pid
            if p.get("doi"):
                idx[p["doi"].lower()] = pid
            if p.get("authors") and p.get("year"):
                a_parts = p["authors"][0].split(",")[0].split()
                if a_parts:
                    a = a_parts[0].lower()
                    idx.setdefault(f"{a}_{p['year']}", pid)
            # Clave canónica adicional (mejora desambiguación)
            if p.get("authors") and p.get("year") and p.get("title"):
                cid = _generate_canonical_id(p["authors"][0], p["year"], p["title"])
                idx.setdefault(cid, pid)

        for p in papers:
            for ref in p.get("references", []):
                target = idx.get(ref.lower())
                if target and target != p["id"]:
                    G.add_edge(p["id"], target)
        return G

    # ── Recorte max_nodes ─────────────────────────────────────────────────────

    def _apply_max_nodes(self, G: nx.DiGraph) -> nx.DiGraph:
        """
        Recorta a max_nodes manteniendo la proporción root/trunk/branch/leaf
        y conservando los de mayor SAP dentro de cada grupo.

        dead_leaf e isolated se eliminan siempre (no forman parte del árbol
        visible). branch se trata igual que trunk/leaf para el recorte.
        """
        if self.max_nodes is None and G.number_of_nodes() == 0:
            return G

        # Eliminar grupos ocultos del árbol de visualización:
        # dead_leaf/isolated (estructura) + minor_root/minor_leaf (élite)
        _HIDDEN = ("dead_leaf", "isolated", "minor_root", "minor_leaf")
        if non_tree := [n for n, d in G.nodes(data=True)
                        if d.get("group") in _HIDDEN]:
            G = G.copy()
            G.remove_nodes_from(non_tree)

        if self.max_nodes is None or G.number_of_nodes() <= self.max_nodes:
            return G

        # Recorte proporcional sobre root/trunk/branch/leaf
        total  = G.number_of_nodes()
        groups: dict = {}
        for n, d in G.nodes(data=True):
            grp = d.get("group", "leaf")
            groups.setdefault(grp, []).append((n, d.get("_sap", 0)))
        to_remove = []
        for nodes in groups.values():
            nodes_sorted = sorted(nodes, key=lambda x: x[1], reverse=True)
            proportion   = len(nodes_sorted) / total
            keep_n       = max(1, round(self.max_nodes * proportion))
            to_remove.extend(n for n, _ in nodes_sorted[keep_n:])
        G = G.copy()
        G.remove_nodes_from(to_remove)
        return G

    # ── Utilidad ──────────────────────────────────────────────────────────────

    @staticmethod
    def _to_graph(papers: list) -> nx.DiGraph:
        G = nx.DiGraph()
        for p in papers:
            G.add_node(p["id"], **p)
        return G


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys, json

    if len(sys.argv) < 2:
        print("Uso: python science_tree_builder.py <archivo> [min_cocitations] [--slow-sap]")
        sys.exit(1)

    min_coc    = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else None
    fast_sap   = "--slow-sap" not in sys.argv
    leaf_win   = 5
    trunk_lim  = 20
    root_lim   = 20
    leaf_lim   = 25
    for arg in sys.argv[1:]:
        if arg.startswith("--window="):
            try: leaf_win  = int(arg.split("=")[1])
            except ValueError: pass
        if arg.startswith("--trunk-limit="):
            try: trunk_lim = int(arg.split("=")[1])
            except ValueError: pass
        if arg.startswith("--root-limit="):
            try: root_lim  = int(arg.split("=")[1])
            except ValueError: pass
        if arg.startswith("--leaf-limit="):
            try: leaf_lim  = int(arg.split("=")[1])
            except ValueError: pass

    try:
        G = ScienceTreeBuilder(
            min_cocitations=min_coc,
            fast_sap=fast_sap,
            leaf_window=leaf_win,
            top_trunk_limit=trunk_lim,
            top_root_limit=root_lim,
            top_leaf_limit=leaf_lim,
        ).build_from_file(sys.argv[1])

        perf = G.graph.get("_perf", {})

        # Grupos visibles (árbol principal)
        _VISIBLE = ("root", "trunk", "branch", "leaf")
        # Grupos ocultos (excluidos del árbol, solo en métricas)
        _HIDDEN  = ("minor_root", "minor_leaf", "dead_leaf", "isolated")

        def _count(grp):
            return sum(d.get("group") == grp for _, d in G.nodes(data=True))

        visible_groups = {g: _count(g) for g in _VISIBLE if _count(g) > 0}
        hidden_counts  = {g: _count(g) for g in _HIDDEN  if _count(g) > 0}
        saps = [d.get("_sap", 0) for _, d in G.nodes(data=True)]

        summary = {
            "total_nodes":   G.number_of_nodes(),
            "total_edges":   G.number_of_edges(),
            "groups":        visible_groups,
            "hidden_groups": hidden_counts,
            "sap_max":       max(saps, default=0),
            "sap_avg":       round(sum(saps) / len(saps), 2) if saps else 0,
            "performance": {
                "total_s":        perf.get("total_s"),
                "parse_s":        perf.get("parse_s"),
                "ghost_jw_s":     perf.get("ghost_s"),
                "build_graph_s":  perf.get("build_s"),
                "lcc_s":          perf.get("lcc_s"),
                "classify_sap_s": perf.get("classify_s"),
                "sap_mode":       perf.get("sap_mode"),
            },
            "corpus": {
                "papers_input":    perf.get("corpus_papers"),
                "papers_total":    perf.get("total_papers"),
                "lcc_nodes":       perf.get("lcc_nodes"),
                "discarded_lcc":   perf.get("discarded_lcc"),
                "n_components":    perf.get("n_components"),
                "min_cocitations": perf.get("min_cocitations"),
                "leaf_window":     perf.get("leaf_window"),
                "top_trunk_limit": perf.get("top_trunk_limit"),
                "top_root_limit":  perf.get("top_root_limit"),
                "top_leaf_limit":  perf.get("top_leaf_limit"),
            },
        }
        print(json.dumps(summary, indent=2))

        # Top nodos — solo grupos VISIBLES del árbol principal
        print("\nTop nodos del árbol (SAP desc):")
        group_labels = {
            "root":   "ROOT   (fundacionales élite)",
            "trunk":  "TRUNK  (conectores élite)",
            "branch": "BRANCH (conectores secundarios)",
            "leaf":   "LEAF   (frente de investigación élite)",
        }
        for grp in _VISIBLE:
            nodes = sorted(
                [(n, d) for n, d in G.nodes(data=True) if d.get("group") == grp],
                key=lambda x: x[1].get("_sap", 0), reverse=True
            )
            if not nodes:
                continue
            print(f"\n  {group_labels[grp]} ({len(nodes)} nodos):")
            for n, d in nodes[:10]:
                ghost = " [ghost]" if d.get("_is_ghost") else ""
                yr    = d.get("year") or "?"
                print(f"    SAP={d.get('_sap',0):>6}  [{yr}]  {d.get('label','?')[:55]}{ghost}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)