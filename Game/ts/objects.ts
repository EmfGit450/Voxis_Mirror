import { type Vector3 } from "./math";

export class MeshData {
  vertexCount: number;
  vertices: Float32Array;

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