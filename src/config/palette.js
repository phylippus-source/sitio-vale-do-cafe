/* Paleta base do mundo (K) e cores da Casa Grande. Cores compartilhadas por vários objetos ficam em PAL (abaixo). */

export const K = {
  grass: 0x6cc13e,
  grass2: 0x5db234,
  grass3: 0x7dcd4b,
  tuft: 0x4a9b2b,
  soil: 0x7c4f2d,
  soilD: 0x5b3a21,
  dirt: 0xdcb57d,
  water: 0x4cc6f2,
  waterL: 0xa9e8fa,
  pond: 0x2fd2c6,
  sand: 0xedd49b,
  stone: 0xbdb6a8,
  stoneD: 0x8f887b,
  stoneL: 0xd6d0c2,
  rock: 0x9c9c98,
  roof: 0xdb642f,
  roofD: 0xb44b22,
  cal: 0xf8f3e5,
  ocre: 0xe3a63f,
  wood: 0xab723f,
  woodD: 0x6b4527,
  woodL: 0xdaa768,
  conc: 0xcdd2d6,
  concD: 0x9ea5ac,
  steel: 0xa5b0bc,
  steelD: 0x606b77,
  black: 0x25282d,
  yellow: 0xf7b90e,
  orange: 0xff7a14,
  red: 0xdc3b2d,
  blue: 0x3e86d8,
  green: 0x31a05a,
  glass: 0x9bd9f1,
  white: 0xf6f8f9,
  pink: 0xf5a9b9,
  copper: 0xd47f3b,
  ice: 0xeaf3f7,
  navy: 0x1d3566,
};

export const CW = 0xe8bf63;

export const WHT = K.cal;

export const IRON = 0x2a2d31;

export const MARB = 0xf1f0ea;

export const AZB = 0x2f5fa8;

export const AZW = 0xf4f7fb;

export const TERRA = 0xc9724a;

/* Cores usadas por 2 ou mais objetos, agrupadas pelo papel. Cores de uso único ficam junto do objeto. */
export const PAL = {
  wood: {
    floorBoard: 0x7a4a2a,
    oak: 0x8a5a32,
    walnut: 0x7a4f2c,
    ebony: 0x5a3a24,
    darkWalnut: 0x3a2418,
  },
  light: {
    white: 0xffffff,
    warmGlow: 0xffe9a6,
    cream: 0xefe6d2,
    ivory: 0xf4efe2,
    parchment: 0xf2dfae,
    butter: 0xfff3b0,
    wheat: 0xf0e0b0,
    tileGrey: 0xcfd5da,
    linen: 0xe6d3b0,
  },
  dark: {
    deviceBlack: 0x111319,
    slate: 0x2a2d38,
    void: 0x0a0c14,
    navyBlack: 0x1b1e2a,
    charcoal: 0x1a1c20,
    graphite: 0x22262b,
  },
  clay: {
    gold: 0xd4a24a,
    terracotta: 0xb5593b,
    honey: 0xe0b24a,
    ochreDark: 0xc8923a,
    copperBrown: 0xc27a3a,
    sandGold: 0xe2c47c,
    mustard: 0xe9c86a,
  },
  fabric: {
    burgundy: 0x6b2f2a,
    royalBlue: 0x2f6cb8,
    emerald: 0x2f9a58,
    jade: 0x2fa05a,
    brickRed: 0xa83a2a,
    rust: 0xc4503a,
    indigo: 0x2f2a4a,
    wine: 0x6a1f2a,
  },
  glass: {
    paleBlue: 0x8fb9d4,
    windowDeep: 0x2a4a73,
    showerGlass: 0xbfe3f3,
    iceBlue: 0x9fd2f2,
  },
  paint: {
    shutterGreen: 0x2f5a3a,
  },
  animal: {
    pigPink: 0xe98aa0,
    horn: 0x6b645b,
    grey: 0x8a847a,
  },
  water: {
    trough: 0x6bc4e6,
  },
  metal: {
    blueSteel: 0x6c7b88,
  },
  stone: {
    sandstone: 0xd7c08c,
  },
  flora: {
    violet: 0xc07bff,
    purple: 0x8e5fb0,
    cornflower: 0x4a8fc4,
    leafGreen: 0x3fae4a,
    tomatoRed: 0xe0462d,
    pumpkin: 0xff8a1e,
    fernGreen: 0x3f8c26,
    sunflower: 0xffd23a,
    marigold: 0xe8b04a,
    straw: 0xf0d257,
    cropGreenA: 0x3fb04a,
    cropGreenB: 0x2f9a44,
    cropGreenC: 0x57c25c,
    lilac: 0xb583e6,
    coral: 0xd9534f,
    sage: 0x7bb661,
    salmon: 0xd96a5a,
    grass: 0x6aa84f,
    lime: 0x7bd36a,
  },
  neon: {
    amber: 0xffb347,
    cyan: 0x35e0ff,
    yellow: 0xffe14a,
    violet: 0xb066ff,
    blue: 0x2a6cff,
    mint: 0x4dffa8,
    magenta: 0xff5ad2,
  },
};
