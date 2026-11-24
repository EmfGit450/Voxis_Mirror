import { type Vector3 } from "./math";

export class Camera {
  verticalFov: number = 60 * Math.PI / 180;
  viewportAspectRatio: number = 1;
  
  near: number = 0.1;
  far: number = 1000;

  worldPos: Vector3;

  projectionMatrix: Float32Array<ArrayBuffer>;
  viewMatrix: Float32Array<ArrayBuffer>;

  constructor(aspectRatio: number, worldPos: Vector3 = { x: 0, y: 0, z: 0 }) {
    this.viewportAspectRatio = aspectRatio;

    this.worldPos = worldPos;

    //projection matrix
    this.projectionMatrix = new Float32Array(16);

    const tanThetaBy2 = Math.tan(this.verticalFov / 2);
    this.projectionMatrix[0] = 1 / (aspectRatio * tanThetaBy2);
    this.projectionMatrix[5] = 1 / tanThetaBy2;

    const nearMinFar = this.near - this.far;
    this.projectionMatrix[10] = this.far / nearMinFar;
    this.projectionMatrix[14] = (this.far * this.near) / nearMinFar;

    this.projectionMatrix[11] = -1;

    this.viewMatrix = new Float32Array(16);
    
    //right vector
    this.viewMatrix[0] = 1;
    this.viewMatrix[1] = 0;
    this.viewMatrix[2] = 0;

    //up vector
    this.viewMatrix[4] = 0;
    this.viewMatrix[5] = 1;
    this.viewMatrix[6] = 0;

    //forward vector
    this.viewMatrix[8] = 0;
    this.viewMatrix[9] = 0;
    this.viewMatrix[10] = 1;

    //No translation now since camera starts at 0, 0, 0

    this.viewMatrix[15] = 1;
  }

  updateProjectionMatrix() {
    const tanThetaBy2 = Math.tan(this.verticalFov / 2);
    this.projectionMatrix[0] = 1 / (this.viewportAspectRatio * tanThetaBy2);
    this.projectionMatrix[5] = 1 / tanThetaBy2;
  }
}