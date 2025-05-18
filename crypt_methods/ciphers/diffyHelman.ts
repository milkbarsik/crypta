const validKeys = (n: bigint, a: bigint, Ka: bigint, Kb: bigint) => {
	if (!isPrime(n)) {
		throw new Error('n должно быть большим простым числом');
	}
	if (a <= 1 || a >= n) {
		throw new Error('a должно быть больше 1 и меньше n');
	}
	if (Ka <= 1 || Ka >= n) {
		throw new Error('Ka должно быть в интервале [2, n-1]');
	}
	if (Kb <= 1 || Ka >= n) {
		throw new Error('Kb должно быть в интервале [2, n-1]');
	}
}

const isPrime = (num: bigint) => {
    if (num < 2n) return false;
    for (let i = 2n; i * i <= num; i++) {
        if (num % i === 0n) return false;
    }
    return true;
};

export const diffyhelman = (text: string, n: string, a: string, Ka: string, Kb: string) => {
	try {
		const aB = BigInt(a), nB = BigInt(n), KaB = BigInt(Ka), KbB = BigInt(Kb);
		validKeys(nB, aB, KaB, KbB);
		console.log('Пользователи вычисляют открытые ключи Ya и Yb\n');
		const Ya = aB**KaB % nB;
		const Yb = aB**KbB % nB;
		console.log(`вычисленные открытые ключи Ya = ${Ya} Yb = ${Yb}\n`);
		console.log('* обмен ключами Ya и Yb между пользователями *\n');
		console.log('пользователь A вычисляет секретный ключ KA = Yb ^ Ka mod n');
		const KA = Yb**KaB % nB;
		console.log(`ключ KA = ${KA}`);
		if (KA === 1n) {
			throw new Error('поменяйте параметры. Ключ = 1')
		}
		console.log('пользователь B вычисляет секретный ключ KB = Ya ^ Kb mod n');
		const KB = Ya**KbB % nB;
		console.log(`ключ KB = ${KB}`);
		if (KB === 1n) {
			throw new Error('поменяйте параметры. Ключ = 1')
		}
		console.log(`обмен завершен. K = ${KB}`);
		return `KA = ${KA} KB = ${KB}`;
	} catch (e) {
		if (e instanceof Error) {
			return e.message
		} else {
			return 'unknown error';
		}
	}
}

export const empty2 = (...args: any) => {
	return 'тут ничего нет :<';
}