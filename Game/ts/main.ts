async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  if (navigator.gpu !== undefined) {
    
  }
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("");
    return;
  }
}
main();