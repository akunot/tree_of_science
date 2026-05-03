"""
Utilidades unificadas para exportación de archivos
PDF, JSON, CSV - Sistema simple y sin corrupción
"""
import os
import csv
import io
import time
from datetime import datetime
from reportlab.lib.pagesizes import letter
from django.conf import settings
from django.http import HttpResponse


# ─────────────────────────────────────────────────────────────────────────────
# PDF PREMIUM — Diseño académico-ejecutivo de primer nivel
# ─────────────────────────────────────────────────────────────────────────────

def generate_pdf_sync(tree):
    """
    Generar PDF académico-ejecutivo de primer nivel.
    Diseño inspirado en publicaciones Nature y reportes de consultoría moderna.

    Cambios respecto a la versión anterior:
      • Portada geométrica dedicada con paleta UNAL y acento dorado
      • Paleta extendida de azules + slate + gold
      • Tipografía jerarquizada con leading generoso
      • Tablas sin bordes verticales, zebra ultra-suave y padding amplio
      • Estadísticas en tarjetas multi-columna
      • Header/footer minimalista con paginación elegante
    """
    from reportlab.lib.colors import HexColor, white
    from reportlab.lib.units import inch
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import (
        BaseDocTemplate, PageTemplate, Frame,
        Paragraph, Spacer, Table, TableStyle,
        PageBreak, NextPageTemplate, HRFlowable,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from io import BytesIO
    from django.utils import timezone

    # ── Paleta de Colores ─────────────────────────────────────────────────────
    # Azul UNAL institucional y variantes
    C_BLUE        = HexColor('#1C5AA0')   # Azul UNAL institucional
    C_BLUE_DARK   = HexColor('#163D70')   # Variante oscura (portada)
    C_BLUE_PALE   = HexColor('#EFF6FF')   # Fondo azul suavísimo (triángulo portada)
    C_BLUE_BAND   = HexColor('#B0C8E4')   # Texto sobre fondo azul oscuro
    C_BLUE_MUTED  = HexColor('#8AAAC8')   # Texto secundario sobre azul
    C_BLUE_INNER  = HexColor('#2E6BBF')   # Separador interior de banda
    # Acento
    C_GOLD        = HexColor('#D97706')   # Acento dorado institucional
    # Fondos y superficie
    C_WHITE       = white
    C_BG          = HexColor('#F8FAFC')   # Fondo general (slate-50)
    C_ZEBRA       = HexColor('#F1F5F9')   # Fila alterna (slate-100)
    C_CARD_BG     = HexColor('#FAFBFC')   # Fondo tarjetas de estadísticas
    # Texto
    C_TEXT        = HexColor('#1E293B')   # Texto principal (slate-800)
    C_TEXT_SEC    = HexColor('#475569')   # Texto secundario (slate-600)
    C_TEXT_MUT    = HexColor('#94A3B8')   # Texto silenciado (slate-400)
    # Bordes
    C_BORDER      = HexColor('#E2E8F0')   # Borde sutil (slate-200)
    C_BORDER_MD   = HexColor('#CBD5E1')   # Borde medio (slate-300)
    C_SHADOW      = HexColor('#DDE6EE')   # Sombra de tarjetas

    PAGE_W, PAGE_H = letter
    ML = 0.85 * inch      # margen izquierdo
    MR = 0.85 * inch      # margen derecho
    MT = 0.72 * inch      # margen superior
    MB = 0.60 * inch      # margen inferior
    CONTENT_W = PAGE_W - ML - MR

    buffer = BytesIO()
    current_time = timezone.now()

    # ── Estilos ───────────────────────────────────────────────────────────────
    _base = getSampleStyleSheet()

    def PS(name, **kw):
        """Atajo para ParagraphStyle con herencia de 'Normal'."""
        parent = kw.pop('parent', _base['Normal'])
        return ParagraphStyle(name, parent=parent, **kw)

    # Jerarquía editorial
    S_section = PS('S_section',
        parent=_base['Heading2'],
        fontSize=11.5, fontName='Helvetica-Bold',
        textColor=C_BLUE,
        spaceBefore=22, spaceAfter=6, leading=16,
    )
    S_body = PS('S_body',
        fontSize=9.5, fontName='Helvetica',
        textColor=C_TEXT, leading=15, spaceAfter=6,
    )
    S_caption = PS('S_caption',
        fontSize=7.5, fontName='Helvetica',
        textColor=C_TEXT_MUT, leading=11, spaceAfter=4,
    )
    # Estilos para celdas de tabla de nodos
    S_node = PS('S_node',
        fontSize=7.5, fontName='Helvetica',
        textColor=C_TEXT, leading=10,
    )
    S_node_sec = PS('S_node_sec',
        fontSize=7.5, fontName='Helvetica',
        textColor=C_TEXT_SEC, leading=10,
    )
    # Estilos para tarjetas de estadísticas
    S_stat_label = PS('S_stat_label',
        fontSize=6.5, fontName='Helvetica-Bold',
        textColor=C_TEXT_MUT, leading=9, alignment=TA_CENTER,
    )
    S_stat_value = PS('S_stat_value',
        fontSize=22, fontName='Helvetica-Bold',
        textColor=C_BLUE, leading=26, alignment=TA_CENTER,
    )
    # Estilo para celdas de info (labels)
    S_info_label = PS('S_info_label',
        fontSize=8.5, fontName='Helvetica-Bold',
        textColor=C_BLUE, leading=12,
    )
    S_info_value = PS('S_info_value',
        fontSize=9, fontName='Helvetica',
        textColor=C_TEXT, leading=13,
    )

    # ── Función: Portada ──────────────────────────────────────────────────────
    def draw_cover(c, doc):
        """
        Portada geométrica limpia al estilo editorial.
        Dibujada íntegramente con la API de canvas de ReportLab.
        """
        c.saveState()

        # ─ Banda superior azul oscuro ─────────────────────────────────────────
        BAND_H = 2.05 * inch
        c.setFillColor(C_BLUE_DARK)
        c.rect(0, PAGE_H - BAND_H, PAGE_W, BAND_H, fill=1, stroke=0)

        # Franja dorada de separación (debajo de la banda)
        c.setFillColor(C_GOLD)
        c.rect(0, PAGE_H - BAND_H - 3.5, PAGE_W, 3.5, fill=1, stroke=0)

        # ─ Triángulo geométrico inferior-izquierdo ────────────────────────────
        c.setFillColor(C_BLUE_PALE)
        p = c.beginPath()
        p.moveTo(0, 0)
        p.lineTo(PAGE_W * 0.52, 0)
        p.lineTo(0, PAGE_H * 0.34)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

        # ─ Barra inferior ────────────────────────────────────────────────────
        c.setFillColor(C_BLUE)
        c.rect(0, 0, PAGE_W, 0.30 * inch, fill=1, stroke=0)

        # Puntos dorados decorativos sobre la barra
        c.setFillColor(C_GOLD)
        for i in range(5):
            c.circle(ML + i * 0.20 * inch, 0.15 * inch, 2.8, fill=1, stroke=0)

        # ─ Texto en banda superior ────────────────────────────────────────────
        c.setFillColor(C_BLUE_BAND)
        c.setFont('Helvetica', 8.5)
        c.drawString(ML, PAGE_H - 0.42 * inch, 'UNIVERSIDAD NACIONAL DE COLOMBIA')

        c.setFont('Helvetica', 7.5)
        c.setFillColor(C_BLUE_MUTED)
        c.drawString(ML, PAGE_H - 0.62 * inch,
                     'Facultad de Administración  ·  Árbol de la Ciencia')

        # Línea separadora dentro de la banda
        c.setStrokeColor(C_BLUE_INNER)
        c.setLineWidth(0.4)
        c.line(ML, PAGE_H - 0.78 * inch, PAGE_W - MR, PAGE_H - 0.78 * inch)

        # ─ Título principal ───────────────────────────────────────────────────
        title_y = PAGE_H - BAND_H - 1.30 * inch
        c.setFillColor(C_BLUE_DARK)
        c.setFont('Helvetica-Bold', 32)
        main_title = 'ÁRBOL DE LA CIENCIA'
        tw = c.stringWidth(main_title, 'Helvetica-Bold', 32)
        c.drawString((PAGE_W - tw) / 2, title_y, main_title)

        # ─ Subtítulo (título del árbol) ───────────────────────────────────────
        subtitle = tree.title or 'Reporte de Análisis Bibliométrico'
        c.setFont('Helvetica', 13)
        c.setFillColor(C_TEXT_SEC)
        max_w = PAGE_W - 2.2 * inch
        sw = c.stringWidth(subtitle, 'Helvetica', 13)
        if sw > max_w:
            while c.stringWidth(subtitle + '\u2026', 'Helvetica', 13) > max_w and len(subtitle) > 5:
                subtitle = subtitle[:-1]
            subtitle += '\u2026'
        sw = c.stringWidth(subtitle, 'Helvetica', 13)
        c.drawString((PAGE_W - sw) / 2, title_y - 0.46 * inch, subtitle)

        # ─ Divisor con punto dorado central ──────────────────────────────────
        div_y = title_y - 0.72 * inch
        c.setStrokeColor(C_BLUE)
        c.setLineWidth(1.2)
        c.line(ML, div_y, PAGE_W - MR, div_y)
        c.setFillColor(C_GOLD)
        c.circle(PAGE_W / 2, div_y, 4.5, fill=1, stroke=0)

        # ─ Tarjeta de metadatos ───────────────────────────────────────────────
        CARD_X = 1.35 * inch
        CARD_W = PAGE_W - 2.70 * inch
        CARD_H = 1.80 * inch
        CARD_Y = div_y - 2.35 * inch

        # Sombra simulada
        c.setFillColor(C_SHADOW)
        c.roundRect(CARD_X + 3, CARD_Y - 3, CARD_W, CARD_H, 6, fill=1, stroke=0)

        # Cuerpo de tarjeta
        c.setFillColor(C_WHITE)
        c.roundRect(CARD_X, CARD_Y, CARD_W, CARD_H, 6, fill=1, stroke=0)

        # Barra de acento izquierda
        c.setFillColor(C_BLUE)
        c.roundRect(CARD_X, CARD_Y, 4, CARD_H, 2, fill=1, stroke=0)

        # Línea divisora horizontal en el centro de la tarjeta
        mid_y = CARD_Y + CARD_H / 2
        c.setStrokeColor(C_BORDER)
        c.setLineWidth(0.4)
        c.line(CARD_X + 22, mid_y, CARD_X + CARD_W - 12, mid_y)

        # Metadatos: 2 columnas × 2 filas
        INNER_X = CARD_X + 0.28 * inch
        COL_W = CARD_W / 2 - 0.12 * inch
        meta = [
            ('SEMILLA / DESCRIPTOR',
             (str(tree.seed)[:58] + '\u2026' if tree.seed and len(str(tree.seed)) > 58 else (str(tree.seed) if tree.seed else 'N/A'))),
            ('GENERADO EL', current_time.strftime('%d de %B de %Y, %H:%M')),
            ('USUARIO', tree.user.username if tree.user else 'N/A'),
            ('ID ÁRBOL', f'#{tree.id}'),
        ]
        for idx, (label, value) in enumerate(meta):
            col  = idx % 2
            row  = idx // 2
            MX   = INNER_X + col * (CARD_W / 2)
            MY   = CARD_Y + CARD_H - 0.42 * inch - row * 0.73 * inch

            c.setFont('Helvetica-Bold', 6.5)
            c.setFillColor(C_TEXT_MUT)
            c.drawString(MX, MY, label)

            c.setFont('Helvetica', 9)
            c.setFillColor(C_TEXT)
            val_str = str(value)
            val_w = c.stringWidth(val_str, 'Helvetica', 9)
            if val_w > COL_W - 0.12 * inch:
                while c.stringWidth(val_str + '\u2026', 'Helvetica', 9) > COL_W - 0.12 * inch and len(val_str) > 4:
                    val_str = val_str[:-1]
                val_str += '\u2026'
            c.drawString(MX, MY - 0.21 * inch, val_str)

        # Nota de pie de portada
        c.setFont('Helvetica', 7.5)
        c.setFillColor(C_TEXT_MUT)
        note = 'Reporte generado automáticamente  ·  Árbol de la Ciencia UNAL'
        nw = c.stringWidth(note, 'Helvetica', 7.5)
        c.drawString((PAGE_W - nw) / 2, 0.43 * inch, note)

        c.restoreState()

    # ── Función: Header / Footer de contenido ─────────────────────────────────
    def draw_content_page(c, doc):
        """Header minimalista y footer con paginación elegante."""
        c.saveState()

        # ─ Header: acento superior azul ─────────────────────────────────────
        c.setFillColor(C_BLUE)
        c.rect(ML, PAGE_H - MT + 10, CONTENT_W, 2, fill=1, stroke=0)

        c.setFont('Helvetica-Bold', 7)
        c.setFillColor(C_BLUE)
        c.drawString(ML, PAGE_H - MT + 3, 'ÁRBOL DE LA CIENCIA')

        c.setFont('Helvetica', 7)
        c.setFillColor(C_TEXT_MUT)
        hdr_right = tree.title or ''
        if len(hdr_right) > 62:
            hdr_right = hdr_right[:59] + '\u2026'
        c.drawRightString(PAGE_W - MR, PAGE_H - MT + 3, hdr_right)

        # ─ Footer ────────────────────────────────────────────────────────────
        FY = MB - 0.28 * inch

        c.setStrokeColor(C_BORDER)
        c.setLineWidth(0.4)
        c.line(ML, FY + 0.18 * inch, PAGE_W - MR, FY + 0.18 * inch)

        # Texto izquierdo
        c.setFont('Helvetica', 7)
        c.setFillColor(C_TEXT_MUT)
        c.drawString(ML, FY, 'Universidad Nacional de Colombia  ·  Facultad de Administración')

        # Fecha centrada
        date_str = current_time.strftime('%d/%m/%Y')
        dw = c.stringWidth(date_str, 'Helvetica', 7)
        c.drawString((PAGE_W - dw) / 2, FY, date_str)

        # Número de página (derecha, en azul)
        c.setFont('Helvetica-Bold', 7)
        c.setFillColor(C_BLUE)
        c.drawRightString(PAGE_W - MR, FY, f'Pág. {doc.page}')

        c.restoreState()

    # ── Page Templates ────────────────────────────────────────────────────────
    # Portada: frame invisible de 1×1 px (toda la visual va en onPage)
    cover_frame = Frame(PAGE_W / 2, PAGE_H / 2, 1, 1,
                        id='cover_frame', showBoundary=0)
    cover_tmpl = PageTemplate(id='cover', frames=[cover_frame], onPage=draw_cover)

    # Contenido: frame con márgenes completos + espacio para header/footer
    content_frame = Frame(
        ML, MB + 0.08 * inch,
        CONTENT_W,
        PAGE_H - MT - MB - 0.22 * inch,
        id='content_frame', showBoundary=0,
    )
    content_tmpl = PageTemplate(id='content', frames=[content_frame],
                                onPage=draw_content_page)

    doc = BaseDocTemplate(
        buffer, pagesize=letter,
        pageTemplates=[cover_tmpl, content_tmpl],
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
    )

    # ── Helper: comandos de estilo para tablas ────────────────────────────────
    def header_cmds():
        """Fila de encabezado azul UNAL, sin bordes exteriores."""
        return [
            ('BACKGROUND',    (0, 0), (-1, 0), C_BLUE),
            ('TEXTCOLOR',     (0, 0), (-1, 0), C_WHITE),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, 0), 8),
            ('ALIGN',         (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN',        (0, 0), (-1, 0), 'MIDDLE'),
            ('TOPPADDING',    (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 9),
            ('LEFTPADDING',   (0, 0), (-1, 0), 9),
            ('RIGHTPADDING',  (0, 0), (-1, 0), 9),
            # Solo línea horizontal bajo el encabezado, sin bordes verticales
            ('LINEBELOW',     (0, 0), (-1, 0), 1.2, C_BLUE),
        ]

    def body_cmds(n_data_rows, font_size=9, top_pad=7, bot_pad=7, left_pad=9):
        """
        Cuerpo de tabla premium:
          - Sin bordes verticales
          - Líneas horizontales sutiles entre filas
          - Zebra ultra-suave
          - Padding generoso
        """
        cmds = [
            ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE',      (0, 1), (-1, -1), font_size),
            ('TEXTCOLOR',     (0, 1), (-1, -1), C_TEXT),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING',    (0, 1), (-1, -1), top_pad),
            ('BOTTOMPADDING', (0, 1), (-1, -1), bot_pad),
            ('LEFTPADDING',   (0, 0), (-1, -1), left_pad),
            ('RIGHTPADDING',  (0, 0), (-1, -1), left_pad),
            # Separadores horizontales entre filas (sin vertical)
            ('LINEBELOW',     (0, 1), (-1, -2), 0.3, C_BORDER),
            ('LINEBELOW',     (0, -1), (-1, -1), 0.6, C_BORDER_MD),
        ]
        # Zebra striping ultra-suave
        for i in range(1, n_data_rows + 1):
            bg = C_ZEBRA if i % 2 == 0 else C_WHITE
            cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
        return cmds

    # ── Story ─────────────────────────────────────────────────────────────────
    story = []

    # Página 1 = portada (cover_tmpl).
    # NextPageTemplate + PageBreak cierra la portada y abre el contenido.
    story.append(NextPageTemplate('content'))
    story.append(PageBreak())

    # ─── Sección 1: Información del Árbol ─────────────────────────────────────
    story.append(Paragraph('Información del Árbol', S_section))
    story.append(HRFlowable(width='100%', thickness=0.5, color=C_BORDER,
                             spaceAfter=10, spaceBefore=0))

    info_data = [
        ['Campo', 'Valor'],
        ['ID del árbol', f'#{tree.id}'],
        ['Título',       tree.title or 'Sin título'],
        ['Semilla / descriptor', tree.seed or 'N/A'],
        ['Fecha de generación',
         current_time.strftime('%d de %B de %Y  —  %H:%M')],
        ['Usuario',      tree.user.username if tree.user else 'N/A'],
    ]
    n_info = len(info_data) - 1
    info_table = Table(
        info_data,
        colWidths=[2.10 * inch, CONTENT_W - 2.10 * inch],
    )
    info_table.setStyle(TableStyle(
        header_cmds()
        + body_cmds(n_info)
        + [
            # Columna label: bold + azul
            ('FONTNAME',   (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 1), (0, -1), 8.5),
            ('TEXTCOLOR',  (0, 1), (0, -1), C_BLUE),
            ('ALIGN',      (0, 0), (0, -1), 'LEFT'),
        ]
    ))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # ─── Sección 2: Estadísticas ───────────────────────────────────────────────
    if tree.arbol_json:
        nodes = tree.arbol_json.get('nodes', [])
        stats = tree.arbol_json.get('statistics', {})

        if stats:
            story.append(Paragraph('Estadísticas del Árbol', S_section))
            story.append(HRFlowable(width='100%', thickness=0.5, color=C_BORDER,
                                     spaceAfter=10, spaceBefore=0))

            stat_items = list(stats.items())
            CARDS_PER_ROW = 3
            card_col_w = CONTENT_W / CARDS_PER_ROW

            # Construir filas de tarjetas
            card_rows = []
            for i in range(0, len(stat_items), CARDS_PER_ROW):
                batch = stat_items[i:i + CARDS_PER_ROW]
                row = []
                for key, val in batch:
                    label = key.replace('_', ' ').title().upper()
                    # Cada celda: [Paragraph label, Paragraph valor] → lista de flowables
                    row.append([
                        Paragraph(label, S_stat_label),
                        Paragraph(str(val), S_stat_value),
                    ])
                # Rellenar columnas vacías al final de la última fila
                while len(row) < CARDS_PER_ROW:
                    row.append('')
                card_rows.append(row)

            stats_table = Table(
                card_rows,
                colWidths=[card_col_w] * CARDS_PER_ROW,
            )
            stats_table.setStyle(TableStyle([
                # Fondo de tarjetas
                ('BACKGROUND',    (0, 0), (-1, -1), C_CARD_BG),
                ('ROWBACKGROUNDS', (0, 0), (-1, -1), [C_WHITE, C_BG]),
                # Bordes sutiles (sólo rejilla, sin bordes exteriores pesados)
                ('GRID',          (0, 0), (-1, -1), 0.4, C_BORDER),
                # Padding generoso para que las tarjetas "respiren"
                ('TOPPADDING',    (0, 0), (-1, -1), 16),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
                ('LEFTPADDING',   (0, 0), (-1, -1), 14),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 14),
                ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN',         (0, 0), (-1, -1), 'CENTER'),
            ]))
            story.append(stats_table)
            story.append(Spacer(1, 20))

        # ─── Sección 3: Nodos del árbol ───────────────────────────────────────
        story.append(Paragraph(f'Nodos del Árbol  ·  {len(nodes)} documentos',
                               S_section))
        story.append(HRFlowable(width='100%', thickness=0.5, color=C_BORDER,
                                 spaceAfter=10, spaceBefore=0))

        # Anchos de columna: ajustados para que sumen CONTENT_W exacto
        COL_N  = 0.30 * inch   # #
        COL_T  = 2.72 * inch   # Título
        COL_TY = 0.82 * inch   # Tipo
        COL_Y  = 0.44 * inch   # Año
        COL_A  = 1.84 * inch   # Autores
        COL_C  = 0.48 * inch   # Citas
        COL_S  = 0.40 * inch   # SAP
        node_cols = [COL_N, COL_T, COL_TY, COL_Y, COL_A, COL_C, COL_S]

        nodes_data = [['#', 'Título', 'Tipo', 'Año', 'Autores', 'Citas', 'SAP']]

        display_nodes = nodes[:100]
        for i, node in enumerate(display_nodes):
            title     = str(node.get('label', 'N/A'))
            ntype     = str(node.get('type_label', '—'))
            year      = str(node.get('year', '—'))
            authors   = node.get('authors', '')
            if isinstance(authors, list):
                # Limitar a 3 + "et al." para mantener las filas compactas
                preview = authors[:3]
                authors = '; '.join(str(a) for a in preview)
                if len(node.get('authors', [])) > 3:
                    authors += ' et al.'
            else:
                authors = str(authors)
            citations = str(node.get('times_cited', '—'))
            sap       = str(node.get('_sap', '—'))

            nodes_data.append([
                str(i + 1),
                Paragraph(title,   S_node),       # wrapping habilitado
                Paragraph(ntype,   S_node_sec),
                year,
                Paragraph(authors, S_node_sec),   # wrapping habilitado
                citations,
                sap,
            ])

        n_nodes = len(nodes_data) - 1
        node_cmds = (
            header_cmds()
            + [
                # Override font/size para celdas pequeñas
                ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE',      (0, 1), (-1, -1), 7.5),
                ('TEXTCOLOR',     (0, 1), (-1, -1), C_TEXT),
                ('VALIGN',        (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING',    (0, 1), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
                ('LEFTPADDING',   (0, 0), (-1, -1), 6),
                ('RIGHTPADDING',  (0, 0), (-1, -1), 6),
                # Sin bordes verticales, sólo horizontales
                ('LINEBELOW',     (0, 1), (-1, -2), 0.3, C_BORDER),
                ('LINEBELOW',     (0, -1), (-1, -1), 0.5, C_BORDER_MD),
                # Alineaciones por columna
                ('ALIGN',  (0, 1), (0, -1), 'CENTER'),   # #
                ('ALIGN',  (3, 1), (3, -1), 'CENTER'),   # Año
                ('ALIGN',  (5, 1), (6, -1), 'RIGHT'),    # Citas, SAP
                ('TEXTCOLOR', (5, 1), (5, -1), C_TEXT_SEC),
                ('TEXTCOLOR', (6, 1), (6, -1), C_TEXT_SEC),
            ]
        )
        # Zebra striping filas de nodos
        for i in range(1, n_nodes + 1):
            bg = C_ZEBRA if i % 2 == 0 else C_WHITE
            node_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))

        nodes_table = Table(nodes_data, colWidths=node_cols, repeatRows=1)
        nodes_table.setStyle(TableStyle(node_cmds))
        story.append(nodes_table)

        # Nota si el árbol tiene más de 100 nodos
        if len(nodes) > 100:
            story.append(Spacer(1, 8))
            story.append(Paragraph(
                f'Se muestran los primeros 100 nodos de {len(nodes)} documentos '
                f'totales registrados en el árbol.',
                S_caption,
            ))

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# CSV — sin cambios respecto a la versión anterior
# ─────────────────────────────────────────────────────────────────────────────

def generate_csv_sync(tree):
    """
    Generar CSV con nodos y metadata del árbol - Codificación UTF-8
    """
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['Árbol de la Ciencia - Exportación CSV'])
    writer.writerow(['ID', tree.id])
    writer.writerow(['Título', tree.title or 'Sin título'])
    writer.writerow(['Descripcion', tree.seed])
    writer.writerow(['Fecha', tree.fecha_generado.strftime('%d/%m/%Y %H:%M')])
    writer.writerow(['Usuario', tree.user.username if tree.user else 'N/A'])
    writer.writerow([])

    headers = ['#', 'Título', 'Tipo', 'Año', 'Autores', 'DOI', 'PMID',
               'arXiv', 'URL', 'Raíz', 'Tronco', 'Hoja', 'SAP', 'Citas']
    writer.writerow(headers)

    if tree.arbol_json:
        nodes = tree.arbol_json.get('nodes', [])
        for i, node in enumerate(nodes):
            def clean_text(text):
                if text is None:
                    return ''
                if isinstance(text, list):
                    text = '; '.join(str(item) for item in text)
                text = str(text).replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
                text = text.replace('"', '""')
                return text.strip()

            row = [
                i + 1,
                clean_text(node.get('label', '')),
                clean_text(node.get('type_label', '')),
                clean_text(node.get('year', '')),
                clean_text(node.get('authors', '')),
                clean_text(node.get('doi', '')),
                clean_text(node.get('pmid', '')),
                clean_text(node.get('arxiv_id', '')),
                clean_text(node.get('url', '')),
                clean_text(node.get('root', 0)),
                clean_text(node.get('trunk', 0)),
                clean_text(node.get('leaf', 0)),
                clean_text(node.get('_sap', 0)),
                clean_text(node.get('times_cited', 0)),
            ]
            writer.writerow(row)

    return output.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# UTILIDADES DE ARCHIVOS — sin cambios
# ─────────────────────────────────────────────────────────────────────────────

def save_temp_file(content, filename, content_type='application/pdf'):
    """Guardar archivo temporal y retornar ruta."""
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
    os.makedirs(temp_dir, exist_ok=True)

    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{filename}"
    filepath = os.path.join(temp_dir, unique_filename)

    if isinstance(content, str):
        with open(filepath, 'w', encoding='utf-8-sig') as f:
            f.write(content)
    else:
        with open(filepath, 'wb') as f:
            f.write(content)

    return f'/media/temp/{unique_filename}', unique_filename


def cleanup_temp_files():
    """Limpiar archivos temporales más antiguos de 1 hora."""
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
    if not os.path.exists(temp_dir):
        return

    current_time = time.time()
    for filename in os.listdir(temp_dir):
        filepath = os.path.join(temp_dir, filename)
        if os.path.isfile(filepath):
            if current_time - os.path.getmtime(filepath) > 3600:
                try:
                    os.remove(filepath)
                except Exception:
                    pass