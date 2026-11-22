import { type Vector3 } from "./math";

export class MeshData {
  vertexCount: number;
  vertices: Float32Array;

  worldMatrix: Float32Array<ArrayBuffer>;
  worldMatrixBuffer!: GPUBuffer;

  translation: Vector3 = { x: 0, y: 0, z: 0 };
  scaling: Vector3 = { x: 1, y: 1, z: 1 };
  rotation: Vector3 = { x: 0, y: 0, z: 0 };

  /*
    for rotation, x is the roll,
                  y is the yaw,
                  z is the pitch
  */

  constructor(vertexCount: number) {
    this.vertexCount = vertexCount;
    this.vertices = new Float32Array(vertexCount * 6); //6 floats per vertex

    this.worldMatrix = new Float32Array(16);
    this.worldMatrix[0] = 1;
    this.worldMatrix[5] = 1;
    this.worldMatrix[10] = 1;
    this.worldMatrix[15] = 1;
  }

  initializeWorldMatrixBuffer(device: GPUDevice) {
    this.worldMatrixBuffer = device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(this.worldMatrixBuffer, 0, this.worldMatrix);
  }


}

export class VoxelData {
  width: number;
  height: number;
  depth: number;

  data: Uint16Array; // one uint16 is enough to describe the material

  constructor(w: number, h: number, d: number) {
    this.width = w;
    this.height = h;
    this.depth = d;

    this.data = new Uint16Array(w * h * d);
  }
}