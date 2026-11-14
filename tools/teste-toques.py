"""Teste de fumaça dos literais de toque (B0-4d-2a): força 5 afinidades e confere a geometria. Rodar da raiz: venv/bin/python -I tools/teste-toques.py"""
import sys,importlib.util
pass
spec=importlib.util.spec_from_file_location('pb','tools/pack-bunker.py');pb=importlib.util.module_from_spec(spec);spec.loader.exec_module(pb)
from ortools.sat.python import cp_model
P,S=pb.ler('plan/bunker.json'),pb.ler('plan/site.json')
m,c=pb.construir(P,S,1)
print('pares',len(c['t']))
for k in [('baterias','suporte'),('agua','hidroponia'),('labs','limpa'),('despensa','montacarga'),('baterias','datacenter')]:
    m.add(c['t'][k]==1)
pb.dica(m,c,P)
s=cp_model.CpSolver();s.parameters.max_time_in_seconds=40;s.parameters.num_workers=2
st=s.solve(m);print(s.status_name(st))
if st in (cp_model.OPTIMAL,cp_model.FEASIBLE):
    v=c['v'];bad=0;on=0
    for (a,b),lit in c['t'].items():
        A={k:s.value(x) for k,x in v[a].items() if x is not None and k!='pres'};B={k:s.value(x) for k,x in v[b].items() if x is not None and k!='pres'}
        ox=min(A['ex'],B['ex'])-max(A['x'],B['x']);oy=min(A['ey'],B['ey'])-max(A['y'],B['y'])
        real=(A['ex']==B['x'] or B['ex']==A['x']) and oy>=2 or (A['ey']==B['y'] or B['ey']==A['y']) and ox>=2
        if s.value(lit):
            on+=1
            if not real: bad+=1;print('FALSO',a,b)
    print('ligados',on,'falsos',bad,'area',s.value(c['A'])/4)
