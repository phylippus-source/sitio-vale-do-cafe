/* Validação dos dados e das cotas na carga. Devolve a lista de problemas (vazia = tudo certo). */
import { SECTORS } from './sectors.js';
import { LABELS } from './labels.js';
import { ROOMS } from './rooms.js';
import { PLOTS } from './crops.js';
import { FPSPOT } from './fpspots.js';
import { LOT, BUNKER, BUNKER_INNER } from '../config/dimensions.js';
import { bunkerRoomsTotal, bunkerRoomAreas, AREA_LABELS } from './areas.js';
import { BOM } from './bom.js';

const LEVELS = ['s', 'u', 'a'];
/* Camada do rótulo = grupo da cena que o contém (ver main.js): superfície, subsolo, telhados, casa, engenho, sobrado. */
const LABEL_LAYERS = ['s', 'u', 'c', 'b', 'i', 'e', 'U'];
const EPS = 1e-9;

function checkDimensions(problems) {
  const { x1, x2, z1, z2, wall } = BUNKER;
  const inner = BUNKER_INNER;
  const pairs = [
    ['x1', inner.x1, x1 + wall],
    ['x2', inner.x2, x2 - wall],
    ['z1', inner.z1, z1 + wall],
    ['z2', inner.z2, z2 - wall],
  ];
  pairs.forEach(([n, got, want]) => {
    if (Math.abs(got - want) > EPS)
      problems.push('BUNKER_INNER.' + n + ' = ' + got + ', esperado ' + want);
  });
  if (x1 < LOT.x1 || x2 > LOT.x2 || z1 < LOT.z1 || z2 > LOT.z2)
    problems.push('bunker fora da gleba');
}

function checkSectors(problems) {
  const keys = new Set();
  SECTORS.forEach((s) => {
    if (keys.has(s.k)) problems.push('setor repetido: ' + s.k);
    keys.add(s.k);
    if (!s.n || !s.d) problems.push('setor sem nome/texto: ' + s.k);
    if (!Array.isArray(s.f) || s.f.length !== 3 || s.f.some((v) => !Number.isFinite(v)))
      problems.push('setor ' + s.k + ': foco f inválido');
    if (![s.ry, s.rx, s.z].every(Number.isFinite))
      problems.push('setor ' + s.k + ': câmera inválida');
  });
}

function checkLabels(problems) {
  LABELS.forEach((l) => {
    if (!l.t) problems.push('rótulo sem título');
    if (!Array.isArray(l.p) || l.p.length !== 3 || l.p.some((v) => !Number.isFinite(v)))
      problems.push('rótulo ' + l.t + ': posição inválida');
    if (!LABEL_LAYERS.includes(l.L)) problems.push('rótulo ' + l.t + ': camada inválida ' + l.L);
  });
}

function checkRooms(problems) {
  ROOMS.forEach(([name, x1, z1, x2, z2, lvl]) => {
    if (!(x1 < x2 && z1 < z2)) problems.push('cômodo ' + name + ': área vazia ou invertida');
    if (!LEVELS.includes(lvl)) problems.push('cômodo ' + name + ': nível inválido ' + lvl);
    if (lvl === 'u' && (x1 < BUNKER.x1 || x2 > BUNKER.x2 || z1 < BUNKER.z1 || z2 > BUNKER.z2))
      problems.push('cômodo ' + name + ' fora do bunker');
  });
}

/* Os cômodos do bunker devem ladrilhar o interior útil, sem folga nem sobreposição. */
function checkBunkerTiling(problems) {
  const inner = (BUNKER_INNER.x2 - BUNKER_INNER.x1) * (BUNKER_INNER.z2 - BUNKER_INNER.z1);
  const total = bunkerRoomsTotal();
  if (Math.abs(total - inner) > 0.5)
    problems.push(
      'cômodos do bunker somam ' +
        total.toFixed(1) +
        ' m², interior tem ' +
        inner.toFixed(1) +
        ' m²',
    );
}

/* O memorial do bunker deve citar as áreas que a geometria realmente tem (m², arredondado). */
function checkBunkerAreaText(problems) {
  const chapter = BOM.find((c) => c.t.includes('Quadro de áreas'));
  const text = chapter ? JSON.stringify(chapter.items) : '';
  const areas = bunkerRoomAreas();
  Object.entries(AREA_LABELS).forEach(([room, label]) => {
    const expected = label + ' ' + Math.round(areas[room]);
    if (!text.includes(expected)) problems.push('memorial do bunker: esperado "' + expected + '"');
  });
}

function checkPlots(problems) {
  PLOTS.forEach((p) => {
    const area = (p.x2 - p.x1) * (p.z2 - p.z1);
    if (area !== 500) problems.push('quadra ' + p.n + ': ' + area + ' m² (esperado 500)');
    if (p.x1 < LOT.x1 || p.x2 > LOT.x2 || p.z1 < LOT.z1 || p.z2 > LOT.z2)
      problems.push('quadra ' + p.n + ' fora da gleba');
  });
}

function checkSpots(problems) {
  Object.entries(FPSPOT).forEach(([name, s]) => {
    if (![s.x, s.z, s.yaw].every(Number.isFinite) || !LEVELS.includes(s.lvl))
      problems.push('ponto ' + name + ' inválido');
  });
}

export function validateData() {
  const problems = [];
  checkDimensions(problems);
  checkSectors(problems);
  checkLabels(problems);
  checkRooms(problems);
  checkBunkerTiling(problems);
  checkBunkerAreaText(problems);
  checkPlots(problems);
  checkSpots(problems);
  return problems;
}
