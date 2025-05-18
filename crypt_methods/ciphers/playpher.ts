const f = 'ф';

const createTable = (key: string, alphabet: string[]) => {
	let newAlphabet: string[] = [];

	for (let el of key) {
		newAlphabet.push(el);
	}

	for (let el of alphabet) {
		if (!newAlphabet.find(elem => elem === el)) {
			if (el === 'й' || el === 'ь') {
				continue;
			}
			newAlphabet.push(el);
		}
	}

	const matrix: string[][] = [];

	while (newAlphabet.length > 0) {
		if (newAlphabet.length < 6) {
			matrix.push(newAlphabet.splice(0));
			break;
		}
		matrix.push(newAlphabet.splice(0, 6));
	}
	return matrix;
}

const formatText = (text: string) => {
	const newText = text.replace('й', 'и').replace('ь', 'ъ');
	let format_text = [newText[0]];
	for (let i = 1; i < newText.length; i++) {
		if (newText[i] === newText[i - 1]) {
			format_text.push(f);
			format_text.push(newText[i])
		} else {
			format_text.push(newText[i])
		}
	}
	if (format_text.length % 2 === 1) {
		format_text.push(f);
	}
	
	let result: string[] = [];

	while (format_text.length > 0) {
		result.push(format_text.splice(0, 2).join(''))
	}
	return result;
}

const encryptPair = (pair: string, matrix: string[][]) => {
	const findPosition = (char: string) => {
		for (let i = 0; i < matrix.length; i++) {
			const col = matrix[i].findIndex(el => el === char);
			if (col != -1) {
				return {row: i, col: col}
			}
		}
	}

	const {row: a_row, col: a_col} = {...findPosition(pair[0])!};
	const {row: b_row, col: b_col} = {...findPosition(pair[1])!};

	if (a_row == b_row) {
		return matrix[a_row][(a_col + 1) % 6] + matrix[b_row][(b_col + 1) % 6];
	}
	else if (a_col == b_col) {
		return matrix[(a_row + 1) % 5][a_col] + matrix[(b_row + 1) % 5][b_col]
	} else {
		return matrix[a_row][b_col] + matrix[b_row][a_col];
	}
}


export const shifrPlaypher = (text: string, key: string, alphabet: string[]) => {
	for (let el of key) {
		if (!alphabet.find(elem => el === elem)) {
			return 'invalid key';
		}
		if (Array.from(new Set(key.split(''))).length != key.length) {
			return 'invalid key';
		}
		if (el === 'ь' || el === 'й') {
			return 'invalid key';
		}
	}

	const matrix = createTable(key, alphabet);
	console.log(matrix);
	const format_text = formatText(text);

	let result = '';
	for (let el of format_text) {
		result += encryptPair(el, matrix);
	}

	return result;
}

const decryptPair = (pair: string, matrix: string[][]) => {
	const findPosition = (char: string) => {
		for (let i = 0; i < matrix.length; i++) {
			const col = matrix[i].findIndex(el => el === char);
			if (col != -1) {
				return {row: i, col: col}
			}
		}
	}

	const {row: a_row, col: a_col} = {...findPosition(pair[0])!};
	const {row: b_row, col: b_col} = {...findPosition(pair[1])!};

	if (a_row == b_row) {
		return matrix[a_row][(a_col + 5) % 6] + matrix[b_row][(b_col + 5) % 6];
	}
	else if (a_col == b_col) {
		return matrix[(a_row + 4) % 5][a_col] + matrix[(b_row + 4) % 5][b_col]
	} else {
		return matrix[a_row][b_col] + matrix[b_row][a_col];
	}

}

export const unShifrPlaypher = (text: string, key: string, alphabet: string[]) => {
	for (let el of key) {
		if (!alphabet.find(elem => el === elem)) {
			return 'invalid key'
		}
		if (Array.from(new Set(key.split(''))).length != key.length) {
			return 'invalid key';
		}
		if (el === 'ь' || el === 'й') {
			return 'invalid key';
		}
	}
	const matrix = createTable(key, alphabet);
	console.log(matrix);
	const format_text = formatText(text);
	let result = '';
	for (let el of format_text) {
		result += decryptPair(el, matrix);
	}

 return result;
}