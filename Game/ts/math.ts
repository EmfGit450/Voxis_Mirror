export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type Matrix4 = Float32Array;

export function createMatrix4() {
  return new Float32Array(16);
}