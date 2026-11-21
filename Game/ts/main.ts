import { Renderer } from "./renderer"

async function main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  const renderer = new Renderer(canvas);
  await renderer.init();

  renderer.runRenderLoop();
}
main();