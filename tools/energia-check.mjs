// Conferência e balanço dos recursos de energia do sítio (E1 + E2).
import fs from 'node:fs';
import { conferirCargas, conferirRecursos, resumir, potencialRecursos } from './energia-lib.mjs';

const ler = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const cargas = ler('plan/energia-cargas.json');
const recursos = ler('plan/energia-recursos.json');
const site = ler('plan/site.json');

const erros = [...conferirCargas(cargas), ...conferirRecursos(recursos, site, cargas)];
if (erros.length) {
  erros.forEach((e) => console.error('ERRO:', e));
  process.exit(1);
}

const dem = resumir(cargas);
const pot = potencialRecursos(recursos, site);

console.log(
  `demanda E1: elétrico ${dem.eletrico.kwhDia} kWh/dia (pico ${dem.eletrico.picoKW} kW, 3d ${Math.round(dem.eletrico.kwhDia * 3)} kWh) | térmico ${dem.termico.kwhDia} kWh/dia`,
);
console.log(
  `solar FV (${recursos.solar.plano_inclinado_graus}°N, jun ${recursos.solar.irradiacao_pior_mes_kWh_m2_dia} / méd ${recursos.solar.irradiacao_media_kWh_m2_dia} kWh/m²/dia): ${pot.solar.kwhPorKWpPior} kWh/kWp (jun) -> precisa ${pot.solar.kWpPiorMes} kWp (~${pot.solar.areaFvPiorMesM2} m²); telhados úteis ${pot.solar.areaTelhadosUteisM2} m² (+${pot.solar.areaGalpaoM2} m² galpão c/ laje-jardim), déficit ${pot.solar.deficitAreaTelhadoM2} m²`,
);
console.log(`solar térmico (jun): ~${pot.solar.areaColetorPiorMesM2} m² de coletores`);
console.log(
  `vento: 10 m = ${pot.vento.v10} m/s (${pot.vento.densidadeWm2_10m} W/m², ${pot.vento.classe}) | 50 m = ${pot.vento.v50} m/s (${pot.vento.densidadeWm2_50m} W/m²)`,
);
console.log(
  `córrego: ${pot.corrego.pendente ? `PENDENTE medição (Q×H p/ 1 kW = ${pot.corrego.qVezesHPara1kW} L/s·m; micro-hídrica = 0 kW)` : `${pot.corrego.potenciaKW} kW (${pot.corrego.kwhDia} kWh/dia)`}`,
);
console.log(
  `biogás (rebanho ref. BOM): ${pot.biogas.m3DiaTotal} m³/dia (${pot.biogas.m3DiaSuinos} suínos + ${pot.biogas.m3DiaCaprinos} caprinos) -> ${pot.biogas.kwhTermDia} kWh térm/dia ou ${pot.biogas.kwhEletrDia} kWh elét/dia`,
);
console.log(
  `biomassa sustentável (lote): ${pot.biomassa.totalKwhTermDiaUtil} kWh térm/dia (${pot.biomassa.coberturaTermicaPct}% da demanda térmica: eucalipto ${pot.biomassa.eucalipto.kwhTermDiaUtil} + bambu ${pot.biomassa.bambu.kwhTermDiaUtil})`,
);
console.log(
  `solo (−10 m): ${pot.solo.temperaturaC} °C (delta p/ 22 °C: ${pot.solo.deltaPara22C} °C; medido em campo: ${pot.solo.medidoInLoco ? 'sim' : 'não'})`,
);
console.log('energia: OK');
