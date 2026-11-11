/* Bunker: monta cada cômodo dentro do seu retângulo de ROOMS e, no fim, fecha os lotes de geometria. */
import * as THREE from 'three';
import { toonMat } from '../../core/materials.js';
import { roomRect } from '../../data/rooms.js';
import { under, surface } from '../scene.js';
import { ledGroups } from '../animation.js';
import {
  bunkerWallBatch,
  bunkerBatch,
  glowBatch,
  neonBatch,
  netBatch,
  hatchBatch,
  ledBatchA,
  ledBatchB,
  ledBatchC,
} from './shell.js';
import { buildMasterSuite } from './rooms/master-suite.js';
import { buildParentsSuite } from './rooms/parents-suite.js';
import { buildSisterRoom } from './rooms/sister-room.js';
import { buildNieceRoom } from './rooms/niece-room.js';
import { buildGuestRoom } from './rooms/guest-room.js';
import { buildDatacenter } from './rooms/datacenter.js';
import { buildLaboratories } from './rooms/laboratories.js';
import { buildCleanRoom } from './rooms/clean-room.js';
import { buildLifeSupport } from './rooms/life-support.js';
import { buildLivingRoom } from './rooms/living-room.js';
import { buildPantry } from './rooms/pantry.js';
import { buildCinema } from './rooms/cinema.js';
import { buildHydroponics } from './rooms/hydroponics.js';
import { buildWorkshop } from './rooms/workshop.js';

/* a ordem importa: lotes e sorteios seguem a ordem de construção */
const ROOM_BUILDERS = [
  ['Suíte cyberpunk do Mestre', buildMasterSuite],
  ['Suíte dos pais', buildParentsSuite],
  ['Quarto da irmã', buildSisterRoom],
  ['Quarto da sobrinha', buildNieceRoom],
  ['Quarto do convidado', buildGuestRoom],
  ['Datacenter', buildDatacenter],
  ['Laboratórios', buildLaboratories],
  ['Sala limpa', buildCleanRoom],
  ['Suporte de vida e baterias', buildLifeSupport],
  ['Estar, jantar e cozinha', buildLivingRoom],
  ['Despensa 90 dias', buildPantry],
  ['Cinema e jogos', buildCinema],
  ['Hidroponia', buildHydroponics],
  ['Oficina maker', buildWorkshop],
];

export function buildBunker() {
  ROOM_BUILDERS.forEach(([name, build]) => build(roomRect(name)));
  bunkerWallBatch.build(under);
  bunkerBatch.build(under);
  glowBatch.build(under, { unlit: true, outline: false });
  neonBatch.build(under, { unlit: true, outline: false });
  const netMat = toonMat.clone();
  netMat.transparent = true;
  netMat.opacity = 0.3;
  netMat.depthWrite = false;
  netMat.side = THREE.DoubleSide;
  netBatch.build(under, { mat: netMat, outline: false });
  hatchBatch.build(surface);
  [ledBatchA, ledBatchB, ledBatchC].forEach(function (L) {
    ledGroups.push(L.build(under, { unlit: true, outline: false }));
  });
}
