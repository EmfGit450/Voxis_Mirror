import type { Scene } from "@babylonjs/core/scene";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class Camera {
  bjsCamera: FreeCamera;

  pitch: number = 0;
  yaw: number = 0;

  sensitivity: number = 0.001;

  keys: {
    "w": boolean,
    "a": boolean,
    "s": boolean,
    "d": boolean
  }

  constructor(canvas: HTMLCanvasElement, scene: Scene) {
    this.bjsCamera = new FreeCamera("camera", new Vector3(-20, 0, 0), scene);
    this.bjsCamera.inputs.clear();
    scene.activeCamera = this.bjsCamera;

    canvas.addEventListener("click", () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== canvas) return;

      this.yaw += e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-1.57079632, Math.min(1.57079632, this.pitch));

      this.applyHeading();
    });

    this.keys = {
      "w": false,
      "a": false,
      "s": false,
      "d": false
    };

    document.addEventListener("keydown", )
  }

  applyHeading() {
    const dir = new Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    )
    this.bjsCamera.setTarget(this.bjsCamera.position.add(dir));
  }
}