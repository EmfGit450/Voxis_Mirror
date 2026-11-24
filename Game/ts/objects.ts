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
  vertices: Float32Array;
  vertexBuffer!: GPUBuffer;

  worldMatrix: Float32Array<ArrayBuffer>;
  worldMatrixBuffer!: GPUBuffer;

  translation: Vector3 = { x: 0, y: 0, z: 0 };
  scaling: Vector3 = { x: 1, y: 1, z: 1 };
  rotation: Vector3 = { x: 0, y: 0, z: 0 };

  world: World;

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

  destroy(){
    this.vertexBuffer.destroy();
    this.worldMatrixBuffer.destroy();
    this.world.meshes = this.world.meshes.filter(mesh => mesh != this);
  }

  initializeWorldMatrixBuffer(device: GPUDevice) {
    this.worldMatrixBuffer = device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.world.updateMeshWorldMatrixBuffer(this);
  }

  initializeVertexBuffer(device: GPUDevice) {
    this.vertexBuffer = device.createBuffer({
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices as Float32Array<ArrayBuffer>);
  }

  updateVertices(vertices: Float32Array<ArrayBuffer>) {
    if (vertices.length % 6 != 0){
      App.Error("vertices' length is divisible by 6");
    }

    this.vertexCount = vertices.length / 6;
    this.vertices = vertices;

    this.world.reinitVertexBuffer(this);
  }

  updateWorldMatrix() {
    const pitchMat = pitchMatrix(this.rotation.z);
    const yawMat = yawMatrix(this.rotation.y);
    const rollMat = rollMatrix(this.rotation.x);

    const rotationMat = matmul4x4(pitchMat, matmul4x4(yawMat, rollMat));

    const scaleMat = scalingMatrix(this.scaling);
    const transMat = translationMatrix(this.translation);

    this.worldMatrix = matmul4x4(transMat, matmul4x4(rotationMat, scaleMat));

    this.world.updateMeshWorldMatrixBuffer(this);
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