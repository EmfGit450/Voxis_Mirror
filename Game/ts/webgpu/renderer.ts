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

  world: World | undefined = undefined;

  activeWorldMatrix!: GPUBuffer;
  cameraMatrixBuffer!: GPUBuffer;
  projectionMatrixBuffer!: GPUBuffer;

  matricesBindGroup!: GPUBindGroup;

  prevTime: number | null = null;
  deltaFrameTime: number | null = null;

  //Test
  vertexBuffer!: GPUBuffer;
  vertexBufferByteSize: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgpu") as GPUCanvasContext;
  }

  async init() {
    this.adapter = await this.initAdapter() as GPUAdapter;
    this.device = await this.initDevice(this.adapter);

    this.device.addEventListener?.("uncapturederror", (e) => {
      App.Warning(e.error.message);
    });
    this.device.onuncapturederror = (e) => {
      App.Warning(e.error.message);
    };

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


    this.vertexBuffer = this.device.createBuffer({
      label: "triangle mesh vertex buffer",
      size: 240,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });


    this.activeWorldMatrix = this.device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.cameraMatrixBuffer = this.device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.projectionMatrixBuffer = this.device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.matricesBindGroup = this.device.createBindGroup({
      label: "bind group for matrices",
      layout: this.pipelines.triangle.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.activeWorldMatrix },
        { binding: 1, resource: this.cameraMatrixBuffer },
        { binding: 2, resource: this.projectionMatrixBuffer }
      ]
    });

    App.Log("Created bind group for matrices");

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
    pass.setBindGroup(0, this.matricesBindGroup);
    pass.setVertexBuffer(0, this.vertexBuffer);

    for (let i = 0; i < this.world!.meshes.length; i++) {
      const mesh = this.world!.meshes[i]!;
      this.device.queue.writeBuffer(this.activeWorldMatrix, 0, mesh.worldMatrix);
      pass.draw(mesh.vertexCount);
    }

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
    if (!this.world) {
      App.Error("world for the called renderer is not defined");
    }
    App.Log("Starting render loop");

    this.prevTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  writeToVertexBuffer(data: Float32Array<ArrayBuffer>) {
    this.device.queue.writeBuffer(this.vertexBuffer, this.vertexBufferByteSize, data);
    this.vertexBufferByteSize += data.byteLength;

    App.Log(`Wrote ${data.byteLength} bytes to renderer's vertex buffer`);
  }

  private async initAdapter() {
    if (navigator.gpu === undefined) {
      App.Error("navigator.gpu is undefined");
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      App.Error(`adapter is ${adapter}`);
    }

    return adapter;
  }

  private async initDevice(adapter: GPUAdapter) {
    const device = await adapter.requestDevice();

    if (!device) {
      App.Error(`device is ${device}`);
    }

    device.lost.then((info) => {
      App.Warning(`device was lost -- ${info.message}`);

      if (info.reason !== 'destroyed') {
        void this.initDevice(adapter).catch((err) => {
          App.Warning(`device reinitialization failed -- ${err}`);
        });
      }
    });

    return device;
  }
}