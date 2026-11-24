export type Vector3 = {
  x: number;
  y: number;
  z: number;
};


export function matmul4x4(mat1: Float32Array, mat2: Float32Array) {
  let result = new Float32Array(16);
  for (let col2 = 0; col2 < 4; col2++) {
    for (let row1 = 0; row1 < 4; row1++) {
     result[col2 * 4 + row1] =
        mat1[row1]!      * mat2[col2 * 4]! +
        mat1[4 + row1]!  * mat2[col2 * 4 + 1]! +
        mat1[8 + row1]!  * mat2[col2 * 4 + 2]! +
        mat1[12 + row1]! * mat2[col2 * 4 + 3]!;
    }
  }

  return result;
}

export function translationMatrix(translation: Vector3) {
  const matrix = new Float32Array(16);

  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;

  matrix[12] = translation.x;
  matrix[13] = translation.y;
  matrix[14] = translation.z;

  return matrix;
}

export function scalingMatrix(scaling: Vector3) {
  const matrix = new Float32Array(16);

  matrix[0] = scaling.x;
  matrix[5] = scaling.y;
  matrix[10] = scaling.z;
  matrix[15] = 1;

  return matrix;
}

export function rollMatrix(angle: number) {
  const matrix = new Float32Array(16);

  matrix[0] = 1;
  matrix[15] = 1;

  matrix[5] = Math.cos(angle);
  matrix[6] = -Math.sin(angle);
  matrix[9] = Math.sin(angle);
  matrix[10] = Math.cos(angle);

  return matrix;
}

export function yawMatrix(angle: number) {
  const matrix = new Float32Array(16);

  matrix[5] = 1;
  matrix[15] = 1;

  matrix[0] = Math.cos(angle);
  matrix[2] = -Math.sin(angle);
  matrix[8] = Math.sin(angle);
  matrix[10] = Math.cos(angle);

  return matrix;
}

export function pitchMatrix(angle: number) {
  const matrix = new Float32Array(16);

  matrix[10] = 1;
  matrix[15] = 1;

  matrix[0] = Math.cos(angle);
  matrix[1] = -Math.sin(angle);
  matrix[4] = Math.sin(angle);
  matrix[5] = Math.cos(angle);

  return matrix;
}