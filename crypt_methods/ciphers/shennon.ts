const textParser = (text: string, alphabet: string[]) => {
	const newText: number[] = [];
	for (let el of text) {
		const index = alphabet.findIndex(elem => elem === el)
		if (index === -1) {
			throw new Error('invalid text')
		} else {
			newText.push(index);
		}
	}

	return newText;
}

export const shifrShennon = (text: string, a: number, c: number, T0: number, alphabet: string[]) => {
	if (c % 2 === 0) {
		return 'invallid key c';
	}
	if (a % 4 !== 1 || a === 1) {
		return 'invalid key a';
	}
	if (T0 < 0) {
		return 'invalid T0';
	}
	try {
		const formatText = textParser(text, alphabet);
		const alphabetLength = alphabet.length;

		let result: string[] = [alphabet[(((a * T0 + c) % alphabetLength) + formatText[0]) % alphabetLength]];
		let tempResult = (a * T0 + c) % alphabetLength;

		for (let i = 1; i < formatText.length; i++) {
			tempResult = ((a * tempResult + c) % alphabetLength);
			const letter = ( tempResult + formatText[i]) % alphabetLength;
			result.push(alphabet[letter]);
		}

		return result.join('');

	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'unknown Error';
		}
	}
}

export const unShifrShennon = (text: string, a: number, c: number, T0: number, alphabet: string[]) => {
	if (c % 2 === 0) {
		return 'invallid key c';
	}
	if (a % 4 !== 1 || a === 1) {
		return 'invalid key a';
	}
	try {
		const formatText = textParser(text, alphabet);
		const alphabetLength = alphabet.length;

		let tempResult = (a * T0 + c) % alphabetLength;
		let result: string[] = [];
		if (tempResult < formatText[0]) {
			const letter = (formatText[0] - tempResult);
			result.push(alphabet[letter]);
		} else {
			const letter = (formatText[0] + alphabetLength - tempResult);
			result.push(alphabet[letter]);
		}
		

		for (let i = 1; i < formatText.length; i++) {
			tempResult = ((a * tempResult + c) % alphabetLength);
			if (tempResult <= formatText[i]) {
				const letter = (formatText[i] - tempResult);
				result.push(alphabet[letter]);
			} else {
				const letter = (formatText[i] + alphabetLength - tempResult);
				result.push(alphabet[letter]);
			}
		}

		return result.join('');

	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'unknown Error';
		}
	}
}