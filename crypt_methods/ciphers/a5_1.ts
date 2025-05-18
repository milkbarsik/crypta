function binStringToBits(keyBin: string): number[] {
  if (!/^[01]{64}$/.test(keyBin)) {
    throw new Error("Key must be 64‑char binary string");
  }
  return Array.from(keyBin, b => (b === "1" ? 1 : 0));
}

/** majority(x,y,z) – «большее из трёх» */
const maj = (x: number, y: number, z: number) =>
  (x + y + z) >= 2 ? 1 : 0;

///////////////////////////////
// 2.  Класс‑генератор гаммы
///////////////////////////////

class A51 {
  /*   LFSR‑структуры (bit 0 – LSB, bit len-1 – MSB)   */
  private r1 = new Array<number>(19).fill(0);
  private r2 = new Array<number>(22).fill(0);
  private r3 = new Array<number>(23).fill(0);

  /**
   * @param keyBits  64 бит ключа в массиве 0|1
   * @param frame    номер кадра (0 ≤ frame < 2²²)
   *                  – для GSM это 22 младших бита T1|T2|T3
   */
  constructor(keyBits: number[], private frame: number) {
    /*  1. Загружаем ключ: 64 такта, все регистры тактируются  */
    for (let i = 0; i < 64; i++) {
      this.clockAll(keyBits[i]);
    }

    /*  2. Загружаем номер кадра (LSB → первый): 22 такта  */
    for (let i = 0; i < 22; i++) {
      this.clockAll( (frame >> i) & 1 );
    }

    /*  3. «Прогреваем» 100 тактов majority‑clocking */
    for (let i = 0; i < 100; i++) this.clockMaj();
  }

  /** получить следующий бит гаммы */
  public getBit(): number {
    this.clockMaj();
    // выход: XOR последних битов каждого регистра
    return (this.r1[18] ^ this.r2[21] ^ this.r3[22]) & 1;
  }


  /** тактируем все три LFSR одним входным битом */
  private clockAll(inBit: number) {
    this.clockR1(inBit);
    this.clockR2(inBit);
    this.clockR3(inBit);
  }

  /** majority‑clocking (stop‑and‑go) */
  private clockMaj() {
    const m = maj(this.r1[8], this.r2[10], this.r3[10]);
    if (this.r1[8] === m) this.clockR1(0);
    if (this.r2[10] === m) this.clockR2(0);
    if (this.r3[10] === m) this.clockR3(0);
  }

  /* каждый LFSR хранится «MSB – последний элемент» */

  private clockR1(inBit: number) {
    // x¹⁹ + x¹⁸ + x¹⁷ + x¹⁴ + 1
    const fb = this.r1[18] ^ this.r1[17] ^ this.r1[16] ^ this.r1[13];
    this.r1.pop();           // сдвиг ↑
    this.r1.unshift(fb ^ inBit);
  }
  private clockR2(inBit: number) {
    // x²² + x²¹ + 1
    const fb = this.r2[21] ^ this.r2[20];
    this.r2.pop();
    this.r2.unshift(fb ^ inBit);
  }
  private clockR3(inBit: number) {
    // x²³ + x²² + x²¹ + x⁸ + 1
    const fb = this.r3[22] ^ this.r3[21] ^ this.r3[20] ^ this.r3[7];
    this.r3.pop();
    this.r3.unshift(fb ^ inBit);
  }
}

/**
 * A5/1‑шифрование строки `plaintext` над `alphabet`.
 *
 * - `keyBin`  — 64 бит в текстовом виде «0101…»
 * - `frame`   — 22‑битный номер кадра
 */
export function encryptA51(
  plaintext: string,
  keyBin:    string,
  frame:     number,
  alphabet:  string[]
): string {
	try {
		const keyBits = binStringToBits(keyBin);
		const a51     = new A51(keyBits, frame);

		const M = alphabet.length;
		const s = Math.ceil(Math.log2(M));          // сколько бит/символ
		const bitsOut: string[] = [];

		let out = "";
		for (const ch of plaintext) {
			const idx = alphabet.indexOf(ch);
			if (idx === -1) { out += ch; continue; }

			/* собираем s бит гаммы */
			let gamma = 0;
			for (let b = 0; b < s; b++) gamma = (gamma << 1) | a51.getBit();
			bitsOut.push(gamma.toString(2).padStart(s, "0"));

			out += alphabet[(idx + gamma) % M];
		}

		console.log("encrypted bits:", bitsOut.join(" "));
		return out;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неивзестная ошибка';
		}
	}
  
}

/**
 * A5/1‑расшифрование
 */
export function decryptA51(
  ciphertext: string,
  keyBin:     string,
  frame:      number,
  alphabet:   string[]
): string {
	try {
		const keyBits = binStringToBits(keyBin);
		const a51     = new A51(keyBits, frame);

		const M = alphabet.length;
		const s = Math.ceil(Math.log2(M));

		let out = "";
		for (const ch of ciphertext) {
			const idx = alphabet.indexOf(ch);
			if (idx === -1) { out += ch; continue; }

			let gamma = 0;
			for (let b = 0; b < s; b++) gamma = (gamma << 1) | a51.getBit();

			out += alphabet[(idx - gamma + M) % M];
		}
		return out;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
  
}

// 1001011110010111100101111001011110010111100101111001011110010111