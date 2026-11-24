/* Cargas de energia do sítio (etapa E1). Funções puras: somam kWh por dia e pico, por tipo e por local. */

const arred = (n) => Math.round(n * 100) / 100;

/* kWh do dia de uso de uma carga. */
export const kwhDia = (c) => c.uso_kW * c.horas_dia;

/* Soma de um grupo: kWh/dia no dia de uso, média por dia ao longo do ano (com fracao_ano), pico simultâneo em kW. */
export function somar(cargas) {
  let dia = 0;
  let media = 0;
  let pico = 0;
  for (const c of cargas) {
    dia += kwhDia(c);
    media += kwhDia(c) * c.fracao_ano;
    pico += c.pico_kW * c.simult;
  }
  return { kwhDia: arred(dia), kwhMedio: arred(media), picoKW: arred(pico), cargas: cargas.length };
}

/* Resumo do plano: totais elétricos e térmicos, elétrico por local, e as maiores cargas elétricas. */
export function resumir(plano) {
  const el = plano.cargas.filter((c) => c.tipo === 'eletrica');
  const te = plano.cargas.filter((c) => c.tipo === 'termica');
  const local = (l) => somar(el.filter((c) => c.local === l));
  const maiores = [...el]
    .sort((a, b) => kwhDia(b) - kwhDia(a))
    .slice(0, 5)
    .map((c) => ({ id: c.id, kwhDia: arred(kwhDia(c)) }));
  return {
    eletrico: somar(el),
    termico: somar(te),
    bunker: local('bunker'),
    lote: local('lote'),
    maiores,
  };
}

/* Confere o arquivo de cargas; devolve a lista de erros. */
export function conferirCargas(plano) {
  const erros = [];
  const ids = new Set();
  for (const c of plano.cargas) {
    if (ids.has(c.id)) erros.push(`cargas: id repetido ${c.id}`);
    ids.add(c.id);
    if (!['eletrica', 'termica'].includes(c.tipo)) erros.push(`cargas: ${c.id} com tipo ${c.tipo}`);
    if (!['bunker', 'lote'].includes(c.local)) erros.push(`cargas: ${c.id} com local ${c.local}`);
    if (!(c.uso_kW > 0)) erros.push(`cargas: ${c.id} sem potência de uso`);
    if (!(c.horas_dia > 0 && c.horas_dia <= 24))
      erros.push(`cargas: ${c.id} com horas/dia fora de 0–24`);
    if (!(c.simult > 0 && c.simult <= 1))
      erros.push(`cargas: ${c.id} com simultaneidade fora de 0–1`);
    if (!(c.fracao_ano > 0 && c.fracao_ano <= 1))
      erros.push(`cargas: ${c.id} com fração do ano fora de 0–1`);
    if (c.pico_kW < c.uso_kW - 1e-9)
      erros.push(`cargas: ${c.id} com pico menor que a potência de uso`);
  }
  return erros;
}

