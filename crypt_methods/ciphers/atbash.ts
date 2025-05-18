export const shifrAtbash = (text: string, alphabet: string[]) => {

	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}

	let result = '';
	for (let el of text) {
		const index = alphabet.findIndex(elem => elem === el);
		if (index != -1) {
			result += alphabet[alphabet.length -1 - index];
		}
	}

	return result;
}

export const unShifrAtbash = (text: string, alphabet: string[]) => {

	let result = '';
	for (let el of text) {
		const index = alphabet.findIndex(elem => elem === el);
		if (index != -1) {
			result += alphabet[alphabet.length -1 - index];
		}
	}

	return result;
}