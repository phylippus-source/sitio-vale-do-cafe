/* Cotas verticais (1 unidade = 1 metro). Origens e limites do terreno ficam abaixo. */

export const FLOOR = -8.9;

export const BFL = FLOOR + 0.2;

export const BWH = 3.6;

export const GF = 1.0;

export const GHT = 3.8;

export const UF = 5.0;

export const UHT = 3.6;

/* Gleba de 100 × 150 m (1,5 ha), centrada na origem; x+ = oeste, z+ = norte. */
export const LOT = { x1: -50, x2: 50, z1: -75, z2: 75 };

/* Córrego que corta a gleba a leste. */
export const STREAM = { x1: 43, x2: 48 };

/* Bunker (cota externa) e interior útil (descontadas as paredes de 0,6 m). */
export const BUNKER = { x1: -12, x2: 28, z1: -73, z2: -38, wall: 0.6 };
export const BUNKER_INNER = {
  x1: -11.4,
  x2: 27.4,
  z1: -72.4,
  z2: -38.6,
  corridorZ1: -55.8,
  corridorZ2: -53.2,
};

/* Origem das construções de superfície. */
export const CASA_ORIGIN = { x: 1, y: 0, z: -58 };
export const BARN_ORIGIN = { x: 32, y: 0, z: -38 };
