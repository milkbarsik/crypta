export const shifrTriyemiy = (text: string, alphabet: string[]) => {

	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}

	let result = '';

	for (let i = 0; i < text.length; i++) {
		const elem = text[i];
		const index = alphabet.findIndex((el) => el == elem);
		result += alphabet[(i + index) % alphabet.length];
	}
	return result;
}

export const unShifrTritemiy = (text: string, alphabet: string[]) => {

	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}

	let result = '';

	for (let i = 0; i < text.length; i++) {
		const elem = text[i];
		const index = alphabet.findIndex((el) => el == elem);
		result += alphabet[Math.abs((index - i + alphabet.length)) % alphabet.length];
	}
	return result;
}