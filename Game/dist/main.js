function i(e){console.log(`[Voxis 0.1.0]: ERROR - ${e}`)}async function u(){if(navigator.gpu===void 0){i("navigator.gpu is undefined");return}let n=await(await navigator.gpu.requestAdapter()).requestDevice();if(!n){i("device is undefined");return}return n.lost.then(r=>{i(`device was lost -- ${r.message}`),r.reason!=="destroyed"&&u()}),n}async function g(){let e=await u(),n=document.getElementById("renderCanvas"),r=n.getContext("webgpu"),s=navigator.gpu.getPreferredCanvasFormat();r.configure({device:e,format:s});let c=e.createShaderModule({label:"our hardcoded red triangle shaders",code:`
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
    `}),l=e.createRenderPipeline({label:"our hardcoded red triangle pipeline",layout:"auto",vertex:{entryPoint:"vs",module:c},fragment:{entryPoint:"fs",module:c,targets:[{format:s}]}}),d={label:"our basic canvas renderPass",colorAttachments:[{view:void 0,clearValue:[.3,.3,.3,1],loadOp:"clear",storeOp:"store"}]};function v(){d.colorAttachments[0].view=r.getCurrentTexture().createView();let o=e.createCommandEncoder({label:"our encoder"}),t=o.beginRenderPass(d);t.setPipeline(l),t.draw(3),t.end();let a=o.finish();e.queue.submit([a])}new ResizeObserver(o=>{for(let t of o){let a=t.target,f=t.contentBoxSize[0].inlineSize,m=t.contentBoxSize[0].blockSize;a.width=Math.max(1,Math.min(f,e.limits.maxTextureDimension2D)),a.height=Math.max(1,Math.min(m,e.limits.maxTextureDimension2D))}v()}).observe(n)}g();
//# sourceMappingURL=main.js.map
