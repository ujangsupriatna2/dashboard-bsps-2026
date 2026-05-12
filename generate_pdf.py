#!/usr/bin/env python3
"""Generate PDF A4 Landscape - Data TFL Riska & Ujang BSPS 2026 Tahap IV
   Reads from output Excel. Includes Tidak ACC sheet for LOA.
"""

import json, subprocess
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

# ━━ Colors ━━
ACCENT = colors.HexColor('#bd263f')
TEXT_PRIMARY = colors.HexColor('#232220')
TEXT_MUTED = colors.HexColor('#78746d')
BG_SURFACE = colors.HexColor('#e7e4df')
BG_REPLACE = colors.HexColor('#d4edda')
BG_RED = colors.HexColor('#f8d7da')
RED_TEXT = colors.HexColor('#721c24')

# ━━ Page Setup ━━
page_w, page_h = landscape(A4)
margin = 15 * mm
aw = page_w - margin * 2
output_path = "/home/z/my-project/upload/Data_Riska_Ujang_TFL_IBUN.pdf"

doc = SimpleDocTemplate(output_path, pagesize=landscape(A4),
    leftMargin=margin, rightMargin=margin, topMargin=margin, bottomMargin=margin,
    title="Data TFL Riska dan Ujang - BSPS 2026 Tahap IV",
    author="Ujang Supriatna")

# ━━ Styles ━━
S = lambda name, **kw: ParagraphStyle(name, fontName='DejaVuSans', **kw)
title_s = S('Title', fontSize=14, leading=18, alignment=TA_CENTER, textColor=TEXT_PRIMARY, spaceAfter=1)
sub_s = S('Sub', fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=4)
desa_s = S('Desa', fontSize=12, leading=15, alignment=TA_LEFT, textColor=ACCENT, spaceAfter=2)
info_s = S('Info', fontSize=9, leading=12, alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=4)
hdr_s = S('Hdr', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=colors.white)
cell_s = S('Cell', fontSize=8, leading=10.5, alignment=TA_CENTER, textColor=TEXT_PRIMARY)
cellL_s = S('CellL', fontSize=8, leading=10.5, alignment=TA_LEFT, textColor=TEXT_PRIMARY)
ft_s = S('Ft', fontSize=7.5, leading=10, alignment=TA_CENTER, textColor=TEXT_MUTED)
sum_s = S('Sum', fontSize=9, leading=12, alignment=TA_LEFT, textColor=TEXT_PRIMARY)

# ━━ Read Data ━━
result = subprocess.run(['bun', '-e', '''
const XLSX = require("xlsx");
const wb = XLSX.readFile("upload/Data_Riska_Ujang_TFL_IBUN.xlsx");
const out = {};

// Sheet 1: Data Penerima
const s1 = wb.Sheets["Data Penerima"];
const r1 = XLSX.utils.sheet_to_json(s1, {header:1, defval:""});
out.penerima = [];
for(let i=1; i<r1.length; i++){
  const r = r1[i];
  if(!r[1]) continue;
  out.penerima.push({
    no: r[0], nama: String(r[1]), lp: String(r[2]),
    ktp: String(r[3]), kk: String(r[4]), alamat: String(r[5]),
    desa: String(r[6]).trim(), kec: String(r[7]).trim(), ket: String(r[10]),
    pengganti: String(r[10]).includes("Pengganti") || String(r[10]).includes("Baru"),
  });
}

// Sheet 3: Tidak ACC
const s3 = wb.Sheets["Tidak ACC - LOA"];
out.tidak_acc = [];
if(s3){
  const r3 = XLSX.utils.sheet_to_json(s3, {header:1, defval:""});
  for(let i=1; i<r3.length; i++){
    const r = r3[i];
    if(!r[1]) continue;
    out.tidak_acc.push({
      no: r[0], nama: String(r[1]), lp: String(r[2]),
      ktp: String(r[3]), kk: String(r[4]), alamat: String(r[5]),
      alasan: String(r[6]),
    });
  }
}

console.log(JSON.stringify(out));
'''], capture_output=True, text=True, cwd='/home/z/my-project')
data = json.loads(result.stdout)
penerima = data['penerima']
tidak_acc = data['tidak_acc']

