import { describe, it, expect } from 'vitest';
import { FPSPOT } from '../../src/data/fpspots.js';
import { ROOMS } from '../../src/data/rooms.js';
import { BLOCK, BCIRC } from '../../src/data/collision.js';
import { TANKS } from '../../src/data/sisteminha.js';
import { PLOTS } from '../../src/data/crops.js';
import { STRATA, TG } from '../../src/data/terrain.js';
import { BOM } from '../../src/data/bom.js';
import { LABELS } from '../../src/data/labels.js';
import { SECTORS } from '../../src/data/sectors.js';
import { AURA } from '../../src/data/aura.js';
import { LOT } from '../../src/config/dimensions.js';

const isColor = (v) => Number.isInteger(v) && v >= 0 && v <= 0xffffff;
const room = (name) => ROOMS.find((r) => r[0] === name);
const roomAt = (x, z, lvl) =>
  ROOMS.find((r) => r[5] === lvl && x >= r[1] && x < r[3] && z >= r[2] && z < r[4]);
const inRect = (p, r) => p.x >= r[1] && p.x <= r[3] && p.z >= r[2] && p.z <= r[4];
const insideLot = (x, z) => x >= LOT.x1 && x <= LOT.x2 && z >= LOT.z1 && z <= LOT.z2;

describe('data: 1ª pessoa, colisão e terreno', () => {
  it('cada ponto de entrada da 1ª pessoa cai num cômodo do seu próprio nível', () => {
    Object.entries(FPSPOT).forEach(([name, s]) => {
      expect(roomAt(s.x, s.z, s.lvl), name).toBeDefined();
    });
  });

  it('os cinco pontos conhecidos existem', () => {
    expect(Object.keys(FPSPOT).sort()).toEqual(['attic', 'gate', 'ground', 'under', 'under2']);
  });

  it('os retângulos de colisão são válidos e ficam dentro da gleba', () => {
    BLOCK.forEach(([x1, z1, x2, z2], i) => {
      expect(x1 < x2 && z1 < z2, 'bloco ' + i).toBe(true);
      expect(insideLot(x1, z1) && insideLot(x2, z2), 'bloco ' + i).toBe(true);
    });
  });

  it('os círculos de colisão têm raio positivo', () => {
    BCIRC.forEach(([, , r]) => expect(r).toBeGreaterThan(0));
  });

  it('os tanques do Sisteminha ficam dentro do núcleo', () => {
    const core = room('Núcleo Sisteminha');
    expect(TANKS).toHaveLength(2);
    TANKS.forEach((t) => expect(inRect(t, core)).toBe(true));
  });

  it('as 4 quadras ficam dentro da área de rotação e não se sobrepõem', () => {
    const area = room('Quadras de rotação');
    expect(PLOTS).toHaveLength(4);
    PLOTS.forEach((p) => {
      expect(p.x1 >= area[1] && p.x2 <= area[3] && p.z1 >= area[2] && p.z2 <= area[4]).toBe(true);
    });
    for (let i = 0; i < PLOTS.length; i++) {
      for (let j = i + 1; j < PLOTS.length; j++) {
        const [a, b] = [PLOTS[i], PLOTS[j]];
        const dx = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
        const dz = Math.min(a.z2, b.z2) - Math.max(a.z1, b.z1);
        expect(dx > 0 && dz > 0, a.n + ' × ' + b.n).toBe(false);
      }
    }
  });

  it('as camadas do solo são contíguas, de baixo para cima, com cores válidas', () => {
    STRATA.forEach(([y0, y1, hex], i) => {
      expect(y0).toBeLessThan(y1);
      expect(isColor(hex)).toBe(true);
      if (i > 0) expect(y0).toBe(STRATA[i - 1][1]);
    });
  });

  it('as paletas de canteiro têm 3 tons válidos cada', () => {
    expect(TG).toHaveLength(3);
    TG.forEach((tones) => {
      expect(tones).toHaveLength(3);
      tones.forEach((hex) => expect(isColor(hex)).toBe(true));
    });
  });
});

describe('data: textos e rótulos', () => {
  it('o memorial (BOM) tem capítulos numerados em sequência, de 01 a 25', () => {
    expect(BOM).toHaveLength(25);
    BOM.forEach((c, i) => {
      expect(c.t.startsWith(String(i + 1).padStart(2, '0') + ' · '), c.t).toBe(true);
    });
  });

  it('cada capítulo tem etiqueta e itens [título, texto] preenchidos', () => {
    BOM.forEach((c) => {
      expect(c.tag, c.t).toBeTruthy();
      expect(c.items.length, c.t).toBeGreaterThan(0);
      c.items.forEach(([title, text]) => {
        expect(typeof title === 'string' && title.length > 0, c.t).toBe(true);
        expect(typeof text === 'string' && text.length > 0, c.t).toBe(true);
      });
    });
  });

  it('nenhum texto do memorial, dos setores ou dos rótulos traz undefined ou NaN', () => {
    const all = JSON.stringify([BOM, SECTORS, LABELS, AURA]);
    expect(all).not.toMatch(/undefined|NaN/);
  });

  it('não há rótulos repetidos na mesma camada', () => {
    const keys = LABELS.map((l) => l.L + '|' + l.t);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('todo rótulo fica dentro da gleba e acima do fundo do solo', () => {
    LABELS.forEach((l) => {
      expect(insideLot(l.p[0], l.p[2]), l.t).toBe(true);
      expect(l.p[1], l.t).toBeGreaterThan(-12);
    });
  });

  it('o primeiro setor é a visão geral e o corte vai de 0 a 100', () => {
    expect(SECTORS[0].k).toBe('overview');
    SECTORS.forEach((s) => {
      const lift = s.lift ?? 0;
      expect(lift >= 0 && lift <= 100, s.k).toBe(true);
    });
  });

  it('os quatro perfis de telemetria têm texto', () => {
    expect(Object.keys(AURA).sort()).toEqual(['energy', 'family', 'opsec', 'staff']);
    Object.values(AURA).forEach((t) => expect(t.length).toBeGreaterThan(20));
  });
});
