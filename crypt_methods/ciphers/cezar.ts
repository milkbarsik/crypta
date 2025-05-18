export const shifrCezar = (text: string, key: number, alphabit: string[]) => {
	console.log(text, key);
	if (key <=0 || key >= alphabit.length) {
		console.log(key);
		return 'Введен некорректный ключ !';
	}

	for (let el of text) {
		if (!alphabit.find(alf_el => alf_el == el)) {
			console.log(text, key);
			return 'Введен некорректный текст !';
		}
	}

	let result = '';
	for (let elem of text) {
		const index = alphabit.findIndex(el => el === elem);
		if(index != -1) {
			const newIndex = (index + key) % alphabit.length;
			result += alphabit[newIndex]
		}
	}

	return result;
}

export const unShifrCezar = (text: string, key: number, alphabit: string[]) => {

	if (key <=0 || key >= alphabit.length) {
		return 'Введен некорректный ключ !';
	}

	let result = '';
	for (let elem of text) {
		const index = alphabit.findIndex(el => el === elem);
		if(index != -1) {
			const newIndex = (index - key) % alphabit.length;
			result += alphabit[newIndex]
		}
	}

	return result;
}