grouped = {}
for d in ['CIBEET','LAMPEGAN','LOA']:
    grouped[d] = [r for r in penerima if r.get('desa') == d]

total_l = sum(1 for r in penerima if r['lp'] == 'L')
total_p = sum(1 for r in penerima if r['lp'] == 'P')

# ━━ Table builders ━━
acc_headers = ['No','Nama','L/P','No KTP','No KK','Alamat','Desa','Kecamatan','Keterangan']
col_w = [0.045, 0.15, 0.04, 0.115, 0.115, 0.18, 0.075, 0.09, 0.12]
col_widths = [r * aw for r in col_w]

def build_acc_table(rows, highlight=None):
    if highlight is None: highlight = set()
    td = [[Paragraph(f'<b>{h}</b>', hdr_s) for h in acc_headers]]
    for i, r in enumerate(rows, 1):
        ket = r['ket']
        if i in highlight:
            ket = '<font color="#155724"><b>\u2605 Data Pengganti</b></font>'
        td.append([
            Paragraph(str(i), cell_s), Paragraph(r['nama'], cellL_s), Paragraph(r['lp'], cell_s),
            Paragraph(r['ktp'], cell_s), Paragraph(r['kk'], cell_s), Paragraph(r['alamat'], cellL_s),
            Paragraph(r['desa'], cellL_s), Paragraph(r['kec'], cellL_s), Paragraph(ket, cellL_s),
        ])
    t = Table(td, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    cmds = [
        ('BACKGROUND',(0,0),(-1,0), ACCENT), ('TEXTCOLOR',(0,0),(-1,0), colors.white),
        ('GRID',(0,0),(-1,-1), 0.4, TEXT_MUTED), ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),4), ('RIGHTPADDING',(0,0),(-1,-1),4),
        ('TOPPADDING',(0,0),(-1,-1),3), ('BOTTOMPADDING',(0,0),(-1,-1),3),
    ]
    for i in range(1, len(td)):
        if i in highlight:
            cmds.append(('BACKGROUND',(0,i),(-1,i), BG_REPLACE))
        else:
            cmds.append(('BACKGROUND',(0,i),(-1,i), colors.white if i%2==1 else BG_SURFACE))
    t.setStyle(TableStyle(cmds))
    return t

# Tidak ACC table
na_headers = ['No','Nama','L/P','No KTP','No KK','Alamat','Alasan Tidak ACC']
na_col_w = [0.04, 0.15, 0.04, 0.12, 0.12, 0.27, 0.18]
na_widths = [r * aw for r in na_col_w]

def build_tidak_acc_table(rows):
    td = [[Paragraph(f'<b>{h}</b>', hdr_s) for h in na_headers]]
    for r in rows:
        td.append([
            Paragraph(str(r['no']), cell_s), Paragraph(r['nama'], cellL_s),
            Paragraph(r['lp'], cell_s), Paragraph(r['ktp'], cell_s),
            Paragraph(r['kk'], cell_s), Paragraph(r['alamat'], cellL_s),
            Paragraph('<b>' + r['alasan'] + '</b>', cellL_s),
        ])
    t = Table(td, colWidths=na_widths, hAlign='CENTER')
    cmds = [
        ('BACKGROUND',(0,0),(-1,0), colors.HexColor('#6c757d')),
        ('TEXTCOLOR',(0,0),(-1,0), colors.white),
        ('GRID',(0,0),(-1,-1), 0.4, TEXT_MUTED), ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),4), ('RIGHTPADDING',(0,0),(-1,-1),4),
        ('TOPPADDING',(0,0),(-1,-1),3), ('BOTTOMPADDING',(0,0),(-1,-1),3),
        ('BACKGROUND',(-1,1),(-1,-1), colors.HexColor('#fff3cd')),
    ]
    for i in range(1, len(td)):
        cmds.append(('BACKGROUND',(0,i),(-2,i), colors.white if i%2==1 else BG_SURFACE))
    t.setStyle(TableStyle(cmds))
    return t

