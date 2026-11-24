import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import {
  kwhDia,
  somar,
  resumir,
  conferirCargas,
  conferirRecursos,
  potencialRecursos,
} from '../../tools/energia-lib.mjs';

const c = (o) => ({
  id: 'x',
  tipo: 'eletrica',
  local: 'bunker',
  uso_kW: 2,
  horas_dia: 3,
  pico_kW: 4,
  simult: 0.5,
  fracao_ano: 1,
  ...o,
});

describe('cargas de energia', () => {
  it('kWh do dia = potência × horas', () => {
    expect(kwhDia(c({}))).toBe(6);
  });

  it('soma: dia de uso, média anual com fração do ano e pico com simultaneidade', () => {
    const s = somar([
      c({}),
      c({ id: 'y', uso_kW: 10, horas_dia: 1, pico_kW: 12, simult: 1, fracao_ano: 0.5 }),
    ]);
    expect(s.kwhDia).toBe(16);
    expect(s.kwhMedio).toBe(11); // 6 + 10 × 0,5
    expect(s.picoKW).toBe(14); // 4 × 0,5 + 12 × 1
    expect(s.cargas).toBe(2);
  });

  it('resumo separa elétrico de térmico e bunker de lote', () => {
    const r = resumir({
      cargas: [
        c({ id: 'a' }),
        c({ id: 'b', local: 'lote', uso_kW: 1, horas_dia: 1, pico_kW: 1 }),
        c({ id: 't', tipo: 'termica', uso_kW: 5, horas_dia: 2 }),
      ],
    });
    expect(r.eletrico.kwhDia).toBe(7);
    expect(r.termico.kwhDia).toBe(10);
    expect(r.bunker.kwhDia).toBe(6);
    expect(r.lote.kwhDia).toBe(1);
    expect(r.maiores[0]).toEqual({ id: 'a', kwhDia: 6 });
  });

  it('confere: pico menor que o uso, tipo e horas inválidos, id repetido', () => {
    expect(conferirCargas({ cargas: [c({})] })).toEqual([]);
    const e = conferirCargas({
      cargas: [c({ pico_kW: 1 }), c({ tipo: 'gas', horas_dia: 25, simult: 0 })],
    });
    expect(e.some((m) => m.includes('pico menor'))).toBe(true);
    expect(e.some((m) => m.includes('tipo gas'))).toBe(true);
    expect(e.some((m) => m.includes('horas/dia'))).toBe(true);
    expect(e.some((m) => m.includes('simultaneidade'))).toBe(true);
    expect(e.some((m) => m.includes('id repetido'))).toBe(true);
  });

  it('o arquivo plan/energia-cargas.json passa na régua e tem a ordem de grandeza esperada', () => {
    const p = JSON.parse(fs.readFileSync('plan/energia-cargas.json', 'utf8'));
    expect(conferirCargas(p)).toEqual([]);
    const r = resumir(p);
    expect(r.eletrico.kwhDia).toBeGreaterThan(300);
    expect(r.eletrico.kwhDia).toBeLessThan(800);
    expect(r.maiores[0].id).toBe('hidroponia-led');
  });
});

