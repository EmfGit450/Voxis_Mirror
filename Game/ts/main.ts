const App = Object.freeze({
  TerminatingError: (message: string): never => { throw new window.Error(`Voxis cannot be executed - ${message}`); },
  NonTerminatingError: (message: string) => { console.error(`[Voxis 0.1.0]: ERROR - ${message}`); },

  Log: (message: string) => { console.log(`[Voxis 0.1.0]: INFO - ${message}`); }
})


async function init() {
  if (navigator.gpu === undefined) {
    App.TerminatingError("navigator.gpu is undefined");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    App.TerminatingError(`adapter is ${adapter}`);
  }

  const device = await (adapter as GPUAdapter).requestDevice();

  if (!device) {
    App.TerminatingError(`device is ${device}`);
  }

  device.lost.then((info) => {
    App.NonTerminatingError(`device was lost -- ${info.message}`);

    if (info.reason !== 'destroyed') {
      init();
    }
  });

  return { adapter, device };
}

async function main() {
  const { adapter, device } = await init();

  //@ts-ignore
  window.d = device;
  //@ts-ignore
  window.a = adapter;

  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext('webgpu') as GPUCanvasContext;
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({
    device,
    format: presentationFormat,
  });

  const module = device.createShaderModule({
    label: 'our hardcoded red triangle shaders',
    code: /* wgsl */ `
      @group(0) @binding(0) var<storage, read_write> vertices: array<f32>;

      struct Vertex {
        @location(0) position: vec2f
      };
      
      struct VSOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec4f
      };

      @vertex fn vs(
        vert: Vertex
      ) -> VSOutput {
        var vsOut: VSOutput;
        vsOut.position = vec4f(vert.position, 0.0, 1.0);
        vsOut.color = vec4f(1, 0.5, 1, 1);
        return vsOut;
      }

      @fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
        return vsOut.color;
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: 'normal pipeline',
    layout: 'auto',
    vertex: {
      entryPoint: 'vs',
      module,
      buffers: [{
        arrayStride: 2 * 4, // 2 floats for one vertex, each float 4 bytes,
        attributes: [{shaderLocation: 0, offset: 0, format: "float32x2"}]
      }]
    },
    fragment: {
      entryPoint: 'fs',
      module,
      targets: [{ format: presentationFormat }],
    },
  });

  const TEST_VERTICES = new Float32Array([
    0.5, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ])

  const vertexBuffer = device.createBuffer({
    label: "vertexBuffer",
    size: TEST_VERTICES.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });

  device.queue.writeBuffer(vertexBuffer, 0, TEST_VERTICES);

  function render() {
    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: 'basic canvas renderPass',
      colorAttachments: [
        {
          view: ctx.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: "command encoder" });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(3);  // call our vertex shader 3 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const canvas = entry.target as HTMLCanvasElement;
      const width = entry.contentBoxSize[0]!.inlineSize;
      const height = entry.contentBoxSize[0]!.blockSize;
      canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
      canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
    }
    // re-render
    render();
  });
  observer.observe(canvas);
}
main();