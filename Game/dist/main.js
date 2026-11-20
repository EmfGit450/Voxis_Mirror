var a=Object.freeze({TerminatingError:t=>{throw new window.Error(`Voxis cannot be executed - ${t}`)},NonTerminatingError:t=>{console.error(`[Voxis 0.1.0]: ERROR - ${t}`)},Log:t=>{console.log(`[Voxis 0.1.0]: INFO - ${t}`)}});async function v(){navigator.gpu===void 0&&a.TerminatingError("navigator.gpu is undefined");let t=await navigator.gpu.requestAdapter();t||a.TerminatingError(`adapter is ${t}`);let e=await t.requestDevice();return e||a.TerminatingError(`device is ${e}`),e.lost.then(o=>{a.NonTerminatingError(`device was lost -- ${o.message}`),o.reason!=="destroyed"&&v()}),{adapter:t,device:e}}async function x(){let{adapter:t,device:e}=await v();window.d=e,window.a=t;let o=document.getElementById("renderCanvas"),u=o.getContext("webgpu"),d=navigator.gpu.getPreferredCanvasFormat();u.configure({device:e,format:d});let f=e.createShaderModule({label:"our hardcoded red triangle shaders",code:`
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
    `}),g=e.createRenderPipeline({label:"normal pipeline",layout:"auto",vertex:{entryPoint:"vs",module:f,buffers:[{arrayStride:8,attributes:[{shaderLocation:0,offset:0,format:"float32x2"}]}]},fragment:{entryPoint:"fs",module:f,targets:[{format:d}]}}),i=new Float32Array([-.5,-.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,-.5,.5]),l=e.createBuffer({label:"vertexBuffer",size:i.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(l,0,i);function m(){let s={label:"basic canvas renderPass",colorAttachments:[{view:u.getCurrentTexture().createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},n=e.createCommandEncoder({label:"command encoder"}),r=n.beginRenderPass(s);r.setPipeline(g),r.setVertexBuffer(0,l),r.draw(i.length/2),r.end();let c=n.finish();e.queue.submit([c])}new ResizeObserver(s=>{for(let n of s){let r=n.target,c=n.contentBoxSize[0].inlineSize,p=n.contentBoxSize[0].blockSize;r.width=Math.max(1,Math.min(c,e.limits.maxTextureDimension2D)),r.height=Math.max(1,Math.min(p,e.limits.maxTextureDimension2D))}m()}).observe(o)}x();
//# sourceMappingURL=main.js.map
