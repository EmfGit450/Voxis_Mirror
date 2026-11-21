var d=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}),r=Object.freeze({TerminatingError:i=>{throw new window.Error(`Voxis cannot be executed - ${i}`)},NonTerminatingError:i=>{console.error(`[Voxis 0.1.0] | ${d()} : ERROR - ${i}`)},Log:i=>{console.log(`[Voxis 0.1.0] | ${d()} : INFO - ${i}`)}});var l=`
  struct Vertex {
    @location(0) pos: vec3f,
    @location(1) color: vec3f
  }

  struct VSOutput {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f
  }

  @vertex
  fn vs(vert: Vertex) -> VSOutput {
    var vsOut: VSOutput;
    vsOut.pos = vec4f(vert.pos, 1.0);
    vsOut.color = vec4f(vert.color, 1.0);
    return vsOut;
  }

  @fragment
  fn fs(vsOut: VSOutput) -> @location(0) vec4f {
    return vsOut.color;
    return vsOut.color;
  }
`;var a=class{canvas;ctx;adapter;device;renderPassDescriptor;shaderModules;pipelines;prevTime=null;deltaFrameTime=null;vB;constructor(e){this.canvas=e,this.ctx=e.getContext("webgpu")}async init(){this.adapter=await this.initAdapter(),this.device=await this.initDevice(this.adapter);let e=navigator.gpu.getPreferredCanvasFormat();this.ctx.configure({device:this.device,format:e}),r.Log("Configured GPUCanvasContext");let t=this.device.createShaderModule({label:"triangle mesh shader module",code:l});r.Log("Created triangle shader module"),this.shaderModules={triangle:t};let n=this.device.createRenderPipeline({label:"triangle mesh pipeline",layout:"auto",vertex:{module:this.shaderModules.triangle,buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:t,targets:[{format:e}]}});r.Log("Created triangle rendering pipeline"),this.pipelines={triangle:n};let u=new Float32Array([-.5,-.5,0,1,0,0,.5,-.5,0,0,1,0,0,.5,0,0,0,1]);this.vB=this.device.createBuffer({label:"triangle mesh vertex buffer",size:4096,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.vB,0,u),this.renderPassDescriptor={label:"renderPassDescriptor for triangle meshes",colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},r.Log("Created render pass descriptor"),new ResizeObserver(m=>{for(let s of m){let o=s.target,v=s.contentBoxSize[0].inlineSize,p=s.contentBoxSize[0].blockSize,c=window.devicePixelRatio??1;o.width=Math.max(1,Math.min(v*c,this.device.limits.maxTextureDimension2D)),o.height=Math.max(1,Math.min(p*c,this.device.limits.maxTextureDimension2D))}}).observe(this.canvas)}render(){this.renderPassDescriptor.colorAttachments[0].view=this.ctx.getCurrentTexture().createView();let e=this.device.createCommandEncoder({label:"command encoder"}),t=e.beginRenderPass(this.renderPassDescriptor);t.setPipeline(this.pipelines.triangle),t.setVertexBuffer(0,this.vB),t.draw(3),t.end();let n=e.finish();this.device.queue.submit([n])}frame=()=>{this.render();let e=performance.now();this.deltaFrameTime=performance.now()-this.prevTime,this.prevTime=e,requestAnimationFrame(this.frame)};startRenderLoop(){r.Log("Starting render loop"),this.prevTime=performance.now(),requestAnimationFrame(this.frame)}async initAdapter(){navigator.gpu===void 0&&r.TerminatingError("navigator.gpu is undefined");let e=await navigator.gpu.requestAdapter();return e||r.TerminatingError(`adapter is ${e}`),e}async initDevice(e){let t=await e.requestDevice();return t||r.TerminatingError(`device is ${t}`),t.lost.then(n=>{r.NonTerminatingError(`device was lost -- ${n.message}`),n.reason!=="destroyed"&&init()}),t}};async function h(){let i=document.getElementById("renderCanvas"),e=new a(i);await e.init(),e.startRenderLoop(),console.log(e.device,e.adapter)}h();
//# sourceMappingURL=main.js.map
