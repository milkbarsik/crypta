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

const isPrime = (num: number) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
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

const validKeys = (p: number, q: number, e: number, f: number, d: number, length: number) => {
	if (p * q <= length) {
		throw new Error('n must be > alphabet length')
	}
	if (!isPrime(p) || p <= 1) {
		throw new Error('p must be prime and p > 1');
	}
	if (!isPrime(q) || q <= 1) {
		throw new Error('q must be prime and q > 1');
	}
	if (d === e || d <= 1) {
		throw new Error('d cant be same as e and d > 1');
	}
	if (e >= f || e <= 1) {
		throw new Error('e must be < f and e must be > 1')
	}

	if (f % e === 0) {
		throw new Error('e and f must be cross prime');
	}

	if (gcd(e, f) !== 1) {
		throw new Error('e and f must be cross prime');
	}
}

const getKeyD = (f: number, e: number) => {
	let ceil: number[] = [];
	let delim = f;
	let delit = e;
	while (delit > 0) {
		ceil.push(Math.floor(delim / delit));
		let tmp = delit;
		delit = delim % delit;
		delim = tmp;
	}
	let p = [0, 1];
	for (let i = 0; i < ceil.length; i++) {
		p.push(p[i + 1] * ceil[i] + p[i]);
	}
	if ((ceil.length - 1) % 2 == 0) {
		return p.at(-2)! % f;
	} else {
		let tmp = p.at(-2)! * (-1);
		while (tmp <= 0) {
			tmp += f;
		}
		return tmp;
	}
}

export const encryptRsaPodpis = (text: string, p: number, q: number, e: number, alphabet: string[]) => {
	try {
		const f = (p - 1) * (q - 1);
		const d = getKeyD(f, e);
		validKeys(p, q, e, f, d, alphabet.length);
		const newText = textParser(text, alphabet);

		const result: number[] = [Number(BigInt(newText[0])**2n % (BigInt(p) * BigInt(q)))];
		for (let i = 1; i < newText.length; i++) {
			result.push(Number(BigInt(newText[i] + result[i - 1])**2n % (BigInt(p) * BigInt(q))));
		}
		const s = Number(BigInt(result.at(-1)!)**BigInt(d) % (BigInt(p) * BigInt(q)))
		return `хэш: ${result.at(-1)} подпись: ${s}`;
	} catch (e) {
		if (e instanceof Error) {
			return e.message
		} else {
			return 'unknown error';
		}
	}
}

export const decryptRsaPodpis = (text: string, p: number, q: number, e: number, alphabet: string[]) => {
	try {
		const f = (p - 1) * (q - 1);
		const d = getKeyD(f, e);
		validKeys(p, q, e, f, d, alphabet.length);
		const newText = parseInt(text.trim().split(' ').at(-1)!);
		return JSON.stringify(Number(BigInt(newText)**BigInt(e) % (BigInt(p) * BigInt(q))));
	} catch (e) {
		if (e instanceof Error) {
			return e.message
		} else {
			return 'unknown error';
		}
	}
}