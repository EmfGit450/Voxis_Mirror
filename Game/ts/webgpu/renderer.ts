import { App } from "../declarations"

import { World } from "../world";

import { basicShader } from "./shaders"

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: GPUCanvasContext;

  adapter!: GPUAdapter;
  device!: GPUDevice;

  renderPassDescriptor!: GPURenderPassDescriptor;

  shaderModules!: {
    triangle: GPUShaderModule;
    //voxel: GPUShaderModule;
  };

  pipelines!: {
    triangle: GPURenderPipeline;
    //voxel: GPURenderPipeline;
  };

  world: World;

  prevTime: number | null = null;
  deltaFrameTime: number | null = null;

  //Test
  vB!: GPUBuffer;

  constructor(canvas: HTMLCanvasElement, world: World) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgpu") as GPUCanvasContext;

    this.world = world;
  }

  async init() {
    this.adapter = await this.initAdapter() as GPUAdapter;
    this.device = await this.initDevice(this.adapter);

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.ctx.configure({
      device: this.device,
      format: presentationFormat
    });

    App.Log("Configured GPUCanvasContext");

    const triangleShaderModule = this.device.createShaderModule({
      label: "triangle mesh shader module",
      code: basicShader
    });

    App.Log("Created triangle shader module");

    this.shaderModules = {
      triangle: triangleShaderModule,
    };

    const trianglePipeline = this.device.createRenderPipeline({
      label: "triangle mesh pipeline",
      layout: "auto",
      vertex: {
        module: this.shaderModules.triangle,
        buffers: [{
          arrayStride: 6 * 4, //6 floats for 1 vertex
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" }, //3 for pos
            { shaderLocation: 1, offset: 12, format: "float32x3" } //3 for color, 12 byte offset
          ]
        }]
      },
      fragment: {
        module: triangleShaderModule,
        targets: [{ format: presentationFormat }]
      }
    });

    App.Log("Created triangle rendering pipeline");

    this.pipelines = {
      triangle: trianglePipeline
    };

    const TEST_VERTICES = new Float32Array([
      // x,    y,    z,     r,   g,   b
      -0.5, -0.5,  0.0,   1.0, 0.0, 0.0,
      0.5, -0.5,  0.0,   0.0, 1.0, 0.0,
      0.5,  0.5,  0.0,   0.0, 0.0, 1.0,
      0.5,  0.5,  0.0,   0.0, 0.0, 1.0,
      -0.5,  0.5,  0.0,   0.0, 1.0, 0.0,
      -0.5, -0.5,  0.0,   1.0, 0.0, 0.0,
    ]);

    this.vB = this.device.createBuffer({
      label: "triangle mesh vertex buffer",
      size: 24000,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    this.device.queue.writeBuffer(this.vB, 0, TEST_VERTICES);

    this.renderPassDescriptor = {
      label: 'renderPassDescriptor for triangle meshes',
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    App.Log("Created render pass descriptor");

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const canvas = entry.target as HTMLCanvasElement;
        const width = entry.contentBoxSize[0]!.inlineSize;
        const height = entry.contentBoxSize[0]!.blockSize;

        const dpr = window.devicePixelRatio ?? 1;

        canvas.width = Math.max(1, Math.min(width * dpr, this.device.limits.maxTextureDimension2D));
        canvas.height = Math.max(1, Math.min(height * dpr, this.device.limits.maxTextureDimension2D));
      }
    });
    observer.observe(this.canvas);
  }

  render() {
    const firstAttachment = this.renderPassDescriptor.colorAttachments[Symbol.iterator]().next().value;
    firstAttachment.view  = this.ctx.getCurrentTexture().createView() as GPUTextureView;

    const encoder = this.device.createCommandEncoder({ label: "command encoder" });

    const pass = encoder.beginRenderPass(this.renderPassDescriptor);
    pass.setPipeline(this.pipelines.triangle);
    pass.setVertexBuffer(0, this.vB);
    pass.draw(6);
    pass.end();

    const commandBuffer = encoder.finish();
    this.device.queue.submit([commandBuffer]);
  }

  private frame = () => {
    this.render();

    const now = performance.now();
    this.deltaFrameTime = performance.now() - this.prevTime!;
    this.prevTime = now;

    requestAnimationFrame(this.frame);
  }

  startRenderLoop() {
    App.Log("Starting render loop");

    this.prevTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  private async initAdapter() {
    if (navigator.gpu === undefined) {
      App.TerminatingError("navigator.gpu is undefined");
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      App.TerminatingError(`adapter is ${adapter}`);
    }

    return adapter;
  }

  private async initDevice(adapter: GPUAdapter) {
    const device = await adapter.requestDevice();

    if (!device) {
      App.TerminatingError(`device is ${device}`);
    }

    device.lost.then((info) => {
      App.NonTerminatingError(`device was lost -- ${info.message}`);

      if (info.reason !== 'destroyed') {
        void this.initDevice(adapter).catch((err) => {
          App.NonTerminatingError(`device reinitialization failed -- ${err}`);
        });
      }
    });

    return device;
  }
}