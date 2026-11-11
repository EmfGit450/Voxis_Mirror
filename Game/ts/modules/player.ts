import type { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";

import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class Player {
  bjsCamera: FreeCamera;

  pitch: number = 0;
  yaw: number = 0;

  sensitivity: number = 0.001;

  walkSpeed: number = 4.137;
  gravity: number = 0.07;
  floor: number = 0;

  position: Vector3 = Vector3.Zero();
  velocity: Vector3 = Vector3.Zero();

  keys: Record<string, boolean> = {
    "KeyW": false,
    "KeyA": false,
    "KeyS": false,
    "KeyD": false,
    "Space": false
  }

  constructor(canvas: HTMLCanvasElement, scene: Scene, engine: Engine) {
    this.bjsCamera = new FreeCamera("camera", new Vector3(0, 0, -10), scene);
    this.bjsCamera.minZ = 0.1;
    this.bjsCamera.inputs.clear();
    scene.activeCamera = this.bjsCamera;

    //Looking Start
    canvas.addEventListener("click", () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== canvas) return;

      this.yaw += e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-1.5607963267948965, Math.min(1.5607963267948965, this.pitch));

      this.applyHeading();
    });
    //Looking End

    //Movement Start
    document.addEventListener("keydown", (e: KeyboardEvent) => { this.keys[e.code] = true; });
    document.addEventListener("keyup", (e: KeyboardEvent) => { this.keys[e.code] = false; });
    window.addEventListener("blur", () => { for (const k in this.keys) this.keys[k] = false; });

    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;

      const forward = new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      const right = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      const move = Vector3.Zero();
      if (this.keys["KeyW"]) move.addInPlace(forward);
      if (this.keys["KeyS"]) move.subtractInPlace(forward);
      if (this.keys["KeyD"]) move.addInPlace(right);
      if (this.keys["KeyA"]) move.subtractInPlace(right);

      if (move.lengthSquared() > 0) {
        move.normalize().scaleInPlace(this.walkSpeed * dt);
        this.bjsCamera.position.addInPlace(move);
      }
    });



    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;

      if (this.keys["Space"] && this.position.y == this.floor) {
        this.velocity.y = 1;
      }

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.position.z += this.velocity.z;

      this.bjsCamera.position = this.position;

      this.velocity.y -= this.gravity;
      if (this.position.y < 0) {
        this.velocity.y = 0;
        this.position.y = 0;
      }
    });
    //Movement End
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