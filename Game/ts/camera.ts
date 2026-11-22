import { type Vector3 } from "./math";

export class Camera {
  verticalFov: number = 60;
  
  near: number = 0.1;
  far: number = 0.1;

  worldPos: Vector3;

  constructor(worldPos: Vector3) {
    this.worldPos = worldPos;
  }
}