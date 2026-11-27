import { App } from "../declarations";
import { clamp } from "../math";
import { type MeshData } from "../objects";
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


  vertexBuffer!: GPUBuffer;
  vertexBufferUsedSize: number = 0; //bytes

  cameraMatrixBuffer!: GPUBuffer;
  projectionMatrixBuffer!: GPUBuffer;

  worldMatricesStorageBuffer!: GPUBuffer;
  worldMatricesCount: number = 0;

  storageBufferBindGroup!: GPUBindGroup;
  uniformsBindGroup!: GPUBindGroup;


  prevTime: number | null = null;
  deltaFrameTime: number | null = null; //milliseconds

  beforeFrameCallbacks: Array<(dt: number) => void> = []; //runs before a frame is rendered, every frame


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
          arrayStride: 32, //1 uint32 and 7 float32 for 1 vertex, 32 bytes
          attributes: [
            { shaderLocation: 0, offset: 0, format: "uint32" }, //meshIndex
            { shaderLocation: 1, offset: 4, format: "float32x3" }, //3 for pos, 4 byte offset
            { shaderLocation: 2, offset: 16, format: "float32x4" } //4 for color, 4 + 12 byte offset
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
      size: 32 * 1000,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })


    this.cameraMatrixBuffer = this.device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.projectionMatrixBuffer = this.device.createBuffer({
      size: 16 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.uniformsBindGroup = this.device.createBindGroup({
      label: "bind group for uniforms",
      layout: trianglePipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: this.cameraMatrixBuffer },
        { binding: 1, resource: this.projectionMatrixBuffer }
      ]
    });

    App.Log("Created bind group for uniform buffers");


    this.worldMatricesStorageBuffer = this.device.createBuffer({
      size: 16 * 4 * 100,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    this.storageBufferBindGroup = this.device.createBindGroup({
      label: "bind group for storage buffer(s)",
      layout: trianglePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.worldMatricesStorageBuffer }
      ]
    });


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

        canvas.width = clamp(1, this.device.limits.maxTextureDimension2D, width * dpr);
        canvas.height = clamp(1, this.device.limits.maxTextureDimension2D, height * dpr);

        if (this.world) {
          this.world.camera.viewportAspectRatio = canvas.width / canvas.height;
          this.world.camera.updateProjectionMatrix();
          this.device.queue.writeBuffer(this.projectionMatrixBuffer, 0, this.world.camera.projectionMatrix);
        }
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

    pass.setBindGroup(0, this.storageBufferBindGroup);
    pass.setBindGroup(1, this.uniformsBindGroup);

    pass.setVertexBuffer(0, this.vertexBuffer);

    pass.draw(this.vertexBufferUsedSize / 32); //usedByteSize is vertexCount * bytesPerVertex

    pass.end();

    const commandBuffer = encoder.finish();
    this.device.queue.submit([commandBuffer]);
  }

  private frame = () => {
    for (let callback of this.beforeFrameCallbacks) {
      callback(this.deltaFrameTime ?? 0);
    }

    this.render();

    const now = performance.now();
    this.deltaFrameTime = performance.now() - this.prevTime!;
    this.prevTime = now;

    requestAnimationFrame(this.frame);
  }

  startRenderLoop(beforeFrameCallback: (dt: number) => void) {
    if (!this.world) {
      App.Error("world for the renderer is not defined");
    }

    this.beforeFrameCallbacks.push(beforeFrameCallback);

    App.Log("Starting render loop");

    this.prevTime = performance.now();
    requestAnimationFrame(this.frame);
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


  updateCameraMatrixBuffer() {
    if (!this.world) App.Error("world for the renderer is undefined");
    this.device.queue.writeBuffer(this.cameraMatrixBuffer, 0, this.world!.camera.cameraMatrix);
  }


  addMeshData(mesh: MeshData) {
    mesh.meshIndex = this.vertexBufferUsedSize / 32 + 1;
    mesh.vertexBufferByteOffset = this.vertexBufferUsedSize;

    for (let i = 0; i < mesh.vertices.length; i += 8) {
      mesh.vertices[i] = mesh.meshIndex;
    }

    this.device.queue.writeBuffer(this.vertexBuffer, this.vertexBufferUsedSize, mesh.vertices as Float32Array<ArrayBuffer>);
    this.vertexBufferUsedSize += mesh.vertices.byteLength;

    this.device.queue.writeBuffer(this.worldMatricesStorageBuffer, this.worldMatricesCount, mesh.worldMatrix);
    this.worldMatricesCount += 1;
  }

  updateMeshWorldMatrixBuffer(byteOffset: number, matrix: Float32Array<ArrayBuffer>) {
    this.device.queue.writeBuffer(this.worldMatricesStorageBuffer, byteOffset, matrix);
  }
}
