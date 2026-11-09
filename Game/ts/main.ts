import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { AppendSceneAsync } from "@babylonjs/core/Loading/sceneLoader"
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF/2.0";

import { Camera } from "./modules/camera";

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new Camera(canvas, scene);

scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

await AppendSceneAsync('assets/grass_block.glb', scene);

window.addEventListener("resize", () => { engine.resize() });

engine.runRenderLoop(() => { scene.render(); });