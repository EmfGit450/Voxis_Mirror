export const basicShader = `
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
`;