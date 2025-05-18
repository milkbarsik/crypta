const createMatrix = (text: string, colCount: number) => {
	const newText = text.split('');
	const result: string[][] = [];
	while (newText.length > 0) {
		if (newText.length < colCount) {
			result.push(newText.splice(0));
		}
		const arr = newText.splice(0, colCount);
		result.push(arr);
	}
	return result;
}

const keyParser = (key: string) => {
	return key
		.split('')
		.map((char, index) => ({char, index}))
		.sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index);
}

const getCol = (matrix: string[][], nowCol: number) => {
	let result = '';
	for (let i = 0; i < matrix.length; i++) {
		if (matrix[i][nowCol]) {
			result += matrix[i][nowCol];
		}
	}
	return result;
}

export const shifrVertical = (text: string, key: string, alphabet: string[]) => {
	const colCount = key.length;
	const matrix = createMatrix(text, colCount);
	const newKey = keyParser(key);

	let result = '';
	
	for (let key in newKey) {
		const nowCol = newKey[key].index;
		result += getCol(matrix, nowCol);
	}

	return result;
}

export const unShifrVertical = (text: string, key: string) => {
	const cols = key.length;
  const rows = Math.ceil(text.length / cols);
  const fullCells = text.length;
  const shortColsCount = rows * cols - fullCells; 

  const heights = Array(cols).fill(rows);
  for (let i = cols - shortColsCount; i < cols; i++) {
    if (i >= 0) heights[i] = rows - 1;
  }

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const sortedKey = keyParser(key);

  let pos = 0;
  for (const { index: origCol } of sortedKey) {
    const h = heights[origCol];
    for (let r = 0; r < h; r++) {
      grid[r][origCol] = text[pos++];
    }
  }

  let plain = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] != null) plain += grid[r][c];
    }
  }
  return plain;
}