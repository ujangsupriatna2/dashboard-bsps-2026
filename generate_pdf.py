#!/usr/bin/env python3
"""Generate PDF A4 Landscape - Data TFL Riska & Ujang BSPS 2026 Tahap IV
   Each desa on a separate page (page break per desa).
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

# ━━ Read Excel Data ━━
result = subprocess.run(
    ['bun', '-e', '''
const XLSX = require('xlsx');
const wb = XLSX.readFile('upload/Inver IV_Kab. Bandung.xlsx');
const sheet1 = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet1, {header:1});
const data = [];
let no = 1;
for(let i=5; i<rows.length; i++){
  const r = rows[i];
  if(!r || !r[0] || typeof r[0] !== 'number') continue;
  const desa = String(r[7]||'').trim();
  const kec = String(r[8]||'').trim();
  if((kec === 'IBUN' && (desa === 'CIBEET' || desa === 'LAMPEGAN')) || (kec === 'PASEH' && desa === 'LOA')){
    data.push({
      no: no++,
      nama: String(r[2]||''),
      lp: String(r[3]||''),
      ktp: String(r[4]||''),
      kk: String(r[5]||''),
      alamat: String(r[6]||'').replace(/\\r\\n/g, ' ').trim(),
      desa: desa,
      kec: kec,
      ket: String(r[14]||''),
      desil: String(r[15]||''),
    });
  }
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

# ━━ Column widths (A4 landscape ~802pt available) ━━
col_ratios = [0.045, 0.15, 0.04, 0.115, 0.115, 0.18, 0.075, 0.09, 0.12, 0.08]
col_widths = [r * available_width for r in col_ratios]

# ━━ Helper: build table for a desa ━━
headers = ['No', 'Nama', 'L/P', 'No KTP', 'No KK', 'Alamat', 'Desa', 'Kecamatan', 'Keterangan', 'Pengelompokan Desil']

def build_desa_table(rows):
    table_data = []
    table_data.append([Paragraph(f'<b>{h}</b>', header_cell_style) for h in headers])
    for i, r in enumerate(rows, 1):
        row = [
            Paragraph(str(i), cell_style),
            Paragraph(r['nama'], cell_left_style),
            Paragraph(r['lp'], cell_style),
            Paragraph(r['ktp'], cell_style),
            Paragraph(r['kk'], cell_style),
            Paragraph(r['alamat'], cell_left_style),
            Paragraph(r['desa'], cell_left_style),
            Paragraph(r['kec'], cell_left_style),
            Paragraph(r['ket'], cell_left_style),
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

# ---- DESA 2: LAMPEGAN ----
rows_lampegan = grouped['LAMPEGAN']
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_style))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', subtitle_style))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LAMPEGAN - Kecamatan IBUN</b>', desa_title_style))
story.append(Paragraph('Jumlah penerima: ' + str(len(rows_lampegan)) + ' orang', desa_info_style))
story.append(Spacer(1, 4))
story.append(build_desa_table(rows_lampegan))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Lampegan', footer_style))

# Page break before LOA
story.append(PageBreak())

# ---- DESA 3: LOA ----
rows_loa = grouped['LOA']
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_style))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', subtitle_style))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LOA - Kecamatan PASEH</b>', desa_title_style))
story.append(Paragraph('Jumlah penerima: ' + str(len(rows_loa)) + ' orang', desa_info_style))
story.append(Spacer(1, 4))
story.append(build_desa_table(rows_loa))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Loa', footer_style))

# ━━ Build PDF ━━
doc.build(story)
print(f"PDF generated: {output_path}")
