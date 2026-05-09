#!/usr/bin/env python3
"""Generate PDF A4 Landscape - Data TFL Riska & Ujang BSPS 2026 Tahap IV
   Each desa on a separate page (page break per desa).
   Reads from the output Excel (Data_Riska_Ujang_TFL_IBUN.xlsx).
"""

import json, subprocess, os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Register Fonts ━━
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSansBold')

# ━━ Color Palette ━━
ACCENT = colors.HexColor('#bd263f')
TEXT_PRIMARY = colors.HexColor('#232220')
TEXT_MUTED = colors.HexColor('#78746d')
BG_SURFACE = colors.HexColor('#e7e4df')
BG_REPLACE = colors.HexColor('#d4edda')  # Green highlight for replacement rows

# ━━ Page Setup (A4 Landscape) ━━
page_w, page_h = landscape(A4)
left_margin = 15 * mm
right_margin = 15 * mm
top_margin = 15 * mm
bottom_margin = 15 * mm
available_width = page_w - left_margin - right_margin

output_path = "/home/z/my-project/upload/Data_Riska_Ujang_TFL_IBUN.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=landscape(A4),
    leftMargin=left_margin,
    rightMargin=right_margin,
    topMargin=top_margin,
    bottomMargin=bottom_margin,
    title="Data TFL Riska dan Ujang - BSPS 2026 Tahap IV",
    author="Ujang Supriatna",
    subject="Data Calon Penerima BSPS 2026 - Kecamatan IBUN & PASEH",
)

# ━━ Styles ━━
title_style = ParagraphStyle(
    name='Title', fontName='DejaVuSans', fontSize=14, leading=18,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY, spaceAfter=1,
)
subtitle_style = ParagraphStyle(
    name='Subtitle', fontName='DejaVuSans', fontSize=9.5, leading=13,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=4,
)
desa_title_style = ParagraphStyle(
    name='DesaTitle', fontName='DejaVuSans', fontSize=12, leading=15,
    alignment=TA_LEFT, textColor=ACCENT, spaceAfter=2,
)
desa_info_style = ParagraphStyle(
    name='DesaInfo', fontName='DejaVuSans', fontSize=9, leading=12,
    alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=4,
)
header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='DejaVuSans', fontSize=8.5, leading=11,
    alignment=TA_CENTER, textColor=colors.white,
)
cell_style = ParagraphStyle(
    name='Cell', fontName='DejaVuSans', fontSize=8, leading=10.5,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY,
)
cell_left_style = ParagraphStyle(
    name='CellLeft', fontName='DejaVuSans', fontSize=8, leading=10.5,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY,
)
footer_style = ParagraphStyle(
    name='Footer', fontName='DejaVuSans', fontSize=7.5, leading=10,
    alignment=TA_CENTER, textColor=TEXT_MUTED,
)
summary_label_style = ParagraphStyle(
    name='SummaryLabel', fontName='DejaVuSans', fontSize=9, leading=12,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY,
)

# ━━ Read Excel Data (from output Excel) ━━
result = subprocess.run(
    ['bun', '-e', '''
const XLSX = require('xlsx');
const wb = XLSX.readFile('upload/Data_Riska_Ujang_TFL_IBUN.xlsx');
const sheet = wb.Sheets["Data Penerima"];
const rows = XLSX.utils.sheet_to_json(sheet, {header:1});
const data = [];
for(let i=1; i<rows.length; i++){
  const r = rows[i];
  if(!r || !r[1]) continue;
  const isPengganti = String(r[10]||'').includes('Pengganti');
  data.push({
    no: r[0],
    nama: String(r[1]||''),
    lp: String(r[2]||''),
    ktp: String(r[3]||''),
    kk: String(r[4]||''),
    alamat: String(r[5]||''),
    desa: String(r[6]||'').trim(),
    kec: String(r[7]||'').trim(),
    kab: String(r[8]||'').trim(),
    prov: String(r[9]||'').trim(),
    ket: String(r[10]||''),
    desil: String(r[11]||''),
    pengganti: isPengganti,
  });
}
console.log(JSON.stringify(data));
'''],
    capture_output=True, text=True, cwd='/home/z/my-project'
)
penerima = json.loads(result.stdout)

# ━━ Group by Desa ━━
desa_order = ['CIBEET', 'LAMPEGAN', 'LOA']
grouped = {}
for d in desa_order:
    grouped[d] = [r for r in penerima if r['desa'] == d]

