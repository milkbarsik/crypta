function determinant(matrix: number[][]) {
  const n = matrix.length;
  
  if (!matrix.every(row => row.length === n)) {
    throw new Error("Матрица должна быть квадратной");
  }
  
  if (n === 1) {
    return matrix[0][0];
  }

  if (n === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  let det = 0;
  for (let col = 0; col < n; col++) {
    const submatrix = matrix.slice(1).map(row =>
      row.filter((_, j) => j !== col)
    );
    const sign = (col % 2 === 0) ? 1 : -1;
    det += sign * matrix[0][col] * determinant(submatrix);
  }
  
  return det;
}

const keyParser = (key: string) => {
	const formatKey = key.split('&').map(el => {
		return el.split(' ').map(elem => parseInt(elem));
	})
	return formatKey;
}

const textParserEncrypt = (text: string, alphabet: string[]) => {
	const formatText: number[][] = [];
	const newText = text.split('');

	while (newText.length > 0) {
		if (newText.length < 3) {
			formatText.push(newText.splice(0).map(el => {
				return alphabet.findIndex(elem => elem === el) + 1;
			}));
			break;
		}
		const arr = newText.splice(0, 3).map(el => {
			return alphabet.findIndex(elem => elem === el) + 1;
		})
		formatText.push(arr);
	}
	
	if(formatText[formatText.length - 1].length < 3) {
		while (formatText[formatText.length - 1].length < 3) {
			formatText[formatText.length - 1].push(0);
		}
	}

	return formatText;
}

const textParserDecrypt = (text: string) => {
	const formatText: number[][] = [];
	const newText = text.trim().split(' ');

	while (newText.length > 0) {
		if (newText.length < 3) {
			formatText.push(newText.splice(0).map(el => parseInt(el)));
			break;
		}
		const arr = newText.splice(0, 3).map(el => parseInt(el));
		formatText.push(arr);
	}
	if(formatText[formatText.length - 1].length < 3) {
		while (formatText[formatText.length - 1].length < 3) {
			formatText[formatText.length - 1].push(0);
		}
	}
	return formatText;
}

function multiplyMatrix(A: number[][], B: number[][]) {
  if (A[0].length !== B.length) {
    return ('Невозможно перемножить матрицы: число столбцов в A не равно числу строк в B');
  }

  const m = A.length;
  const n = A[0].length;
  const p = B[0].length;

  const result = new Array(m);
  for (let i = 0; i < m; i++) {
    result[i] = new Array(p).fill(0);
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function invertMatrix(matrix: number[][]) {
  const n = matrix.length;
  
  if (!matrix.every(row => row.length === n)) {
    throw new Error("Матрица должна быть квадратной");
  }
  
  const augmented = matrix.map((row, i) => [
    ...row, 
    ...new Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
  ]);
  
  for (let i = 0; i < n; i++) {
    if (augmented[i][i] === 0) {
      let found = false;
      for (let k = i + 1; k < n; k++) {
        if (augmented[k][i] !== 0) {
          [augmented[i], augmented[k]] = [augmented[k], augmented[i]];
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("Матрица вырождена и не имеет обратной");
      }
    }
    
    const diag = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= diag;
    }
    
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = augmented[k][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  const inverse = augmented.map(row => row.slice(n, 2 * n));
  return inverse;
}

export const shifrMatrix = (text: string, key: string, alphabet: string[]) => {
	const matrix = keyParser(key);
	if (determinant(matrix) === 0) {
		return 'invalid matrix';
	}
	console.log(JSON.stringify(invertMatrix(matrix)));
	const formatText = textParserEncrypt(text, alphabet);
	
	let result = [];
	for (let el of formatText) {
		result.push(...(multiplyMatrix([el], matrix))[0]);
	}
	
	return result.join(' ');
}

export const unShifrMatrix = (text: string, key: string, alphabet: string[]) => {
	const formatText = textParserDecrypt(text);
	const matrix = (invertMatrix(keyParser(key)));
	if (determinant(matrix) === 0) {
		return 'invalid matrix';
	}

	let result: string[] = [];

	for (let el of formatText) {
		result.push(...(multiplyMatrix([el], matrix))[0]);
	}
	console.log(result);
	return result.map(el => {
		return alphabet[parseInt(el) - 1];
	}).join('');
}