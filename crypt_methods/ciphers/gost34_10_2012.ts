// Вспомогательные функции для работы с bigint
const mod = (a: bigint, m: bigint) => ((a % m) + m) % m;

const modInverse = (a: bigint, m: bigint): bigint => {
    a = ((a % m) + m) % m; // Приведение к положительному остатку
    let m0 = m, y = 0n, x = 1n;
    if (m === 1n) return 0n;
    while (a > 1n) {
        let q = a / m;
        let t = m;
        m = a % m;
        a = t;
        t = y;
        y = x - q * y;
        x = t;
    }
    return x < 0n ? x + m0 : x;
};

const isPrime = (num: bigint) => {
    if (num < 2n) return false;
    for (let i = 2n; i * i <= num; i++) {
        if (num % i === 0n) return false;
    }
    return true;
};

const textParser = (text: string, alphabet: string[]): bigint[] => {
    return Array.from(text).map(ch => {
        const idx = alphabet.indexOf(ch);
        if (idx === -1) throw new Error('invalid text');
        return BigInt(idx + 1);
    });
};

// Простая хеш-функция (для учебных целей)
const computeHash = (message: bigint[], p: bigint): bigint => {
    let hash = message[0] ** 2n % p;
    for (let i = 1; i < message.length; i++) {
        hash = (message[i] + hash) ** 2n % p;
    }
    return hash;
};

class Point {
    constructor(public readonly x: bigint, public readonly y: bigint) {}
    static readonly ZERO = new Point(0n, 0n);
}

class EllipticCurve {
    constructor(
        public readonly a: bigint,
        public readonly b: bigint,
        public readonly p: bigint
    ) {}

    add(P: Point, Q: Point): Point {
    if (P.x === 0n && P.y === 0n) return Q;
    if (Q.x === 0n && Q.y === 0n) return P;
    if (P.x === Q.x && (P.y + Q.y) % this.p === 0n) return Point.ZERO;

    let lambda: bigint;
    if (P.x !== Q.x) {
        // ВАЖНО: mod(Q.x - P.x, this.p)
        lambda = mod(
            mod(Q.y - P.y, this.p) * modInverse(mod(Q.x - P.x, this.p), this.p),
            this.p
        );
    } else {
        lambda = mod(
            (3n * P.x ** 2n + this.a) * modInverse(mod(2n * P.y, this.p), this.p),
            this.p
        );
    }

    const x = mod(lambda ** 2n - P.x - Q.x, this.p);
    const y = mod(lambda * (P.x - x) - P.y, this.p);

    return new Point(x, y);
}

    multiply(P: Point, k: bigint): Point {
        let result = Point.ZERO;
        let addend = P;
        while (k > 0n) {
            if (k & 1n) result = this.add(result, addend);
            addend = this.add(addend, addend);
            k >>= 1n;
        }
        return result;
    }
}

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

// Основные функции ГОСТ Р 34.10-2012
export const signGostR34102012 = (
    text: string,
		signature: string,
    a: string,
    b: string,
    p: string,
    q: string,
    P: string,
		Q: string,
    x: string,
    alphabet: string[]
): string => {
    try {
        // Преобразование параметров в bigint
        const aB = BigInt(a), bB = BigInt(b), pB = BigInt(p), qB = BigInt(q), xB = BigInt(x);
        if (!isPrime(pB)) throw new Error('p must be prime');
        if (!isPrime(qB)) throw new Error('q must be prime');
        if (xB <= 0n || xB >= qB) throw new Error('x must be in (0, q)');

        const [Px, Py] = P.split(' ').map(BigInt);
        const dotP = new Point(Px, Py);

        const curve = new EllipticCurve(aB, bB, pB);
        const dotQ = curve.multiply(dotP, xB);
				console.log(dotQ);

        // Преобразование текста и вычисление хеша
        const message = textParser(text, alphabet);
        const h = computeHash(message, pB);
        const e = h % qB === 0n ? 1n : h % qB;

        // Генерация подписи
        let r = 0n, s = 0n, k = 0n;
        do {
            do {
								do {
									k = randomBigInt(qB);
								} while(k === 0n)
                const C = curve.multiply(dotP, k);
                r = C.x % qB;
            } while (r === 0n);

            s = mod((k + r * xB) * modInverse(e, qB), qB);
        } while (s === 0n);
				console.log('k: ', k);
        return `${r.toString()} ${s.toString()}`;
    } catch (error) {
        return error instanceof Error ? error.message : 'Unknown error';
    }
};

export const verifyGostR34102012 = (
    text: string,
    signature: string,
    a: string,
    b: string,
    p: string,
    q: string,
    P: string,
    Q: string,
		x: string,
    alphabet: string[]
): string => {
    try {
        const aB = BigInt(a), bB = BigInt(b), pB = BigInt(p), qB = BigInt(q);
        if (!isPrime(pB)) throw new Error('p must be prime');
        if (!isPrime(qB)) throw new Error('q must be prime');
        const [Px, Py] = P.split(' ').map(BigInt);
        const [Qx, Qy] = Q.split(' ').map(BigInt);
        const dotP = new Point(Px, Py);
        const dotQ = new Point(Qx, Qy);
        const [r, s] = signature.split(' ').map(BigInt);

        if (r <= 0n || r >= qB || s <= 0n || s >= qB) {
            return 'Signature is invalid';
        }

        const curve = new EllipticCurve(aB, bB, pB);

        // Преобразование текста и вычисление хеша
        const message = textParser(text, alphabet);
        const h = computeHash(message, pB);
        const e = h % qB === 0n ? 1n : h % qB;

        const v = modInverse(e, qB);
        const z1 = mod(s * v, qB);
        const z2 = mod(-r * v, qB);

        const C1 = curve.multiply(dotP, z1);
        const C2 = curve.multiply(dotQ, z2);
        const C = curve.add(C1, C2);

        const R = C.x % qB;
				console.log(C);
        return R === r ? 'Signature is valid' : 'Signature is invalid';
    } catch (error) {
        return error instanceof Error ? error.message : 'Unknown error';
    }
};