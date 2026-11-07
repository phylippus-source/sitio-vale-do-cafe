/* Pontos de entrada da 1ª pessoa. */

export const FPSPOT = {
  ground: {
    x: 1,
    z: -50.6,
    yaw: 0,
    lvl: 's',
  } /* logo atrás da porta da Casa Grande, olhando a sala */,
  attic: { x: 1, z: -57, yaw: 0, lvl: 'a' } /* 2º andar: corredor das suítes */,
  under: {
    x: -9.8,
    z: -54.5,
    yaw: -Math.PI / 2,
    lvl: 'u',
  } /* bunker: corredor, olhando para leste */,
  under2: {
    x: -8.2,
    z: -56.6,
    yaw: 0,
    lvl: 'u',
  } /* suíte cyberpunk do Mestre, olhando a cama */,
  gate: { x: -46, z: 28, yaw: -Math.PI / 2, lvl: 's' } /* porteira, olhando a estrada */,
};