total_l = sum(1 for r in penerima if r['lp'] == 'L')
total_p = sum(1 for r in penerima if r['lp'] == 'P')
total_pengganti = sum(1 for r in penerima if r['pengganti'])

# ━━ Column widths (A4 landscape ~802pt available) ━━
col_ratios = [0.045, 0.15, 0.04, 0.115, 0.115, 0.18, 0.075, 0.09, 0.12, 0.08]
col_widths = [r * available_width for r in col_ratios]

# ━━ Helper: build table for a desa ━━
headers = ['No', 'Nama', 'L/P', 'No KTP', 'No KK', 'Alamat', 'Desa', 'Kecamatan', 'Keterangan', 'Pengelompokan Desil']

def build_desa_table(rows, highlight_indices=None):
    """Build table. highlight_indices = set of 1-based row numbers to highlight green."""
    if highlight_indices is None:
        highlight_indices = set()
    table_data = []
    table_data.append([Paragraph(f'<b>{h}</b>', header_cell_style) for h in headers])
    for i, r in enumerate(rows, 1):
        ket_text = r['ket']
        if i in highlight_indices:
            ket_text = '<font color="#155724"><b>★ Data Pengganti</b></font>' + (' | ' + r['ket'].replace(' | Data Pengganti', '').replace('Data Pengganti', '').strip(' |') if r['ket'] else '')
        row = [
            Paragraph(str(i), cell_style),
            Paragraph(r['nama'], cell_left_style),
            Paragraph(r['lp'], cell_style),
            Paragraph(r['ktp'], cell_style),
            Paragraph(r['kk'], cell_style),
            Paragraph(r['alamat'], cell_left_style),
            Paragraph(r['desa'], cell_left_style),
            Paragraph(r['kec'], cell_left_style),
            Paragraph(ket_text, cell_left_style),
            Paragraph(r['desil'], cell_left_style),
        ]
        table_data.append(row)

    table = Table(table_data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.4, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    for i in range(1, len(table_data)):
        if i in highlight_indices:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), BG_REPLACE))
        else:
            bg = colors.white if i % 2 == 1 else BG_SURFACE
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    table.setStyle(TableStyle(style_cmds))
    return table


# ━━ Build Story ━━
story = []

# ---- COVER / HEADER (Page 1) ----
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_style))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', subtitle_style))
story.append(Spacer(1, 6))

# Summary bar
summary_data = [
    [Paragraph('<b>Kecamatan</b>: IBUN, PASEH', summary_label_style),
     Paragraph('<b>Total</b>: ' + str(len(penerima)) + ' orang', summary_label_style),
     Paragraph('<b>Laki-laki</b>: ' + str(total_l), summary_label_style),
     Paragraph('<b>Perempuan</b>: ' + str(total_p), summary_label_style)],
]
summary_table = Table(summary_data, colWidths=[available_width / 4] * 4, hAlign='CENTER')
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), BG_SURFACE),
    ('BOX', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('INNERGRID', (0, 0), (-1, -1), 0.3, colors.white),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(summary_table)
story.append(Spacer(1, 10))

# ---- DESA 1: CIBEET ----
rows_cibeet = grouped['CIBEET']
story.append(Paragraph('<b>Desa CIBEET - Kecamatan IBUN</b>', desa_title_style))
story.append(Paragraph('Jumlah penerima: ' + str(len(rows_cibeet)) + ' orang', desa_info_style))
story.append(Spacer(1, 4))
story.append(build_desa_table(rows_cibeet))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Cibeet', footer_style))

# Page break before LAMPEGAN
story.append(PageBreak())

# ---- DESA 2: LAMPEGAN (dengan data pengganti) ----
rows_lampegan = list(grouped['LAMPEGAN'])  # copy
highlight_set = set()
for i, r in enumerate(rows_lampegan, 1):
    if r['pengganti']:
        highlight_set.add(i)

story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_style))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', subtitle_style))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LAMPEGAN - Kecamatan IBUN</b>', desa_title_style))
story.append(Paragraph('Jumlah penerima: ' + str(len(rows_lampegan)) + ' orang (baris hijau = data pengganti)', desa_info_style))
story.append(Spacer(1, 4))
story.append(build_desa_table(rows_lampegan, highlight_indices=highlight_set))
story.append(Spacer(1, 10))