/* Confere plan/energia-recursos.json (E2) contra o lote, cargas e limites físicos; devolve lista de erros. */
export function conferirRecursos(rec, site = null, cargas = null) {
  const erros = [];
  if (!rec || typeof rec !== 'object') return ['recursos: objeto inválido'];

  if (site) {
    if (Math.abs((rec.local?.latitude ?? NaN) - site.orientacao.latitude) > 1e-6)
      erros.push(
        `recursos: latitude ${rec.local?.latitude} difere do lote (${site.orientacao.latitude})`,
      );
    if (rec.biomassa?.area_silvicultura_m2 !== site.areas_plano.silvicultura)
      erros.push(
        `recursos: área de silvicultura (${rec.biomassa?.area_silvicultura_m2}) difere do lote (${site.areas_plano.silvicultura})`,
      );
    if (rec.biomassa?.area_bambuzal_m2 !== site.areas_plano.bambuzal)
      erros.push(
        `recursos: área de bambuzal (${rec.biomassa?.area_bambuzal_m2}) difere do lote (${site.areas_plano.bambuzal})`,
      );
  }

  if (cargas) {
    const r = resumir(cargas);
    if (Math.round(rec.demanda_ref?.eletrico_kWh_dia ?? NaN) !== Math.round(r.eletrico.kwhDia))
      erros.push(
        `recursos: demanda elétrica (${rec.demanda_ref?.eletrico_kWh_dia}) difere de energia-cargas (${Math.round(r.eletrico.kwhDia)})`,
      );
    if (Math.round(rec.demanda_ref?.termico_kWh_dia ?? NaN) !== Math.round(r.termico.kwhDia))
      erros.push(
        `recursos: demanda térmica (${rec.demanda_ref?.termico_kWh_dia}) difere de energia-cargas (${Math.round(r.termico.kwhDia)})`,
      );
  }

  const s = rec.solar || {};
  if (!(s.irradiacao_pior_mes_kWh_m2_dia > 0))
    erros.push('recursos: irradiação solar do pior mês deve ser > 0');
  if (!(s.irradiacao_media_kWh_m2_dia >= s.irradiacao_pior_mes_kWh_m2_dia))
    erros.push('recursos: irradiação solar média menor que a do pior mês');

  const v = rec.vento?.velocidade_media_m_s;
  if (v != null && !(v >= 0)) erros.push('recursos: velocidade média do vento deve ser >= 0');

  const cg = rec.corrego || {};
  if (cg.vazao_L_s != null && !(cg.vazao_L_s > 0))
    erros.push('recursos: vazão do córrego deve ser > 0 quando informada');
  if (cg.queda_m != null && !(cg.queda_m > 0))
    erros.push('recursos: queda do córrego deve ser > 0 quando informada');

  const bio = rec.biogas || {};
  const ch4 = bio.teor_metano_pct?.v;
  if (!(ch4 > 0 && ch4 <= 100)) erros.push('recursos: teor de metano deve estar em (0, 100]');
  if (!(bio.poder_calorifico_biogas?.pci_kWh_m3 > 0))
    erros.push('recursos: PCI do biogás deve ser > 0');

  const bm = rec.biomassa || {};
  if (!(bm.eucalipto?.pcs_MJ_kg?.v > 0)) erros.push('recursos: PCS do eucalipto deve ser > 0');
  if (!(bm.eucalipto?.pci_seco_ar_MJ_kg?.v > 0))
    erros.push('recursos: PCI seco ao ar do eucalipto deve ser > 0');
  if (!(bm.bambu?.produtividade_t_seca_ha_ano?.v > 0))
    erros.push('recursos: produtividade do bambu deve ser > 0');
  if (!(bm.bambu?.pci_seco_ar_MJ_kg?.v > 0))
    erros.push('recursos: PCI seco ao ar do bambu deve ser > 0');

  return erros;
}

