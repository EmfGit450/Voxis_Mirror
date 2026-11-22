import { App } from "./declarations";

import { MeshData } from "./objects"
import { Renderer } from "./webgpu/renderer";
import { Camera } from "./camera";

export class World {
  meshes: MeshData[] = [];
  //voxelObjects: VoxelData[] = [];

  renderer: Renderer;

  camera: Camera;

  constructor(renderer: Renderer) {
    this.renderer = renderer;

    this.camera = new Camera(renderer.canvas.width / renderer.canvas.height, { x: 0, y: 0, z: 0 });

    renderer.world = this;

    renderer.device.queue.writeBuffer(renderer.cameraMatrixBuffer, 0, this.camera.viewMatrix);
    renderer.device.queue.writeBuffer(renderer.projectionMatrixBuffer, 0, this.camera.projectionMatrix);
  }

  addMesh(mesh: MeshData) {
    this.meshes.push(mesh);
    mesh.initializeWorldMatrixBuffer(this.renderer.device);
    this.renderer.writeToVertexBuffer(mesh.vertices as Float32Array<ArrayBuffer>);

    App.Log(`Added mesh '${mesh.name}' to world`);
  }
}