# ---- LAMPIRAN: Data yang diganti ----
lampiran_title_style = ParagraphStyle(
    name='LampiranTitle', fontName='DejaVuSans', fontSize=10, leading=13,
    alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=4,
)
lampiran_header_style = ParagraphStyle(
    name='LampiranHeader', fontName='DejaVuSans', fontSize=8, leading=10,
    alignment=TA_CENTER, textColor=colors.white,
)
lampiran_cell_style = ParagraphStyle(
    name='LampiranCell', fontName='DejaVuSans', fontSize=7.5, leading=10,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY,
)
lampiran_cell_center = ParagraphStyle(
    name='LampiranCellCenter', fontName='DejaVuSans', fontSize=7.5, leading=10,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY,
)
lampiran_strike_style = ParagraphStyle(
    name='LampiranStrike', fontName='DejaVuSans', fontSize=7.5, leading=10,
    alignment=TA_LEFT, textColor=TEXT_MUTED,
)

story.append(Paragraph('<b>Lampiran - Data Penerima yang Diganti (Desa Lampegan)</b>', lampiran_title_style))

lamp_headers = ['No', 'Nama Diganti', 'NIK', 'No KK', 'Alamat', 'Diganti Oleh']
lamp_col_ratios = [0.04, 0.15, 0.14, 0.14, 0.25, 0.13]
lamp_col_widths = [r * available_width for r in lamp_col_ratios]

# Data lama (diganti) → Data baru (pengganti)
lampiran_rows = [
    ['1', 'Encar', '3204364101600008', '3204360612130038', 'KP. Citeureup 002/008', 'Wawan Setiawan'],
    ['2', 'Andri', '3204360907970002', '3204361809190001', 'KP. Cikonyal 001/011', 'Arief Mochamad Ikbal'],
    ['3', 'Dedeh', '3204364107680030', '3204360112120006', 'KP. Citeureup 002/008', 'Asih'],
    ['4', 'Memen', '3204351103720001', '3204363112190003', 'KP. Jolok 001/006', 'Yati'],
    ['5', 'Sodikin', '3204330703920003', '3204361706200001', 'KP. Jolok 001/006', 'Rohmat'],
    ['6', 'Cecep', '3204360102550003', '3204361903051912', 'JL. Pangguh 001/007', 'Ai Maryati'],
]

lamp_table_data = []
lamp_table_data.append([Paragraph(f'<b>{h}</b>', lampiran_header_style) for h in lamp_headers])
for row in lampiran_rows:
    lamp_table_data.append([
        Paragraph(row[0], lampiran_cell_center),
        Paragraph('<s>' + row[1] + '</s>', lampiran_strike_style),
        Paragraph('<s>' + row[2] + '</s>', lampiran_strike_style),
        Paragraph('<s>' + row[3] + '</s>', lampiran_strike_style),
        Paragraph('<s>' + row[4] + '</s>', lampiran_strike_style),
        Paragraph('<b>' + row[5] + '</b>', lampiran_cell_style),
    ])

lamp_table = Table(lamp_table_data, colWidths=lamp_col_widths, hAlign='CENTER')
lamp_style_cmds = [
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6c757d')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.4, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ('BACKGROUND', (-1, 1), (-1, -1), colors.HexColor('#fff3cd')),
]
for i in range(1, len(lamp_table_data)):
    bg = colors.white if i % 2 == 1 else BG_SURFACE
    lamp_style_cmds.append(('BACKGROUND', (0, i), (-2, i), bg))
lamp_table.setStyle(TableStyle(lamp_style_cmds))
story.append(lamp_table)
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Lampegan', footer_style))

# Page break before LOA
story.append(PageBreak())

# ---- DESA 3: LOA ----
rows_loa = grouped['LOA']
# Check if LOA has pengganti data
loa_highlight = set()
for i, r in enumerate(rows_loa, 1):
    if r['pengganti']:
        loa_highlight.add(i)

loa_info = 'Jumlah penerima: ' + str(len(rows_loa)) + ' orang'
if loa_highlight:
    loa_info += ' (baris hijau = data pengganti)'

story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_style))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', subtitle_style))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LOA - Kecamatan PASEH</b>', desa_title_style))
story.append(Paragraph(loa_info, desa_info_style))
story.append(Spacer(1, 4))
story.append(build_desa_table(rows_loa, highlight_indices=loa_highlight))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Loa', footer_style))

# ━━ Build PDF ━━
doc.build(story)
print(f"PDF generated: {output_path}")
