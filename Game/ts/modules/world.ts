import { Scene } from "@babylonjs/core/scene"

import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";

import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";

import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

export enum VoxelTexType {
  Grass = "../assets/grass.png"
}

export class Voxel {
  position: Vector3;
  textype: VoxelTexType;

  constructor(position: Vector3, textype: VoxelTexType) {
    this.position = position;
    this.textype = textype;
  }
}

export class World {
  scene: Scene;

  voxelData: Voxel[];
  voxelFaceUV: Vector4[];
  textures: Map<VoxelTexType, StandardMaterial>;

  constructor(scene: Scene) {
    this.scene = scene;
  
    const sun = new DirectionalLight(
      "sun",
      new Vector3(-1, -2, -1).normalize(),
      this.scene
    );
    sun.intensity = 0.9;

    this.voxelData = [];

// Babylon box face order: +Z, -Z, +X, -X, +Y, -Y.
this.voxelFaceUV = [
  new Vector4(0.375, 0.50, 0.625, 0.75), // +Z — side1
  new Vector4(0.375, 0.00, 0.625, 0.25), // -Z — side3
  new Vector4(0.375, 0.25, 0.625, 0.50), // +X — side2
  new Vector4(0.375, 0.75, 0.625, 1.00), // -X — side(topmost)
  new Vector4(0.125, 0.50, 0.375, 0.75), // +Y — top
  new Vector4(0.625, 0.50, 0.875, 0.75), // -Y — bottom
];



    this.textures = new Map();
  }

  addVoxel(position: Vector3, textype: VoxelTexType) {
    const cube = CreateBox("voxel", {
      size: 1,
      faceUV: this.voxelFaceUV,
      wrap: true,
      topBaseAt: 0,
      bottomBaseAt: 0
    }, this.scene);

    cube.position = position;

    if (this.textures.get(textype) != undefined) {
      cube.material = this.textures.get(textype) as StandardMaterial;
      return
    }
    
    const material = new StandardMaterial(textype, this.scene);
    material.diffuseTexture = new Texture(
      textype,
      this.scene,
      true,
      true,
      Texture.NEAREST_SAMPLINGMODE
    );
    material.specularColor = new Color3(0.1, 0.1, 0.1);

    cube.material = material;

    this.textures.set(textype, material);
  }


}