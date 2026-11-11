/* Cômodos para a 1ª pessoa: [nome, x1, z1, x2, z2, nível] em coordenadas do mundo. */

export const ROOMS = [
  /* [nome, x1, z1, x2, z2, nível] em coordenadas do mundo; o primeiro que contém o ponto vence */
  ['Cozinha de serviço', -12, -68, -6, -59, 's'],
  ['Copa', -12, -59, -6, -56, 's'],
  ['Capela', -12, -56, -6, -48, 's'],
  ['Sala de jantar', -6, -68, 8, -62, 's'],
  ['Sala de visitas', -6, -62, 8, -56, 's'],
  ['Hall e escadaria', -6, -56, 8, -48, 's'],
  ['Despensa de catástrofe', 8, -68, 14, -61, 's'],
  ['Banheiros coletivos', 8, -61, 14, -56, 's'],
  ['Escritório', 8, -56, 14, -48, 's'],
  ['Varanda e escadaria', -12.4, -48, 14.4, -41, 's'],
  ['Suíte A', -12, -55.5, -6.5, -48, 'a'],
  ['Suíte B', -6.5, -55.5, -1, -48, 'a'],
  ['Suíte C', 3, -55.5, 8.5, -48, 'a'],
  ['Suíte D', 8.5, -55.5, 14, -48, 'a'],
  ['Suíte E', -12, -68, -3, -59, 'a'],
  ['Suíte F', 5, -68, 14, -59, 'a'],
  ['Sala íntima', -3, -68, 5, -59, 'a'],
  ['Corredor do sobrado', -12, -59, 14, -55.5, 'a'],
  ['Escada', -0.1, -55.2, 2.1, -48.2, 'a'],
  ['Engenho 1850', 21, -43, 43, -33, 's'],
  ['Pátio técnico', 21, -33, 39, -13, 's'],
  ['Curral', 23, -10, 39, 9, 's'],
  ['Biodigestor', 22.5, 10, 40, 16, 's'],
  ['Estufa', 21.5, 30.6, 33.5, 40.6, 's'],
  ['Núcleo Sisteminha', -44, 31, 5, 62, 's'],
  ['Jazida de argila', -48, 56, -18, 75, 's'],
  ['Quadras de rotação', -36, -44, 8, 11, 's'],
  ['Bambuzal', -44, -72, -16, -46, 's'],
  ['Silvicultura', 17, -74, 43, -46, 's'],
  ['Estrada', -50, 25.5, 43, 30.5, 's'],
  ['Suíte cyberpunk do Mestre', -11.4, -72.4, -4.4, -55.8, 'u'],
  ['Suíte dos pais', -4.4, -72.4, 0.1, -55.8, 'u'],
  ['Quarto da irmã', 0.1, -72.4, 3.9, -55.8, 'u'],
  ['Quarto da sobrinha', 3.9, -72.4, 7.1, -55.8, 'u'],
  ['Quarto do convidado', 7.1, -72.4, 10.1, -55.8, 'u'],
  ['Datacenter', 10.1, -72.4, 16.1, -55.8, 'u'],
  ['Laboratórios', 16.1, -72.4, 20, -55.8, 'u'],
  ['Sala limpa', 20, -72.4, 23, -55.8, 'u'],
  ['Suporte de vida e baterias', 23, -72.4, 27.4, -55.8, 'u'],
  ['Corredor do bunker', -11.4, -55.8, 27.4, -53.2, 'u'],
  ['Estar, jantar e cozinha', -11.4, -53.2, 2.2, -38.6, 'u'],
  ['Despensa 90 dias', 2.2, -53.2, 5.8, -38.6, 'u'],
  ['Cinema e jogos', 5.8, -53.2, 12.4, -38.6, 'u'],
  ['Hidroponia', 12.4, -53.2, 20.4, -38.6, 'u'],
  ['Oficina maker', 20.4, -53.2, 27.4, -38.6, 'u'],
  ['Sobrado', -12.4, -68, 14.4, -47, 'a'],
];

/** Retângulo de um cômodo pelo nome: { x1, z1, x2, z2 } em coordenadas do mundo. */
export function roomRect(name) {
  const r = ROOMS.find((x) => x[0] === name);
  if (!r) throw new Error('cômodo desconhecido: ' + name);
  return { x1: r[1], z1: r[2], x2: r[3], z2: r[4] };
}
