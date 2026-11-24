import { Renderer } from "./webgpu/renderer"
import { World } from "./world";
import { MeshData } from "./objects";

function cubeVertices(r: number, g: number, b: number) {
  return new Float32Array([
    -0.5, -0.5, -0.5,   r, g, b,
     0.5, -0.5, -0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
    -0.5, -0.5, -0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
    -0.5,  0.5, -0.5,   r, g, b,
    -0.5, -0.5,  0.5,   r, g, b,
     0.5, -0.5,  0.5,   r, g, b,
     0.5,  0.5,  0.5,   r, g, b,
    -0.5, -0.5,  0.5,   r, g, b,
     0.5,  0.5,  0.5,   r, g, b,
    -0.5,  0.5,  0.5,   r, g, b,
     0.5, -0.5,  0.5,   r, g, b,
     0.5, -0.5, -0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
     0.5, -0.5,  0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
     0.5,  0.5,  0.5,   r, g, b,
    -0.5, -0.5, -0.5,   r, g, b,
    -0.5, -0.5,  0.5,   r, g, b,
    -0.5,  0.5,  0.5,   r, g, b,
    -0.5, -0.5, -0.5,   r, g, b,
    -0.5,  0.5,  0.5,   r, g, b,
    -0.5,  0.5, -0.5,   r, g, b,
    -0.5,  0.5,  0.5,   r, g, b,
     0.5,  0.5,  0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
    -0.5,  0.5,  0.5,   r, g, b,
     0.5,  0.5, -0.5,   r, g, b,
    -0.5,  0.5, -0.5,   r, g, b,
    -0.5, -0.5, -0.5,   r, g, b,
     0.5, -0.5, -0.5,   r, g, b,
     0.5, -0.5,  0.5,   r, g, b,
    -0.5, -0.5, -0.5,   r, g, b,
     0.5, -0.5,  0.5,   r, g, b,
    -0.5, -0.5,  0.5,   r, g, b
  ]);
}
async function main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  const renderer = new Renderer(canvas);
  await renderer.init();
  const world = new World(renderer);

  const mesh1 = new MeshData("test", 36, world);

  mesh1.updateVertices(cubeVertices(0.3, 0.3, 1.0));

  mesh1.translation = { x: -1, y: 0, z: -4 };
  mesh1.updateWorldMatrix();

  const mesh2 = new MeshData("test2", 36, world);

  mesh2.updateVertices(cubeVertices(1.0, 0.2, 0.2));

  mesh2.translation = { x: 1, y: 0, z: -4 };
  mesh2.updateWorldMatrix();

  renderer.startRenderLoop(() => {
    mesh1.rotation.x += 0.01;
    mesh1.rotation.y += 0.01;

    mesh1.updateWorldMatrix();

    mesh2.rotation.y += 0.01;

    mesh2.updateWorldMatrix();
  });

  console.log(renderer.device, renderer.adapter);
}
main();