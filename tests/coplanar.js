// Detector de conflitos coplanares (z-fighting): planos coincidentes, mesma face, cores diferentes.
// Regra: o numero de pares nao pode aumentar em relacao a baseline. --update grava baseline.
const fs = require('fs');
const path = require('path');
const { open, ROOT } = require('./harness');
const BASE = path.join(ROOT, 'golden', 'coplanar.baseline.json');

(async () => {
  const { browser, page, errors } = await open({ width: 900, height: 700 });
  const out = await page.evaluate(() => {
   const scene=__scene,dio=__dio,hull=__hull; dio.updateMatrixWorld(true);
   const inv=new THREE.Matrix4().copy(dio.matrixWorld).invert();
   const T=[]; const v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],e1=new THREE.Vector3(),e2=new THREE.Vector3(),nn=new THREE.Vector3();
   let mid=0;
   scene.traverse(m=>{ if(!m.isMesh||m.material===hull) return; const g=m.geometry,P=g.attributes.position; if(!P||g.index||!g.attributes.color) return;
     mid++; m.updateMatrixWorld(true); const M=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld); const C=g.attributes.color; const n=P.count/3;
     const path=[]; let q=m; while(q&&q!==dio){path.unshift(q.name||q.type);q=q.parent;}
     for(let i=0;i<n;i++){ for(let k=0;k<3;k++) v[k].fromBufferAttribute(P,i*3+k).applyMatrix4(M);
       e1.subVectors(v[1],v[0]);e2.subVectors(v[2],v[0]);nn.crossVectors(e1,e2);const l=nn.length();if(l<1e-9)continue;nn.divideScalar(l);
       if(nn.y<-0.5)continue; const d=nn.dot(v[0]);
       T.push({n:[nn.x,nn.y,nn.z],d,v:[v[0].toArray(),v[1].toArray(),v[2].toArray()],c:[C.getX(i*3),C.getY(i*3),C.getZ(i*3)],mid,area:l/2,tag:path.slice(0,3).join('/')});}
   });
   // agrupar por plano
   const map=new Map(); T.forEach((t,i)=>{ const k=t.n.map(x=>Math.round(x*50)).join(',')+'|'+Math.round(t.d*100); let a=map.get(k); if(!a){a=[];map.set(k,a);} a.push(i); });
   const res=[]; 
   function proj(t,ax,ay){ return t.v.map(p=>[p[ax],p[ay]]); }
   function sat(A,B){ for(const P of [A,B]){ for(let i=0;i<3;i++){ const p=P[i],q=P[(i+1)%3]; const ax=-(q[1]-p[1]),az=q[0]-p[0]; const l=Math.hypot(ax,az)||1; let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
     A.forEach(r=>{const d=(r[0]*ax+r[1]*az)/l;a0=Math.min(a0,d);a1=Math.max(a1,d);}); B.forEach(r=>{const d=(r[0]*ax+r[1]*az)/l;b0=Math.min(b0,d);b1=Math.max(b1,d);}); if(a1<=b0+3e-3||b1<=a0+3e-3) return false; } } return true; }
   map.forEach(list=>{ if(list.length<2) return; const t0=T[list[0]]; const ax=Math.abs(t0.n[0])>=Math.abs(t0.n[1])&&Math.abs(t0.n[0])>=Math.abs(t0.n[2])?[1,2]:Math.abs(t0.n[1])>=Math.abs(t0.n[2])?[0,2]:[0,1];
     const items=list.map(i=>{const t=T[i];const pr=proj(t,ax[0],ax[1]);return {t,pr,b:[Math.min(...pr.map(p=>p[0])),Math.min(...pr.map(p=>p[1])),Math.max(...pr.map(p=>p[0])),Math.max(...pr.map(p=>p[1]))]};});
     for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){ const a=items[i],b=items[j]; if(a.t.mid===b.t.mid&&false)continue;
       if(a.b[0]>=b.b[2]||b.b[0]>=a.b[2]||a.b[1]>=b.b[3]||b.b[1]>=a.b[3])continue;
       const dc=Math.abs(a.t.c[0]-b.t.c[0])+Math.abs(a.t.c[1]-b.t.c[1])+Math.abs(a.t.c[2]-b.t.c[2]); if(dc<0.02)continue;
       if(!sat(a.pr,b.pr))continue;
       const c=a.t.v[0]; res.push({x:+c[0].toFixed(1),y:+c[1].toFixed(2),z:+c[2].toFixed(1),n:a.t.n.map(x=>+x.toFixed(1)).join(','),tag:a.t.tag}); } });
   const cl=new Map(); res.forEach(r=>{const k=r.tag+'|n'+r.n+'|'+Math.round(r.x/3)*3+','+Math.round(r.y)+','+Math.round(r.z/3)*3; const o=cl.get(k)||{n:0,ex:r}; o.n++; cl.set(k,o);});
   const arr=[...cl.entries()].map(([k,o])=>[k,o.n,o.ex]).sort((a,b)=>b[1]-a[1]);
   const casa=res.filter(r=>r.x>-12&&r.x<28&&r.z>-73&&r.z<-38&&r.y<-1); const ck=new Map(); casa.forEach(r=>{const k='n'+r.n+' y'+r.y.toFixed(1)+' x'+Math.round(r.x)+' z'+Math.round(r.z); ck.set(k,(ck.get(k)||0)+1);}); const hi=res.filter(r=>Math.abs(r.y-8.6)<0.05).slice(0,6); const casaL=[...ck.entries()].sort((a,b)=>b[1]-a[1]).slice(0,60).map(a=>a[0]+' n='+a[1]);
   return {hi,casa:casaL,casaN:casa.length,tris:T.length,pairs:res.length,top:arr.slice(0,45).map(a=>a[0]+' n='+a[1]+' ex='+JSON.stringify(a[2]))};
  });
  
  await browser.close();
  const summary = { pairs: out.pairs, tris: out.tris, bunkerPairs: out.casaN, top: out.top.slice(0, 10) };
  console.log('COPLANAR', JSON.stringify({ pairs: summary.pairs, tris: summary.tris, bunkerPairs: summary.bunkerPairs }));
  if (process.argv.includes('--update')) { fs.writeFileSync(BASE, JSON.stringify(summary, null, 2)); console.log('baseline gravada'); return; }
  if (!fs.existsSync(BASE)) { console.log('sem baseline'); process.exit(1); }
  const b = JSON.parse(fs.readFileSync(BASE, 'utf8'));
  const bad = [];
  if (errors.length) bad.push('erros de pagina');
  if (summary.pairs > b.pairs) bad.push('pares ' + b.pairs + ' -> ' + summary.pairs);
  if (summary.bunkerPairs > b.bunkerPairs) bad.push('bunker ' + b.bunkerPairs + ' -> ' + summary.bunkerPairs);
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK   sem novos conflitos coplanares');
  process.exit(bad.length ? 1 : 0);
})();
