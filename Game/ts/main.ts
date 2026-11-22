import { Renderer } from "./webgpu/renderer"

async function main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  const renderer = new Renderer(canvas);
  await renderer.init();

  renderer.startRenderLoop();

  console.log(renderer.device, renderer.adapter);
}
main();