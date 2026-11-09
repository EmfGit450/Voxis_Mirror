import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { AppendSceneAsync } from "@babylonjs/core/Loading/sceneLoader"
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF/2.0";

import { Player } from "./modules/player";

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new Player(canvas, scene, engine);

scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

await AppendSceneAsync('assets/grass_block.glb', scene);
scene.meshes[1].setParent(null);
scene.meshes[0].dispose();

console.log(scene.meshes[0].position.y -= 6)

window.addEventListener("resize", () => { engine.resize() });

engine.runRenderLoop(() => { scene.render(); });