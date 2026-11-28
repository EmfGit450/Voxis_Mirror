import { App } from "./declarations";
import {
  type Vector3,
  translationMatrix,
  scalingMatrix,
  pitchMatrix,
  yawMatrix,
  rollMatrix,
  matmul4x4
} from "./math";
import { World } from "./world";

export class MeshData {
  name: string;

  vertexCount: number;
  // leave the first value of each vertex arbitrary, that is set up by the renderer
  vertices: Float32Array;

  worldMatrix: Float32Array<ArrayBuffer>;

  translation: Vector3 = { x: 0, y: 0, z: 0 };
  scaling: Vector3 = { x: 1, y: 1, z: 1 };
  rotation: Vector3 = { x: 0, y: 0, z: 0 };

  world: World;

  meshIndex!: number;
  vertexBufferByteOffset!: number;

  /*
    for rotation, x is the roll,
                  y is the yaw,
                  z is the pitch
  */

  constructor(name: string, vertexCount: number, world: World, vertices?: Float32Array) {
    this.name = name;

    this.vertexCount = vertexCount;
    if (vertices && vertices.length != vertexCount * 6) {
      App.Error("vertices in vertex array does not match vertex count");
    }
    this.vertices = vertices ?? new Float32Array(vertexCount * 6); //6 floats per vertex

    this.worldMatrix = new Float32Array(16);
    this.worldMatrix[0] = 1;
    this.worldMatrix[5] = 1;
    this.worldMatrix[10] = 1;
    this.worldMatrix[15] = 1;

    this.world = world;
    world.addMesh(this);
  }

  updateWorldMatrix() {
    const pitchMat = pitchMatrix(this.rotation.z);
    const yawMat = yawMatrix(this.rotation.y);
    const rollMat = rollMatrix(this.rotation.x);

    const rotationMat = matmul4x4(pitchMat, matmul4x4(yawMat, rollMat));

    const scaleMat = scalingMatrix(this.scaling);
    const transMat = translationMatrix(this.translation);

    this.worldMatrix = matmul4x4(transMat, matmul4x4(rotationMat, scaleMat));

    this.world.renderer.updateMeshWorldMatrixBuffer(this.meshIndex, this.worldMatrix);
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
