export const shifrVizhinerKey = (text: string, key: string, alphabet: string[]) => {
	
	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}
	
	if (!alphabet.find(alf_el => alf_el === key)) {
		return 'Введен некорректный ключ !';
	}
	
	const keyText = key + text;
	
	let result = '';

	for (let i = 0; i < text.length; i++) {
		const currentIndex = alphabet.findIndex(elem => elem == text[i]);
		const keyIndex = alphabet.findIndex(elem => elem == keyText[i]);
		result += alphabet[(currentIndex + keyIndex) % alphabet.length]
	}

	return result;
}

export const unShifrVizhinerKey = (text: string, key: string, alphabet: string[]) => {
	let currentKey = key;
	let result = '';

	for (let i = 0; i < text.length; i++) {
		const currentIndex = alphabet.findIndex(elem => elem == text[i]);
		const keyIndex = alphabet.findIndex(elem => elem == currentKey);
		result += alphabet[Math.abs(currentIndex - keyIndex + alphabet.length) % alphabet.length];
		currentKey = alphabet[Math.abs(currentIndex - keyIndex + alphabet.length) % alphabet.length];
	}

	return result;
}