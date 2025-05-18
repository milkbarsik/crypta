const findPOfEvklid = (num1: bigint, num2: bigint) => {
	console.log(num2.toString());
	const ceil: bigint[] = [];
	while (num2 > 0) {
		ceil.push((num1 / num2) / 1n);
		let tmp = num2;
		num2 = num1 % num2;
		num1 = tmp;
	}
	let p = [0n, 1n];
	for (let i = 0; i < ceil.length; i++) {
		p.push(p[i + 1] * ceil[i] + p[i]);
	}
	return p.at(-2)! * (-1n)**(BigInt(ceil.length) - 1n);
}

const gcd = (num1: number, num2: number) => {
	if (num1 === num2) {
		return num1;
	}
	while (num2 > 0) {
		let tmp = num2;
		num2 = num1 % num2;
		num1 = tmp;
	}
	return num1;
}

const isPrime = (num: number) => {
	for (let i = 2; i < Math.ceil(Math.sqrt(num)); i++) {
		if (num % i === 0) {
			return false;
		}
	}
	return true;
}

const validKeys = (p: number, x: number, g: number, length: number) => {
	if (p < length) {
		throw new Error('p must be more then alphabet length')
	}
	if (!isPrime(p)) {
		throw new Error('p must be prime');
	}
	if (x <= 1 || x >= p) {
		throw new Error('x must be 1 < x < p');
	}
	if (g <= 1 || g >= p) {
		throw new Error('g must be 1 < g < p');
	}
}

const textParser = (text: string, alphabet: string[]) => {
	const newText: number[] = [];
	for (let el of text) {
		const index = alphabet.findIndex(elem => elem === el)
		if (index === -1) {
			throw new Error('invalid text')
		} else {
			newText.push(index + 1);
		}
	}
	return newText;
}

export const encryptElgamal = (text: string, p: number, x: number, g: number, alphabet: string[]) => {
	try {
		validKeys(p, x, g, alphabet.length);
		const y = Number(BigInt(g)**BigInt(x) % BigInt(p));
		const f = p - 1;
		const newText = textParser(text, alphabet);
		const result: number[][] = [];

		for (let i = 0; i < newText.length; i++) {
			let k = Math.floor(Math.random()*10000);
			while (gcd(k, f) !== 1) {
				k = Math.floor(Math.random()*10000);
			};
			const a = Number(BigInt(g)**BigInt(k) % BigInt(p));
			const b = Number((BigInt(y)**BigInt(k) * BigInt(newText[i])) % BigInt(p));
			result.push([a, b]);
		}

		return result.map(el => {
			return el.join(' ');
		}).join(' | ');

	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'unknown error';
		}
	}
}

export const decryptElgamal = (text: string, p: number, x: number, g: number, alphabet: string[]) => {
	const newText = text.split('|').map(el => {
		return(el.trim().split(' ')).map(el => parseInt(el));
	})
	const result: number[] = [];
	for (let i = 0; i < newText.length; i++) {

		let letter = findPOfEvklid(BigInt(p), BigInt(newText[i][0])**BigInt(x)) * BigInt(newText[i][1]);
		console.log(findPOfEvklid(BigInt(p), BigInt(newText[i][0])**BigInt(x)));
		while (letter < 0) {
			letter += BigInt(p);
		}
		letter %= BigInt(p);
		result.push(Number(letter));
	}
	return result.map(el => alphabet[el - 1]).join('');
}