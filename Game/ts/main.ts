import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { VoxelTexType, World } from "./modules/world"
import { Player } from "./modules/player";

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

const world = new World(scene);

for (let x = -5; x < 6; x++) {
  for (let z = -5; z < 6; z++) {
    world.addVoxel(new Vector3(x, Math.floor(Math.random() * 3) + -3, z), VoxelTexType.Grass);
  }
}

const player = new Player(canvas, scene, engine);


window.addEventListener("resize", () => { engine.resize() });
engine.runRenderLoop(() => { scene.render(); });