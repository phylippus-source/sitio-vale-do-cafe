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
