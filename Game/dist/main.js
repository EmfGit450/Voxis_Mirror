var l=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}),t=Object.freeze({TerminatingError:n=>{throw new window.Error(`Voxis cannot be executed - ${n}`)},NonTerminatingError:n=>{console.error(`[Voxis 0.1.0] | ${l()} : ERROR - ${n}`)},Log:n=>{console.log(`[Voxis 0.1.0] | ${l()} : INFO - ${n}`)}});var u=`
  @
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
  }
`;var s=class{canvas;ctx;adapter;device;renderPassDescriptor;shaderModules;pipelines;prevTime=null;deltaFrameTime=null;vB;constructor(e){this.canvas=e,this.ctx=e.getContext("webgpu")}async init(){this.adapter=await this.initAdapter(),this.device=await this.initDevice(this.adapter);let e=navigator.gpu.getPreferredCanvasFormat();this.ctx.configure({device:this.device,format:e}),t.Log("Configured GPUCanvasContext");let r=this.device.createShaderModule({label:"triangle mesh shader module",code:u});t.Log("Created triangle shader module"),this.shaderModules={triangle:r};let i=this.device.createRenderPipeline({label:"triangle mesh pipeline",layout:"auto",vertex:{module:this.shaderModules.triangle,buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:r,targets:[{format:e}]}});t.Log("Created triangle rendering pipeline"),this.pipelines={triangle:i};let a=new Float32Array([-.5,-.5,0,1,0,0,.5,-.5,0,0,1,0,.5,.5,0,0,0,1,.5,.5,0,0,0,1,-.5,.5,0,0,1,0,-.5,-.5,0,1,0,0]);this.vB=this.device.createBuffer({label:"triangle mesh vertex buffer",size:24e3,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.vB,0,a),this.renderPassDescriptor={label:"renderPassDescriptor for triangle meshes",colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]},t.Log("Created render pass descriptor"),new ResizeObserver(m=>{for(let o of m){let c=o.target,v=o.contentBoxSize[0].inlineSize,p=o.contentBoxSize[0].blockSize,d=window.devicePixelRatio??1;c.width=Math.max(1,Math.min(v*d,this.device.limits.maxTextureDimension2D)),c.height=Math.max(1,Math.min(p*d,this.device.limits.maxTextureDimension2D))}}).observe(this.canvas)}render(){let e=this.renderPassDescriptor.colorAttachments[Symbol.iterator]().next().value;e.view=this.ctx.getCurrentTexture().createView();let r=this.device.createCommandEncoder({label:"command encoder"}),i=r.beginRenderPass(this.renderPassDescriptor);i.setPipeline(this.pipelines.triangle),i.setVertexBuffer(0,this.vB),i.draw(6),i.end();let a=r.finish();this.device.queue.submit([a])}frame=()=>{this.render();let e=performance.now();this.deltaFrameTime=performance.now()-this.prevTime,this.prevTime=e,requestAnimationFrame(this.frame)};startRenderLoop(){t.Log("Starting render loop"),this.prevTime=performance.now(),requestAnimationFrame(this.frame)}async initAdapter(){navigator.gpu===void 0&&t.TerminatingError("navigator.gpu is undefined");let e=await navigator.gpu.requestAdapter();return e||t.TerminatingError(`adapter is ${e}`),e}async initDevice(e){let r=await e.requestDevice();return r||t.TerminatingError(`device is ${r}`),r.lost.then(i=>{t.NonTerminatingError(`device was lost -- ${i.message}`),i.reason!=="destroyed"&&this.initDevice(e).catch(a=>{t.NonTerminatingError(`device reinitialization failed -- ${a}`)})}),r}};async function h(){let n=document.getElementById("renderCanvas"),e=new s(n);await e.init(),e.startRenderLoop(),console.log(e.device,e.adapter)}h();
//# sourceMappingURL=main.js.map
