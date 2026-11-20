var a=Object.freeze({TerminatingError:t=>{throw new window.Error(`Voxis cannot be executed - ${t}`)},NonTerminatingError:t=>{console.error(`[Voxis 0.1.0]: ERROR - ${t}`)},Log:t=>{console.log(`[Voxis 0.1.0]: INFO - ${t}`)}});async function l(){navigator.gpu===void 0&&a.TerminatingError("navigator.gpu is undefined");let t=await navigator.gpu.requestAdapter();t||a.TerminatingError(`adapter is ${t}`);let e=await t.requestDevice();return e||a.TerminatingError(`device is ${e}`),e.lost.then(o=>{a.NonTerminatingError(`device was lost -- ${o.message}`),o.reason!=="destroyed"&&l()}),{adapter:t,device:e}}async function x(){let{adapter:t,device:e}=await l();window.d=e,window.a=t;let o=document.getElementById("renderCanvas"),c=o.getContext("webgpu"),u=navigator.gpu.getPreferredCanvasFormat();c.configure({device:e,format:u});let d=e.createShaderModule({label:"our hardcoded red triangle shaders",code:`
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
    `}),g=e.createRenderPipeline({label:"normal pipeline",layout:"auto",vertex:{entryPoint:"vs",module:d,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:"float32x2"}]}]},fragment:{entryPoint:"fs",module:d,targets:[{format:u}]}}),f=new Float32Array([.5,.5,-.5,-.5,.5,-.5]),v=e.createBuffer({label:"vertexBuffer",size:f.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(v,0,f);function m(){let i={label:"basic canvas renderPass",colorAttachments:[{view:c.getCurrentTexture().createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},n=e.createCommandEncoder({label:"command encoder"}),r=n.beginRenderPass(i);r.setPipeline(g),r.setVertexBuffer(0,v),r.draw(3),r.end();let s=n.finish();e.queue.submit([s])}new ResizeObserver(i=>{for(let n of i){let r=n.target,s=n.contentBoxSize[0].inlineSize,p=n.contentBoxSize[0].blockSize;r.width=Math.max(1,Math.min(s,e.limits.maxTextureDimension2D)),r.height=Math.max(1,Math.min(p,e.limits.maxTextureDimension2D))}m()}).observe(o)}x();
//# sourceMappingURL=main.js.map
