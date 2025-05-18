type Point = [number, number];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function mod(n: number, p: number): number {
  return ((n % p) + p) % p;
}

function modInv(n: number, p: number): number {
  n = mod(n, p);
  if (gcd(n, p) !== 1) throw new Error(`Нет обратного элемента для ${n} mod ${p}`);
  for (let x = 1; x < p; x++) if ((n * x) % p === 1) return x;
  throw new Error(`Обратный не найден для ${n} mod ${p}`);
}

function pointDouble([x, y]: Point, a: number, p: number): Point {
  if (y === 0) return [0, 0];
  const λ = mod((3 * x * x + a) * modInv(2 * y, p), p);
  const xr = mod(λ * λ - 2 * x, p);
  const yr = mod(λ * (x - xr) - y, p);
  return [xr, yr];
}

function pointAdd(P: Point, Q: Point, p: number, a: number): Point {
  const [x1, y1] = P, [x2, y2] = Q;
  if (x1 === 0 && y1 === 0) return [x2, y2];
  if (x2 === 0 && y2 === 0) return [x1, y1];
  if (x1 === x2 && mod(y1 + y2, p) === 0) return [0, 0];
  if (x1 === x2 && y1 === y2) return pointDouble(P, a, p);
  const λ = mod((y2 - y1) * modInv(x2 - x1, p), p);
  const xr = mod(λ * λ - x1 - x2, p);
  const yr = mod(λ * (x1 - xr) - y1, p);
  return [xr, yr];
}

function scalarMultiply(k: number, P: Point, a: number, p: number): Point {
  let R: Point = [0, 0], Q: Point = [...P];
  while (k > 0) {
    if (k & 1) R = pointAdd(R, Q, p, a);
    Q = pointDouble(Q, a, p);
    k >>= 1;
  }
  return R;
}

function isPointOnCurve([x, y]: Point, a: number, b: number, p: number): boolean {
  return mod(y * y, p) === mod(x * x * x + a * x + b, p);
}

export function eccEncrypt(
  m: number | string,
  a: number | string,
  b: number | string,
  p: number | string,
  Gx: number | string,
  Gy: number | string,
  Cb: number | string,
  k: number | string
): [number, number, number] {
  const params = [m, a, b, p, Gx, Gy, Cb, k].map(v => {
    const n = typeof v === "number" ? v : parseInt(v, 10);
    if (isNaN(n)) throw new Error('Параметры должны быть числами');
    return n;
  });
  const [mN, aN, bN, pN, GxN, GyN, CbN, kN] = params;
  const G: Point = [GxN, GyN];
  if (!isPointOnCurve(G, aN, bN, pN)) throw new Error(`G=(${GxN},${GyN}) не на кривой`);
  const [Rx, Ry] = scalarMultiply(kN, G, aN, pN);
  const Db = scalarMultiply(CbN, G, aN, pN);
  const [Px] = scalarMultiply(kN, Db, aN, pN);
  const e = mod(mN * Px, pN);
  return [Rx, Ry, e];
}

export function eccDecrypt(
  Rx: number | string,
  Ry: number | string,
  e: number | string,
  a: number | string,
  p: number | string,
  Cb: number | string
): number {
  const params = [Rx, Ry, e, a, p, Cb].map(v => {
    const n = typeof v === "number" ? v : parseInt(v, 10);
    if (isNaN(n)) throw new Error('Параметры должны быть числами');
    return n;
  });
  const [RxN, RyN, eN, aN, pN, CbN] = params;
  const [Qx] = scalarMultiply(CbN, [RxN, RyN], aN, pN);
  return mod(eN * modInv(Qx, pN), pN);
}

export function ecc1Encrypt(
  text: string,
  a: number | string,
  b: number | string,
  p: number | string,
  Gstr: string,           // "Gx Gy"
  Cb: number | string,
  k: number | string,
  alphabet: string,
): string {
	try {
		const [Gx, Gy] = Gstr.trim().split(/\s+/).map(Number);
		const outR: Point[] = [];
		const outE: number[] = [];
		for (let ch of text) {
			const idx = alphabet.indexOf(ch);
			if (idx < 0) throw new Error(`Недопустимый символ "${ch}"`);
			const m = idx;
			if (typeof p === "string" ? m >= parseInt(p, 10) : m >= p) throw new Error(`Код ${m} ≥ p=${p}`);
			const [Rx, Ry, e] = eccEncrypt(m, a, b, p, Gx, Gy, Cb, k);
			outR.push([Rx, Ry]);
			outE.push(e);
		}
		return `R = ${outR[0]} | text = ${outE.join(' ')}`;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
	
}

export function ecc2Decrypt(
  eStr: string,
  a: number | string,
  b: number | string,
  p: number | string,
  Gstr: string,
  Cb: number | string,
  k: number | string,
  alphabet: string,
): string {
	try {
		const [R, text] = eStr.split('|').map(el => el.trim());
		const [Rx, Ry] = R.split(' ')[2].split(',').map(Number);
		const RxInt = typeof Rx === "number" ? Rx : parseInt(Rx, 10);
		const RyInt = typeof Ry === "number" ? Ry : parseInt(Ry, 10);
		const aInt = typeof a === "number" ? a : parseInt(a, 10);
		const pInt = typeof p === "number" ? p : parseInt(p, 10);
		const CbInt = typeof Cb === "number" ? Cb : parseInt(Cb, 10);
		if ([RxInt, RyInt, aInt, pInt, CbInt].some(v => isNaN(v))) {
			throw new Error('Rx, Ry, a, p и Cb должны быть числами');
		}

		const eArr = text
			.split(' ')
			.slice(2)
			.map(s => {
				const n = parseInt(s.trim(), 10);
				if (isNaN(n)) throw new Error(`Некорректное e-значение "${s}"`);
				return n;
			});

		let res = '';
		for (const e of eArr) {
			const m = eccDecrypt(RxInt, RyInt, e, aInt, pInt, CbInt);
			if (m < 0 || m >= alphabet.length) {
				throw new Error(`Восстановленный код ${m} вне диапазона`);
			}
			res += alphabet[m];
		}
		return res;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
	
}