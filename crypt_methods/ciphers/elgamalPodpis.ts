const findPOfEvklid = (num1: bigint, num2: bigint) => {
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

const hash = (text: number[], p: number) => {
	const result: number[] = [Number(BigInt(text[0])**2n % BigInt(p))];
		for (let i = 1; i < text.length; i++) {
			result.push(Number(BigInt(text[i] + result[i - 1])**2n % BigInt(p)));
		}
	return result.at(-1)!;
}

export const encryptElgamalPodpis = (text: string, p: number, x: number, g: number, y: string, alphabet: string[]) => {
	try {
		validKeys(p, x, g, alphabet.length);
		const f = p - 1;
		const newText = textParser(text, alphabet);
		const m = hash(newText, p);

		let k = Math.floor(Math.random() * f);
			while (gcd(k, f) !== 1 || k <= 1 || k >= f) {
				k = Math.floor(Math.random() * f);
			};
		const a = Number(BigInt(g)**BigInt(k) % BigInt(p));
		
		const pOfEvklid = findPOfEvklid(BigInt(f), BigInt(k));
		let b = (-(BigInt(x) * BigInt(a) - BigInt(m)) * pOfEvklid);
		while (b < 0) {
			b += BigInt(f);
		}
		b %= BigInt(f);
		console.log(BigInt(g)**BigInt(x) % BigInt(p));
		return `${a} ${b}`;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'unknown error';
		}
	}
}

export const decryptElgamalPodpis = (text: string, p: number, x: number, g: number, yS: string, alphabet: string[]) => {
	const newText = textParser(text.split('|')[0], alphabet);
	const [a, b] = text.split('|')[1].split(' ').map(el => BigInt(parseInt(el)));
	const m = hash(newText, p);

	const y = BigInt(yS)
	const a1 = (y**a * a**b) % BigInt(p);
	const a2 = BigInt(g)**BigInt(m) % BigInt(p);

	return `${a1} = ${a2}`;
}