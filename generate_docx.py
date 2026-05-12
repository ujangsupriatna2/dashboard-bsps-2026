#!/usr/bin/env python3
"""Generate Word (.docx) - Data TFL Riska & Ujang BSPS 2026 Tahap IV
   Each desa on a separate page. Green highlight for pengganti rows.
"""

import json, subprocess
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

# ━━ Colors ━━
ACCENT = RGBColor(0xBD, 0x26, 0x3F)
TEXT_PRIMARY = RGBColor(0x23, 0x22, 0x20)
TEXT_MUTED = RGBColor(0x78, 0x74, 0x6D)
GREEN_BG = "D4EDDA"
SURFACE_BG = "E7E4DF"
WHITE = "FFFFFF"
ACCENT_HEX = "BD263F"

output_path = "/home/z/my-project/upload/Data_Riska_Ujang_TFL_IBUN.docx"

# ━━ Read Excel Data ━━
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
  const isPengganti = String(r[10]||'').includes('Pengganti') || String(r[10]||'').includes('Baru');
  data.push({
    no: r[0],
    nama: String(r[1]||''),
    lp: String(r[2]||''),
    ktp: String(r[3]||''),
    kk: String(r[4]||''),
    alamat: String(r[5]||''),
    desa: String(r[6]||'').trim(),
    kec: String(r[7]||'').trim(),
    ket: String(r[10]||''),
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

# ━━ Helper Functions ━━
def set_cell_shading(cell, color_hex):
    """Set cell background color."""
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def set_cell_text(cell, text, bold=False, color=None, size=8, align='center'):
    """Set cell text with formatting."""
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = {
        'center': WD_ALIGN_PARAGRAPH.CENTER,
        'left': WD_ALIGN_PARAGRAPH.LEFT,
    }.get(align, WD_ALIGN_PARAGRAPH.CENTER)
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(1)
    run = p.add_run(str(text))
    run.font.size = Pt(size)
    run.font.name = 'Calibri'
    if bold:
        run.bold = True
    if color:
        run.font.color.rgb = color

def add_borders(table):
    """Add borders to all cells in table."""
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else parse_xml(f'<w:tblPr {nsdecls("w")}/>')
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        '  <w:top w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '  <w:left w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '  <w:right w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="AAAAAA"/>'
        '</w:tblBorders>'
    )
    tblPr.append(borders)

def create_desa_table(doc, rows, desa_name):
    """Create a formatted table for a desa."""
    headers = ['No', 'Nama', 'L/P', 'No KTP', 'No KK', 'Alamat', 'Desa', 'Kecamatan', 'Keterangan']
    col_widths = [0.6, 2.2, 0.5, 1.8, 1.8, 2.8, 1.0, 1.0, 1.8]

    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    add_borders(table)

    # Set column widths
    for i, width in enumerate(col_widths):
        for row in table.rows:
            row.cells[i].width = Cm(width)

    # Header row
    for j, h in enumerate(headers):
        set_cell_shading(table.rows[0].cells[j], ACCENT_HEX)
        set_cell_text(table.rows[0].cells[j], h, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF), size=8)

    # Data rows
    for i, r in enumerate(rows, 1):
        values = [
            r['no'], r['nama'], r['lp'], r['ktp'], r['kk'],
            r['alamat'], r['desa'], r['kec'],
            '★ Data Pengganti' if r['pengganti'] else (r['ket'] or '-')
        ]
        for j, val in enumerate(values):
            align = 'left' if j in [1, 5, 8] else 'center'
            if r['pengganti']:
                set_cell_shading(table.rows[i].cells[j], GREEN_BG)
            elif i % 2 == 0:
                set_cell_shading(table.rows[i].cells[j], SURFACE_BG)
            else:
                set_cell_shading(table.rows[i].cells[j], WHITE)
            set_cell_text(table.rows[i].cells[j], val, size=8, align=align)

    return table

# ━━ Build Document ━━
doc = Document()

# Page setup - Landscape A4
section = doc.sections[0]
section.page_width = Cm(29.7)
section.page_height = Cm(21.0)
section.left_margin = Cm(1.5)
section.right_margin = Cm(1.5)
section.top_margin = Cm(1.5)
section.bottom_margin = Cm(1.5)

# ━━━ PAGE 1: CIBEET ━━━
# Title
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Data Calon Penerima BSPS 2026 Tahap IV')
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = TEXT_PRIMARY

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna')
run.font.size = Pt(10)
run.font.color.rgb = TEXT_MUTED

# Summary
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run(f'Kecamatan: IBUN, PASEH  |  Total: {len(penerima)} orang  |  Laki-laki: {total_l}  |  Perempuan: {total_p}')
run.font.size = Pt(9)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()

# Desa title
p = doc.add_paragraph()
run = p.add_run(f'Desa CIBEET - Kecamatan IBUN')
run.bold = True
run.font.size = Pt(11)
run.font.color.rgb = ACCENT

p = doc.add_paragraph()
run = p.add_run(f'Jumlah penerima: {len(grouped["CIBEET"])} orang')
run.font.size = Pt(9)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()
create_desa_table(doc, grouped['CIBEET'], 'CIBEET')

# ━━━ PAGE 2: LAMPEGAN ━━━
doc.add_page_break()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Data Calon Penerima BSPS 2026 Tahap IV')
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = TEXT_PRIMARY

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna')
run.font.size = Pt(10)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()

p = doc.add_paragraph()
run = p.add_run(f'Desa LAMPEGAN - Kecamatan IBUN')
run.bold = True
run.font.size = Pt(11)
run.font.color.rgb = ACCENT

p = doc.add_paragraph()
run = p.add_run(f'Jumlah penerima: {len(grouped["LAMPEGAN"])} orang (baris hijau = data pengganti)')
run.font.size = Pt(9)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()
create_desa_table(doc, grouped['LAMPEGAN'], 'LAMPEGAN')

# ━━━ PAGE 3: LOA ━━━
doc.add_page_break()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('Data Calon Penerima BSPS 2026 Tahap IV')
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = TEXT_PRIMARY

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna')
run.font.size = Pt(10)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()

loa_pengganti_count = sum(1 for r in grouped['LOA'] if r['pengganti'])
p = doc.add_paragraph()
run = p.add_run(f'Desa LOA - Kecamatan PASEH')
run.bold = True
run.font.size = Pt(11)
run.font.color.rgb = ACCENT

p = doc.add_paragraph()
run = p.add_run(f'Jumlah penerima: {len(grouped["LOA"])} orang (baris hijau = data pengganti/baru)')
run.font.size = Pt(9)
run.font.color.rgb = TEXT_MUTED

doc.add_paragraph()
create_desa_table(doc, grouped['LOA'], 'LOA')

# ━━ Save ━━
doc.save(output_path)
print(f"Word document generated: {output_path}")
