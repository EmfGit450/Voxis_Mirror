import { type Vector3, type Matrix4, createMatrix4 } from "./math";

export class Camera {
  verticalFov: number = 60;
  viewportAspectRatio: number = 1;
  
  near: number = 0.1;
  far: number = 1000;

  worldPos: Vector3;

  projectionMatrix: Matrix4;

  constructor(aspectRatio: number, worldPos: Vector3 = { x: 0, y: 0, z: 0}) {
    this.viewportAspectRatio = aspectRatio;

    this.worldPos = worldPos;

    this.projectionMatrix = createMatrix4();

    const tanThetaBy2 = Math.tan(this.verticalFov / 2);
    this.projectionMatrix[0] = 1 / (aspectRatio * tanThetaBy2);
    this.projectionMatrix[5] = 1 / tanThetaBy2;

    const nearMinFar = this.near - this.far;
    this.projectionMatrix[10] = this.far / nearMinFar;
    this.projectionMatrix[14] = (this.far * this.near) / nearMinFar;

    this.projectionMatrix[11] = -1;
  }
}