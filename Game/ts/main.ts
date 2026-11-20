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
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );

        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded red triangle pipeline',
    layout: 'auto',
    vertex: {
      entryPoint: 'vs',
      module,
    },
    fragment: {
      entryPoint: 'fs',
      module,
      targets: [{ format: presentationFormat }],
    },
  });

  function render() {
    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: 'our basic canvas renderPass',
      colorAttachments: [
        {
          view: ctx.getCurrentTexture().createView(),
          clearValue: [0.3, 0.3, 0.3, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our encoder' });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
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