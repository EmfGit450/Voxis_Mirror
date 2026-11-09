import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { AppendSceneAsync } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF/2.0";

const canvas = document.querySelector("#renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Minecraft eye height is 1.62 blocks
const EYE_HEIGHT = 1.62;

const camera = new FreeCamera("camera", new Vector3(0, EYE_HEIGHT, 0), scene);
camera.minZ = 0.1;      // default is 1, which clips blocks right in front of you
camera.inputs.clear();  // we drive the camera ourselves
scene.activeCamera = camera;

scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

await AppendSceneAsync("assets/grass_block.glb", scene);

/* ------------------------------------------------------------------ */
/*  Look direction                                                     */
/* ------------------------------------------------------------------ */

const MOUSE_SENSITIVITY = 0.002;
const MAX_PITCH = Math.PI / 2 - 0.01;

let yaw = 0;    // rotation around Y, 0 = facing +Z
let pitch = 0;  // up/down, + = looking up

function applyLook() {
  const dir = new Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  );
  camera.setTarget(camera.position.add(dir));
}
applyLook();

/* ------------------------------------------------------------------ */
/*  Pointer lock (hides the cursor, gives us raw mouse movement)       */
/* ------------------------------------------------------------------ */

canvas.addEventListener("click", () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== canvas) return;

  yaw += e.movementX * MOUSE_SENSITIVITY;    // mouse right -> turn right
  pitch -= e.movementY * MOUSE_SENSITIVITY;  // mouse down  -> look down
  pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));

  applyLook();
});

/* ------------------------------------------------------------------ */
/*  WASD movement                                                      */
/* ------------------------------------------------------------------ */

const WALK_SPEED = 4.317; // blocks per second (Minecraft walking speed)

const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });
window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

scene.onBeforeRenderObservable.add(() => {
  const dt = engine.getDeltaTime() / 1000; // seconds since last frame

  // horizontal-only basis, so looking up doesn't make you fly
  const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  const move = Vector3.Zero();
  if (keys["KeyW"]) move.addInPlace(forward);
  if (keys["KeyS"]) move.subtractInPlace(forward);
  if (keys["KeyD"]) move.addInPlace(right);
  if (keys["KeyA"]) move.subtractInPlace(right);

  if (move.lengthSquared() > 0) {
    move.normalize().scaleInPlace(WALK_SPEED * dt);
    camera.position.addInPlace(move);
  }
});

window.addEventListener("resize", () => engine.resize());

engine.runRenderLoop(() => {
  scene.render();
});