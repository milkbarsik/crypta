export const shifrVizhinerText = (text: string, key: string, alphabet: string[]) => {

	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}
	
	if (!alphabet.find(alf_el => alf_el === key)) {
		return 'Введен некорректный ключ !';
	}

	let currentKey = key;
	let result = '';

	for (let i = 0; i < text.length; i++) {
		const currentIndex = alphabet.findIndex(elem => elem == text[i]);
		const keyIndex = alphabet.findIndex(elem => elem == currentKey);
		result += alphabet[(currentIndex + keyIndex) % alphabet.length];
		currentKey = alphabet[(currentIndex + keyIndex) % alphabet.length];
	}

	return result;
}

export const unShifrVizhinerText = (text: string, key: string, alphabet: string[]) => {
	let currentKey = key;
	let result = '';

	for (let i = 0; i < text.length; i++) {
		const currentIndex = alphabet.findIndex(elem => elem == text[i]);
		const keyIndex = alphabet.findIndex(elem => elem == currentKey);
		result += alphabet[Math.abs(currentIndex - keyIndex + alphabet.length) % alphabet.length];
		currentKey = text[i];
	}

	return result;
}