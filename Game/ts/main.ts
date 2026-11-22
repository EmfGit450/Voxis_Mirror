import { Renderer } from "./webgpu/renderer"
import { World } from "./world";
import { MeshData } from "./objects";

async function main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  const renderer = new Renderer(canvas);
  await renderer.init();
  const world = new World(renderer);

  const mesh = new MeshData(6);
  mesh.vertices = new Float32Array([
    // x,    y,    z,     r,   g,   b
    -0.5, -0.5,  0.0,   1.0, 0.0, 0.0,
    0.5, -0.5,  0.0,   0.0, 1.0, 0.0,
    0.5,  0.5,  0.0,   0.0, 0.0, 1.0,
    0.5,  0.5,  0.0,   0.0, 0.0, 1.0,
    -0.5,  0.5,  0.0,   0.0, 1.0, 0.0,
    -0.5, -0.5,  0.0,   1.0, 0.0, 0.0,
  ]);

  world.addMesh(mesh);

  renderer.startRenderLoop();

  console.log(renderer.device, renderer.adapter);
}
main();