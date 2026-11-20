function s(n){console.log(`[Voxis 0.1.0]: ERROR - ${n}`)}async function f(){if(navigator.gpu===void 0){s("navigator.gpu is undefined");return}let e=await(await navigator.gpu.requestAdapter()).requestDevice();if(!e){s("device is undefined");return}let r=document.getElementById("renderCanvas").getContext("webgpu"),a=navigator.gpu.getPreferredCanvasFormat();r.configure({device:e,format:a});let o=e.createShaderModule({label:"our hardcoded red triangle shaders",code:`
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
    `}),d=e.createRenderPipeline({label:"our hardcoded red triangle pipeline",layout:"auto",vertex:{entryPoint:"vs",module:o},fragment:{entryPoint:"fs",module:o,targets:[{format:a}]}}),i={label:"our basic canvas renderPass",colorAttachments:[{view:void 0,clearValue:[.3,.3,.3,1],loadOp:"clear",storeOp:"store"}]};function u(){i.colorAttachments[0].view=r.getCurrentTexture().createView();let c=e.createCommandEncoder({label:"our encoder"}),t=c.beginRenderPass(i);t.setPipeline(d),t.draw(3),t.end();let l=c.finish();e.queue.submit([l])}u()}f();
//# sourceMappingURL=main.js.map