describe('recursos de energia (E2)', () => {
  const ler = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

  it('plan/energia-recursos.json passa em conferirRecursos coerente com site e cargas', () => {
    const rec = ler('plan/energia-recursos.json');
    const site = ler('plan/site.json');
    const cargas = ler('plan/energia-cargas.json');
    expect(conferirRecursos(rec, site, cargas)).toEqual([]);
  });

  it('conferirRecursos rejeita área divergente, pior mês > média e PCI inválido', () => {
    const rec = ler('plan/energia-recursos.json');
    const site = ler('plan/site.json');
    const cargas = ler('plan/energia-cargas.json');
    const ruim = structuredClone(rec);
    ruim.biomassa.area_bambuzal_m2 = 999;
    ruim.solar.irradiacao_pior_mes_kWh_m2_dia = 6.0;
    ruim.biogas.poder_calorifico_biogas.pci_kWh_m3 = 0;
    const e = conferirRecursos(ruim, site, cargas);
    expect(e.some((m) => m.includes('bambuzal'))).toBe(true);
    expect(e.some((m) => m.includes('pior mês'))).toBe(true);
    expect(e.some((m) => m.includes('PCI do biogás'))).toBe(true);
  });

  it('potencialRecursos calcula solar, vento, biomassa, biogás e micro-hídrica (null vs medido)', () => {
    const rec = ler('plan/energia-recursos.json');
    const site = ler('plan/site.json');
    const p = potencialRecursos(rec, site);

    expect(p.solar.kWpPiorMes).toBeGreaterThan(100);
    expect(p.solar.areaFvPiorMesM2).toBeGreaterThan(500);
    expect(p.solar.areaTelhadosUteisM2).toBe(965);
    expect(p.solar.areaColetorPiorMesM2).toBeCloseTo(65, 0);
    expect(p.vento.classe).toBe('marginal');
    expect(p.vento.densidadeWm2_10m).toBeCloseTo(4.75, 1);
    expect(p.biogas.m3DiaTotal).toBeCloseTo(1.29, 2);
    expect(p.biomassa.totalKwhTermDiaUtil).toBeGreaterThan(10);
    expect(p.biomassa.coberturaTermicaPct).toBeLessThan(25);
    expect(p.corrego.pendente).toBe(true);
    expect(p.corrego.potenciaKW).toBe(0);
    expect(p.corrego.kwhDia).toBe(0);

    const comRio = structuredClone(rec);
    comRio.corrego.vazao_L_s = 20;
    comRio.corrego.queda_m = 10;
    const pRio = potencialRecursos(comRio, site);
    expect(pRio.corrego.pendente).toBe(false);
    expect(pRio.corrego.potenciaKW).toBeCloseTo(9.81 * 0.02 * 10 * 0.5, 2);
    expect(pRio.corrego.kwhDia).toBeCloseTo(pRio.corrego.potenciaKW * 24, 1);
  });

  it('plan/energia-geracao.json bate com os totais T1+T2+T3 de plan/energia-cargas.json', () => {
    const cargas = ler('plan/energia-cargas.json');
    const ger = ler('plan/energia-geracao.json');
    const porId = new Map(cargas.cargas.map((x) => [x.id, kwhDia(x)]));
    const soma = (ids) => ids.reduce((a, id) => a + porId.get(id), 0);
    const t1 = soma(ger.classes_de_carga.T1_vital.ids);
    const t2 = soma(ger.classes_de_carga.T2_vida_e_producao.ids);
    const t3 = soma(ger.classes_de_carga.T3_conforto_e_renda.ids);
    expect(ger.classes_de_carga.T1_vital.kWh_dia).toBeCloseTo(t1, 2);
    expect(ger.classes_de_carga.T2_vida_e_producao.kWh_dia).toBeCloseTo(t2, 2);
    expect(ger.classes_de_carga.T3_conforto_e_renda.kWh_dia).toBeCloseTo(t3, 2);
    expect(ger.classes_de_carga.total_kWh_dia).toBeCloseTo(resumir(cargas).eletrico.kwhDia, 2);
  });
});

describe('armazenamento de energia (E4)', () => {
  const ler = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
  it('plan/energia-armazenamento.json fecha 3 dias de T1 e térmico sem reabrir a sala 10x10', () => {
    const cargas = ler('plan/energia-cargas.json');
    const ger = ler('plan/energia-geracao.json');
    const arm = ler('plan/energia-armazenamento.json');
    const porId = new Map(cargas.cargas.map((x) => [x.id, kwhDia(x)]));
    const t1Dia = ger.classes_de_carga.T1_vital.ids.reduce((a, id) => a + porId.get(id), 0);

    const el = arm.armazenamento_eletrico;
    expect(el.banco_A_LFP.util_kWh + el.banco_B_OPzS.util_kWh).toBe(el.alvo_util_kWh);
    expect(el.alvo_util_kWh).toBeGreaterThanOrEqual(3 * t1Dia);
    expect(el.banco_A_LFP.nominal_kWh).toBeCloseTo(el.banco_A_LFP.util_kWh / el.banco_A_LFP.dod, 2);
    expect(el.banco_B_OPzS.nominal_kWh).toBeCloseTo(
      el.banco_B_OPzS.util_kWh / el.banco_B_OPzS.dod,
      2,
    );

    expect(el.banco_A_LFP.area_bunker_m2).toBe(0);
    const areaOcupada = el.banco_B_OPzS.area_bunker_m2 + el.reserva_prateleira_seca.area_bunker_m2;
    expect(areaOcupada).toBe(el.veredito_sala_baterias_bunker.area_ocupada_m2);
    expect(areaOcupada).toBeLessThanOrEqual(el.veredito_sala_baterias_bunker.area_planejada_b0_m2);
    expect(el.veredito_sala_baterias_bunker.reabrir_solver_b0).toBe(false);

    const agua = arm.armazenamento_termico.diario_baixa_T_agua;
    expect(agua.volume_adotado_m3 * agua.densidade_kWh_m3_dT50).toBeGreaterThanOrEqual(
      3 * resumir(cargas).termico.kwhDia,
    );
  });
});
