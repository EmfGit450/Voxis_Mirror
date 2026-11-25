import { Renderer } from "./webgpu/renderer"
import { World } from "./world";
import { MeshData } from "./objects";
import { clamp } from "./math";

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

  const camera = world.camera;

  const mesh1 = new MeshData("test", 36, world);

  mesh1.updateVertices(cubeVertices(0.3, 0.3, 1.0));

  mesh1.translation = { x: -1, y: 0, z: -4 };
  mesh1.updateWorldMatrix();

  const mesh2 = new MeshData("test2", 36, world);

  mesh2.updateVertices(cubeVertices(1.0, 0.2, 0.2));

  mesh2.translation = { x: 1, y: 0, z: -4 };
  mesh2.updateWorldMatrix();

  renderer.startRenderLoop((dt) => {
    mesh1.rotation.x += 0.0001 * dt;
    mesh1.rotation.y += 0.0003 * dt;
    mesh1.rotation.z += 0.0005 * dt;

    mesh1.updateWorldMatrix();

    mesh2.rotation.x += 0.0001 * dt;

    mesh2.updateWorldMatrix();
  });

  canvas.addEventListener("click", () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
  });

  //@ts-ignore
  window.c = camera;

  camera.rotationLimits.z = 1.5607963267948965;

  window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) return;

    camera.rotation.y += e.movementX * 0.001;
    camera.rotation.z -= e.movementY * 0.001;

    camera.applyRotatation();
  });

  window.addEventListener("mouseup", () => {
    console.log(camera.position, camera.rotation)
  })

  window.addEventListener("keydown", (e) => {
    if (e.key == "w") {
      camera.position.z -= 0.2;
      camera.updateCameraMatrix();
    }
    if (e.key == "s") {
      camera.position.z += 0.2;
      camera.updateCameraMatrix();
    }
    if (e.key == "a") {
      camera.position.x -= 0.2;
      camera.updateCameraMatrix();
    }
    if (e.key == "d") {
      camera.position.x += 0.2;
      camera.updateCameraMatrix();
    }
  })

  console.log(renderer.device, renderer.adapter);
}
main();