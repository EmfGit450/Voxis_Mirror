import {
  type Vector3,
  dot
} from "./math";
import { World } from "./world";

export class Camera {
  world: World;

  verticalFov: number = 60 * Math.PI / 180;
  viewportAspectRatio: number = 1;
  
  near: number = 0.1;
  far: number = 1000;

  right: Vector3 = { x: 1, y: 0, z: 0 };
  up: Vector3 = { x: 0, y: 1, z: 0 };
  forward: Vector3 = { x: 0, y: 0, z: -1 };

  position: Vector3 = { x: 0, y: 0, z: 0 };

  projectionMatrix: Float32Array<ArrayBuffer>;
  cameraMatrix: Float32Array<ArrayBuffer>;

  constructor(world: World, worldPos: Vector3 = { x: 0, y: 0, z: 0 }) {
    this.world = world;

    this.viewportAspectRatio = world.renderer.canvas.width / world.renderer.canvas.height;

    this.position = worldPos;

    //projection matrix
    this.projectionMatrix = new Float32Array(16);

    const tanThetaBy2 = Math.tan(this.verticalFov / 2);
    this.projectionMatrix[0] = 1 / (this.viewportAspectRatio * tanThetaBy2);
    this.projectionMatrix[5] = 1 / tanThetaBy2;

    const nearMinFar = this.near - this.far;
    this.projectionMatrix[10] = this.far / nearMinFar;
    this.projectionMatrix[14] = (this.far * this.near) / nearMinFar;

    this.projectionMatrix[11] = -1;

    this.cameraMatrix = new Float32Array(16);
    
    //right vector
    this.cameraMatrix[0] = 1;
    this.cameraMatrix[1] = 0;
    this.cameraMatrix[2] = 0;

    //up vector
    this.cameraMatrix[4] = 0;
    this.cameraMatrix[5] = 1;
    this.cameraMatrix[6] = 0;

    //forward vector
    this.cameraMatrix[8] = 0;
    this.cameraMatrix[9] = 0;
    this.cameraMatrix[10] = 1;

    //No translation now since camera starts at 0, 0, 0

    this.cameraMatrix[15] = 1;
  }

  updateProjectionMatrix() {
    const tanThetaBy2 = Math.tan(this.verticalFov / 2);
    this.projectionMatrix[0] = 1 / (this.viewportAspectRatio * tanThetaBy2);
    this.projectionMatrix[5] = 1 / tanThetaBy2;
  }

  updateCameraMatrix() {
    this.cameraMatrix[0] = this.right.x;
    this.cameraMatrix[4] = this.right.y;
    this.cameraMatrix[8] = this.right.z;

    this.cameraMatrix[1] = this.up.x;
    this.cameraMatrix[5] = this.up.y;
    this.cameraMatrix[9] = this.up.z;

    this.cameraMatrix[2] = -this.forward.x;
    this.cameraMatrix[6] = -this.forward.y;
    this.cameraMatrix[10] = -this.forward.z;

    this.cameraMatrix[12] = -dot(this.right, this.position);
    this.cameraMatrix[13] = -dot(this.up, this.position);
    this.cameraMatrix[14] = dot(this.forward, this.position);

    this.world.renderer.updateCameraMatrixBuffer();
  }
}