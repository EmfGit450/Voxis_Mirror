export const basicShader = `
  @group(0) @binding(0) var<uniform> worldMat: mat4x4<f32>;
  @group(0) @binding(1) var<uniform> cameraMat: mat4x4<f32>;
  @group(0) @binding(2) var<uniform> projectionMat: mat4x4<f32>;
  
  struct Vertex {
    @location(0) pos: vec3f,
    @location(1) color: vec3f
  };
  
  struct VSOutput {
    @builtin(position) pos: vec4f,
    @location(0) color: vec4f
  };
  
  @vertex
  fn vs(vert: Vertex) -> VSOutput {
    var vsOut: VSOutput;
  
    let worldPos = worldMat * vec4f(vert.pos, 1.0);
    let cameraPos = cameraMat * worldPos;
    vsOut.pos = projectionMat * cameraPos;
  
    vsOut.color = vec4f(vert.color, 1.0);
    return vsOut;
  }
  
  fn hash(x_in: u32) -> u32 {
    var x = x_in;
    x ^= x >> 16u;
    x *= 0x7feb352du;
    x ^= x >> 15u;
    x *= 0x846c98bu;
    x ^= x >> 16u;
    return x;
}

fn random_color(seed: u32) -> vec4f {
    let r = f32(hash(seed)) / 4294967296.0;
    let g = f32(hash(seed + 1u)) / 4294967296.0;
    let b = f32(hash(seed + 2u)) / 4294967296.0;
    return vec4f(r, g, b, 1);
}

 @fragment
fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
    let x = u32(position.x);
    let y = u32(position.y);
    let seed = x ^ (y * 0x9e3779b9u);

    return vec4f(random_color(seed));
}

`;