# ━━ Build Story ━━
story = []

# ---- HEADER ----
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_s))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', sub_s))
story.append(Spacer(1, 6))

sd = [
    [Paragraph('<b>Kecamatan</b>: IBUN, PASEH', sum_s),
     Paragraph('<b>Total ACC</b>: ' + str(len(penerima)) + ' orang', sum_s),
     Paragraph('<b>Laki-laki</b>: ' + str(total_l), sum_s),
     Paragraph('<b>Perempuan</b>: ' + str(total_p), sum_s)],
]
st = Table(sd, colWidths=[aw/4]*4, hAlign='CENTER')
st.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1), BG_SURFACE), ('BOX',(0,0),(-1,-1),0.5,TEXT_MUTED),
    ('INNERGRID',(0,0),(-1,-1),0.3,colors.white), ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('LEFTPADDING',(0,0),(-1,-1),6), ('RIGHTPADDING',(0,0),(-1,-1),6),
    ('TOPPADDING',(0,0),(-1,-1),5), ('BOTTOMPADDING',(0,0),(-1,-1),5),
]))
story.append(st)
story.append(Spacer(1, 10))

# ---- CIBEET ----
story.append(Paragraph('<b>Desa CIBEET - Kecamatan IBUN</b>', desa_s))
story.append(Paragraph('Jumlah penerima ACC: ' + str(len(grouped['CIBEET'])) + ' orang', info_s))
story.append(Spacer(1, 4))
story.append(build_acc_table(grouped['CIBEET']))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Cibeet', ft_s))
story.append(PageBreak())

# ---- LAMPEGAN ----
hl_lamp = {i+1 for i, r in enumerate(grouped['LAMPEGAN']) if r['pengganti']}
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_s))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', sub_s))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LAMPEGAN - Kecamatan IBUN</b>', desa_s))
story.append(Paragraph('Jumlah penerima ACC: ' + str(len(grouped['LAMPEGAN'])) + ' orang (baris hijau = data pengganti)', info_s))
story.append(Spacer(1, 4))
story.append(build_acc_table(grouped['LAMPEGAN'], highlight=hl_lamp))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Lampegan', ft_s))
story.append(PageBreak())

# ---- LOA (ACC) ----
hl_loa = {i+1 for i, r in enumerate(grouped['LOA']) if r['pengganti']}
story.append(Paragraph('<b>Data Calon Penerima BSPS 2026 Tahap IV</b>', title_s))
story.append(Paragraph('TFL Teknik: Riska Arie Haryanti | TFL Pemberdayaan: Ujang Supriatna', sub_s))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>Desa LOA - Kecamatan PASEH</b>', desa_s))
story.append(Paragraph('Jumlah penerima ACC: ' + str(len(grouped['LOA'])) + ' orang (baris hijau = data pengganti/baru)', info_s))
story.append(Spacer(1, 4))
story.append(build_acc_table(grouped['LOA'], highlight=hl_loa))
story.append(Spacer(1, 10))

# ---- TIDAK ACC LOA ----
na_title_s = S('NaTitle', fontSize=10, leading=13, alignment=TA_LEFT, textColor=RED_TEXT, spaceAfter=4)
na_info_s = S('NaInfo', fontSize=9, leading=12, alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=4)

story.append(Paragraph('<b>Data Tidak ACC - Desa LOA</b>', na_title_s))
story.append(Paragraph('Jumlah tidak ACC: ' + str(len(tidak_acc)) + ' orang (11 Layak Huni, 1 Tidak Melanjutkan)', na_info_s))
story.append(Spacer(1, 4))
story.append(build_tidak_acc_table(tidak_acc))
story.append(Spacer(1, 6))
story.append(Paragraph('BSPS 2026 Tahap IV - Kab. Bandung - Desa Loa', ft_s))

# ━━ Build ━━
doc.build(story)
print(f"PDF generated: {output_path}")
