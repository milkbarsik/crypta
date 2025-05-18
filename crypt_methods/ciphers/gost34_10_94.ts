const textParser = (text: string, alphabet: string[]): bigint[] => {
    return Array.from(text).map(ch => {
        const idx = alphabet.indexOf(ch);
        if (idx === -1) throw new Error('invalid text');
        return BigInt(idx + 1);
    });
};

const computeHash = (message: bigint[], p: bigint): bigint => {
    let hash = message[0] ** 2n % p;
    for (let i = 1; i < message.length; i++) {
        hash = (message[i] + hash) ** 2n % p;
    }
    return hash;
};

const isPrime = (num: bigint) => {
    if (num < 2n) return false;
    for (let i = 2n; i * i <= num; i++) {
        if (num % i === 0n) return false;
    }
    return true;
};

function randomBigInt(max: bigint): bigint {
    // Генерирует случайное bigint в диапазоне [1, max-1]
    const length = max.toString(2).length;
    let rnd: bigint;
    do {
        const bytes = Math.ceil(length / 8);
        let hex = '';
        for (let i = 0; i < bytes; i++) {
            hex += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        }
        rnd = BigInt('0x' + hex);
    } while (rnd >= max || rnd === 0n);
    return rnd;
}

const validKeys = (p: bigint, q: bigint, a: bigint, x: bigint, length: number) => {
	if (p <= length) {
		throw new Error('p must be > alphabet length')
	}
	if (!isPrime(p) || p <= 1) {
		throw new Error('p must be prime and p > 1');
	}
	if (!isPrime(q) || q <= 2 || (p -1n) % q !== 0n) {
		throw new Error('q must be prime and q > 2 and p % q === 0');
	}
	if (a <= 1 || a >= (p -1n)) {
		throw new Error('a must be > 1 and < p-1');
	}
	if (a ** q % p !== 1n) {
		throw new Error('a must be a^q mod p == 1');
	}
	if (x >= q || x <= 1) {
		throw new Error('x must be < q and x > 1')
	}
}

const getA = (q: bigint, p: bigint) => {
	const result = [];
	for (let i = 2; i < p - 1n; i++) {
		if ((BigInt(i)**q) % p === 1n) {
			result.push(i);
		}
	}
	console.log(result.join(' '));
}

export const signGostR341094 = (text: string, p: string, q: string, a: string, x: string, alphabet: string[]) => {
	try {
		const pB = BigInt(p), qB = BigInt(q), aB = BigInt(a), xB = BigInt(x);
		getA(qB, pB);
		validKeys (pB, qB, aB, xB, text.length);
		const newText = textParser(text, alphabet);
		const h = computeHash(newText, pB) % qB == 0n ? 1n : computeHash(newText, pB);
		
		let kB = 0n;
		let r = 0n
		while (r === 0n || kB === 1n) {
			kB = randomBigInt(qB);
			r = (aB**kB % pB) % qB;
		}
		const s = (xB * r + kB * h) % qB;

		return `${r % 2n**256n} ${s % 2n**256n}`
	} catch (e) {
		if (e instanceof Error) {
			return e.message
		} else {
			return 'unknown error';
		}
	}
}

export const verifyGostR341094 = (text: string, p: string, q: string, a: string, x: string, alphabet: string[]) => {
	const pB = BigInt(p), qB = BigInt(q), aB = BigInt(a), xB = BigInt(x);
	validKeys (pB, qB, aB, xB, text.length);
	const newText = textParser(text.split('|')[0], alphabet);
	const [r, s] = text.split('|')[1].split(' ').map(el => BigInt(el));
	const yB = aB**xB % pB;

	const v = computeHash(newText, pB)**(qB - 2n) % qB;
	const z1 = (s * v) % qB;
	const z2 = ((qB - r) * v) % qB;
	const u = ((aB**z1 * yB**z2) % pB) % qB

	return `u = ${u} r = ${r}`;
}