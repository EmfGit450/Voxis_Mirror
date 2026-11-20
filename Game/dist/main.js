var a=Object.freeze({TerminatingError:t=>{throw new window.Error(`Voxis cannot be executed - ${t}`)},NonTerminatingError:t=>{console.error(`[Voxis 0.1.0]: ERROR - ${t}`)},Log:t=>{console.log(`[Voxis 0.1.0]: INFO - ${t}`)}});async function u(){navigator.gpu===void 0&&a.TerminatingError("navigator.gpu is undefined");let t=await navigator.gpu.requestAdapter();t||a.TerminatingError(`adapter is ${t}`);let e=await t.requestDevice();return e||a.TerminatingError(`device is ${e}`),e.lost.then(o=>{a.NonTerminatingError(`device was lost -- ${o.message}`),o.reason!=="destroyed"&&u()}),{adapter:t,device:e}}async function f(){let{adapter:t,device:e}=await u();window.d=e,window.a=t;let o=document.getElementById("renderCanvas"),c=o.getContext("webgpu"),d=navigator.gpu.getPreferredCanvasFormat();c.configure({device:e,format:d});let l=e.createShaderModule({label:"our hardcoded red triangle shaders",code:`
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
    `}),m=e.createRenderPipeline({label:"our hardcoded red triangle pipeline",layout:"auto",vertex:{entryPoint:"vs",module:l},fragment:{entryPoint:"fs",module:l,targets:[{format:d}]}});function v(){let i={label:"our basic canvas renderPass",colorAttachments:[{view:c.getCurrentTexture().createView(),clearValue:[.3,.3,.3,1],loadOp:"clear",storeOp:"store"}]},n=e.createCommandEncoder({label:"our encoder"}),r=n.beginRenderPass(i);r.setPipeline(m),r.draw(3),r.end();let s=n.finish();e.queue.submit([s])}new ResizeObserver(i=>{for(let n of i){let r=n.target,s=n.contentBoxSize[0].inlineSize,g=n.contentBoxSize[0].blockSize;r.width=Math.max(1,Math.min(s,e.limits.maxTextureDimension2D)),r.height=Math.max(1,Math.min(g,e.limits.maxTextureDimension2D))}v()}).observe(o)}f();
//# sourceMappingURL=main.js.map
