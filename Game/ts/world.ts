import { type Matrix4, createMatrix4 } from "./math";
import { MeshData, VoxelData } from "./objects"
import { Camera } from "./camera";

export class World {
  meshes: MeshData[] = [];
  //voxelObjects: VoxelData[] = [];

  camera: Camera;

  viewMatrix: Matrix4;

  constructor() {
    this.camera = new Camera({ x: 0, y: 0, z: 0 });

    this.viewMatrix = createMatrix4();
    
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
}