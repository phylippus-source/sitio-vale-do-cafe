# Gera plan/energia-cargas.xlsx a partir de plan/energia-cargas.json (roda de qualquer pasta).
# Depois de gerar, recalcular com o recalc.py da skill xlsx; sem isso as fórmulas ficam sem valor guardado.
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P=json.load(open(os.path.join(RAIZ,'plan','energia-cargas.json')))['cargas']
wb=Workbook(); R=wb.active; R.title='Resumo'; C=wb.create_sheet('Cargas')
A=lambda **k: Font(**{'name':'Arial','size':10,**k})
azul=A(color='0000FF'); preto=A(); neg=A(bold=True); cab=PatternFill('solid',fgColor='D9E1F2'); amar=PatternFill('solid',fgColor='FFFF00')
hd=['Id','Carga','Local','Tipo','Uso (kW)','Horas/dia','Pico (kW)','Simult. (0–1)','Fração do ano (0–1)','kWh/dia (dia de uso)','kWh/dia (média anual)','Pico simult. (kW)','Nota']
for j,h in enumerate(hd,1):
    c=C.cell(1,j,h); c.font=neg; c.fill=cab; c.alignment=Alignment(wrap_text=True,vertical='center')
n=len(P)
for i,p in enumerate(P,2):
    vals=[p['id'],p['nome'],p['local'],p['tipo'],p['uso_kW'],p['horas_dia'],p['pico_kW'],p['simult'],p['fracao_ano']]
    for j,v in enumerate(vals,1):
        c=C.cell(i,j,v); c.font=azul if j>=5 else preto
    if p['id']=='hidroponia-led':
        C.cell(i,5,'=Resumo!$B$18*Resumo!$B$19/1000').font=preto
        C.cell(i,7,'=E%d'%i).font=preto
    C.cell(i,10,f'=E{i}*F{i}').font=preto
    C.cell(i,11,f'=J{i}*I{i}').font=preto
    C.cell(i,12,f'=G{i}*H{i}').font=preto
    C.cell(i,13,p['nota']).font=preto
    for j in (5,7,10,11,12): C.cell(i,j).number_format='#,##0.0;(#,##0.0);-'
    for j in (6,8,9): C.cell(i,j).number_format='0.00'
for j,w in enumerate([18,46,8,10,10,10,10,10,12,14,14,14,60],1): C.column_dimensions[get_column_letter(j)].width=w
C.row_dimensions[1].height=42; C.freeze_panes='C2'
last=n+1
R['A1']='Cargas de energia do Sítio Vale do Café'; R['A1'].font=A(bold=True,size=13)
R['A2']='Estimativas [E] do Claude, a confirmar. Edite os números em azul na aba Cargas; tudo aqui recalcula.'; R['A2'].font=A(italic=True)
hs=['Grupo','kWh/dia (dia de uso)','kWh/dia (média anual)','Pico simult. (kW)']
for j,h in enumerate(hs,1):
    c=R.cell(4,j,h); c.font=neg; c.fill=cab; c.alignment=Alignment(wrap_text=True)
rows=[('Elétrico total','eletrica',None),('Elétrico no bunker','eletrica','bunker'),('Elétrico no lote','eletrica','lote'),('Térmico total (kWh térmicos)','termica',None)]
rg=lambda col:f"Cargas!${col}$2:${col}${last}"
for i,(nm,t,l) in enumerate(rows,5):
    R.cell(i,1,nm).font=neg if i in (5,8) else preto
    for j,col in ((2,'J'),(3,'K'),(4,'L')):
        f=f'=SUMIFS({rg(col)},{rg("D")},"{t}"'+(f',{rg("C")},"{l}")' if l else ')')
        c=R.cell(i,j,f); c.font=preto; c.number_format='#,##0.0'
R['A10']='Autonomia e armazenamento'; R['A10'].font=neg
R['A11']='Dias de autonomia sem geração (decidido pelo Mestre)'; R['B11']=3; R['B11'].font=azul; R['B11'].fill=amar
R['A12']='Armazenamento elétrico mínimo (kWh) = dias × kWh/dia do dia de uso'; R['B12']='=B11*B5'; R['B12'].number_format='#,##0'
R['A13']='Armazenamento térmico mínimo (kWh térmicos)'; R['B13']='=B11*B8'; R['B13'].number_format='#,##0'
R['A14']='Média elétrica contínua (kW)'; R['B14']='=C5/24'; R['B14'].number_format='0.0'
R['A15']='Fator: autonomia mede o dia de uso inteiro (pior caso). A E4 ainda aplica profundidade de descarga e perdas.'; R['A15'].font=A(italic=True)
R['A17']='Alavanca principal: hidroponia LED (40 m² alto sustento + 60 m² ervas de renda)'; R['A17'].font=neg
R['A18']='Dossel iluminado (m²)'; R["B18"]=100; R['A19']='Potência do LED (W por m²)'; R['B19']=50
for c in ('B18','B19'): R[c].font=azul; R[c].fill=amar
R['A20']='kWh/dia da hidroponia LED (16 h)'; R['B20']='=Cargas!J2'; R['B20'].number_format='#,##0'
R['A21']='Parcela do consumo elétrico total'; R['B21']='=B20/B5'; R['B21'].number_format='0%'
for r in list(range(11,15))+[20,21]: R.cell(r,1).font=preto if R.cell(r,1).font.i is not True else R.cell(r,1).font
for row in R.iter_rows():
    for c in row:
        if c.font.name!='Arial': c.font=A()
R['B12'].font=preto;R['B13'].font=preto;R['B14'].font=preto;R['B20'].font=preto;R['B21'].font=preto
R.column_dimensions['A'].width=70
for col in 'BCD': R.column_dimensions[col].width=20
R.row_dimensions[4].height=30
wb.save(os.path.join(RAIZ,'plan','energia-cargas.xlsx'))