/* Calcula o potencial energético bruto/útil (E2) dos recursos locais a partir de rec e site. */
export function potencialRecursos(rec, site = null) {
  const demEl = rec.demanda_ref?.eletrico_kWh_dia ?? 0;
  const demTerm = rec.demanda_ref?.termico_kWh_dia ?? 0;

  const sol = rec.solar;
  const pr = sol.pr_padrao ?? 0.78;
  const wpM2 = sol.wp_por_m2 ?? 200;
  const etaTermSol = sol.eficiencia_coletor_termico ?? 0.55;
  const hspPior = sol.irradiacao_pior_mes_kWh_m2_dia;
  const hspMedia = sol.irradiacao_media_kWh_m2_dia;
  const kwhPorKWpPior = arred(hspPior * pr);
  const kwhPorKWpMedia = arred(hspMedia * pr);
  const kWpPiorMes = arred(demEl / (hspPior * pr));
  const kWpMedia = arred(demEl / (hspMedia * pr));
  const areaFvPiorMesM2 = arred((kWpPiorMes * 1000) / wpM2);
  const areas = site?.areas_plano || {};
  const areaTelhadosUteisM2 = arred(
    (areas.casa || 0) + (areas.engenho || 0) + (areas.puxadinho || 0),
  );
  const areaGalpaoM2 = arred(areas.galpao || 0);
  const deficitAreaTelhadoM2 = arred(Math.max(0, areaFvPiorMesM2 - areaTelhadosUteisM2));
  const areaColetorPiorMesM2 = arred(demTerm / (hspPior * etaTermSol));

  const v10 = rec.vento.velocidade_media_10m_m_s ?? rec.vento.velocidade_media_m_s;
  const v50 = rec.vento.velocidade_media_50m_m_s ?? null;
  const densVento = (v) => (v != null ? arred(0.5 * 1.225 * v ** 3) : null);
  const classe = v10 == null ? 'pendente' : v10 < 3.5 ? 'marginal' : v10 < 5.5 ? 'moderado' : 'bom';

  const Q = rec.corrego.vazao_L_s;
  const H = rec.corrego.queda_m;
  const etaHidro = rec.corrego.rendimento_microhidro ?? 0.55;
  const hidroPendente = Q == null || H == null;
  const potenciaKW = hidroPendente ? 0 : arred(9.81 * (Q / 1000) * H * etaHidro);
  const kwhDiaHidro = arred(potenciaKW * 24);
  const qVezesHPara1kW = arred(1000 / (9.81 * etaHidro));

  const reb = rec.biogas.rebanho_ref_bom || { suinos: 0, caprinos_adultos: 0 };
  const pciBio = rec.biogas.poder_calorifico_biogas.pci_kWh_m3;
  const etaTermBio = rec.biogas.rendimento_termico ?? 0.75;
  const etaElBio = rec.biogas.rendimento_eletrico ?? 0.25;
  const m3DiaSuinos = arred((reb.suinos || 0) * 0.14);
  const m3DiaCaprinos = arred((reb.caprinos_adultos || 0) * 1.0 * 0.05);
  const m3DiaTotal = arred(m3DiaSuinos + m3DiaCaprinos);
  const kwhTermDiaBio = arred(m3DiaTotal * pciBio * etaTermBio);
  const kwhEletrDiaBio = arred(m3DiaTotal * pciBio * etaElBio);

  const bm = rec.biomassa;
  const etaBm = bm.rendimento_termico ?? 0.7;
  const areaHaEuc = bm.area_silvicultura_m2 / 10000;
  const m3AnoBruto = areaHaEuc * bm.eucalipto.produtividade_m3_ha_ano.v;
  const m3AnoEuc = arred(m3AnoBruto);
  const massaSecaKgAnoEuc = arred(m3AnoBruto * bm.eucalipto.densidade_basica_g_cm3.v * 1000);
  const kwhTermDiaUtilEuc = arred(
    (massaSecaKgAnoEuc * (bm.eucalipto.pci_seco_ar_MJ_kg.v / 3.6) * etaBm) / 365,
  );
  const areaHaBambu = bm.area_bambuzal_m2 / 10000;
  const massaSecaKgAnoBambu = arred(areaHaBambu * bm.bambu.produtividade_t_seca_ha_ano.v * 1000);
  const kwhTermDiaUtilBambu = arred(
    (massaSecaKgAnoBambu * (bm.bambu.pci_seco_ar_MJ_kg.v / 3.6) * etaBm) / 365,
  );
  const totalKwhTermDiaUtil = arred(kwhTermDiaUtilEuc + kwhTermDiaUtilBambu);
  const coberturaTermicaPct = demTerm > 0 ? arred((totalKwhTermDiaUtil / demTerm) * 100) : 0;

  const temperaturaC = rec.calor_do_solo.temperatura_c ?? null;

  return {
    solar: {
      kwhPorKWpPior,
      kwhPorKWpMedia,
      kWpPiorMes,
      kWpMedia,
      areaFvPiorMesM2,
      areaTelhadosUteisM2,
      areaGalpaoM2,
      deficitAreaTelhadoM2,
      areaColetorPiorMesM2,
    },
    vento: {
      v10,
      v50,
      densidadeWm2_10m: densVento(v10),
      densidadeWm2_50m: densVento(v50),
      classe,
    },
    corrego: {
      pendente: hidroPendente,
      potenciaKW,
      kwhDia: kwhDiaHidro,
      qVezesHPara1kW,
    },
    biogas: {
      m3DiaSuinos,
      m3DiaCaprinos,
      m3DiaTotal,
      kwhTermDia: kwhTermDiaBio,
      kwhEletrDia: kwhEletrDiaBio,
    },
    biomassa: {
      eucalipto: {
        m3Ano: m3AnoEuc,
        massaSecaKgAno: massaSecaKgAnoEuc,
        kwhTermDiaUtil: kwhTermDiaUtilEuc,
      },
      bambu: { massaSecaKgAno: massaSecaKgAnoBambu, kwhTermDiaUtil: kwhTermDiaUtilBambu },
      totalKwhTermDiaUtil,
      coberturaTermicaPct,
    },
    solo: {
      temperaturaC,
      deltaPara22C: temperaturaC != null ? arred(temperaturaC - 22) : null,
      medidoInLoco: Boolean(rec.calor_do_solo.medido_in_loco),
    },
  };
}
