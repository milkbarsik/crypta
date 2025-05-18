export const shifrPolibiy = (text: string, alphabet: string[]) => {

	for (let el of text) {
		if (!alphabet.find(alf_el => alf_el === el)) {
			return 'Введен некорректный текст !';
		}
	}

	const table = 6;

	let result = '';
	for (let el of text) {
		const index = alphabet.findIndex(elem => elem === el);
		if (index !== -1) {
			let row = Math.floor(index / table) + 1;
			let col = (index % table) + 1;
			result += `${row}${col} `;
		}
	}
	return result.trim();
}

export const unShifrPolibiy = (text: string, alphabit: string[]) => {
	const table = 6;

	const textParts = text.split(' ');
	let result = '';
	for (let el of textParts) {
		if (/^\d\d$/.test(el)) {
			const row = Number(el[0]);
			const col = Number(el[1]);
			const index = (row - 1) * table + (col - 1);
			result += index < alphabit.length ? alphabit[index] : '';
		} else {
			result += el;
		}
	}
	return result;
}