@group(0) @binding(0) var<uniform> worldMat: mat4x4<f32>;
@group(0) @binding(1) var<uniform> cameraMat: mat4x4<f32>;
@group(0) @binding(2) var<uniform> projectionMat: mat4x4<f32>;

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

  let worldPos = worldMat * vec4f(vert.pos, 1.0);
  let cameraPos = cameraMat * worldPos;
  vsOut.pos = projectionMat * cameraPos;

  vsOut.color = vec4f(vert.color, 1.0);
  return vsOut;
}

@fragment
fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return vsOut.color;
}