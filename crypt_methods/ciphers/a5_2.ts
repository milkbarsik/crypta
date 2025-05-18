/** строка из 64 символов «0/1» → массив битов 0|1 */
function binStringToBits(keyBin: string): number[] {
  if (!/^[01]{64}$/.test(keyBin))
    throw new Error("Key must be 64‑char binary string");
  return Array.from(keyBin, c => (c === "1" ? 1 : 0));
}

/** majority(x,y,z) — «большее из трёх» */
const maj = (x: number, y: number, z: number) =>
  (x + y + z >= 2 ? 1 : 0);


class A52 {

  private r1 = new Array<number>(19).fill(0);
  private r2 = new Array<number>(22).fill(0);
  private r3 = new Array<number>(23).fill(0);
  private r4 = new Array<number>(17).fill(0);

  constructor(keyBits: number[], private frame: number) {
    //------------------ загрузка 64‑битного ключа -----------------
    for (let i = 0; i < 64; i++) this.clockAll(keyBits[i]);

    //---------------- загрузка 22 бит номера кадра ----------------
    for (let i = 0; i < 22; i++) this.clockAll((frame >> i) & 1);

    //---------------- «прогрев» 100 тактов ------------------------
    for (let i = 0; i < 100; i++) this.clockControlled();
  }

  /** получить следующий бит гаммы */
  public getBit(): number {
    this.clockControlled();

    return (
      this.r1[18] ^ this.r2[21] ^this.r3[22] ^
			maj(this.r1[12], this.r1[14], this.r1[15]) ^
			maj(this.r2[9], this.r2[13], this.r2[16]) ^
			maj(this.r3[13], this.r3[16], this.r3[18])
    ) & 1;
  }

  /** тактурить все четыре регистра одним входным битом
      (используется при загрузке KEY/FRAME) */
  private clockAll(inBit: number) {
    this.clockR1(inBit);
    this.clockR2(inBit);
    this.clockR3(inBit);
    this.clockR4(inBit);
  }

  /** штатный рабочий такт:  R4 ходит всегда,
      R1–R3 – только если соответствующий tap R4 совпал
      с majority( R4[3],R4[7],R4[10] )                    */
  private clockControlled() {
    const m = maj(this.r4[3], this.r4[7], this.r4[10]);

    this.clockR4(0);                        // R4 всегда
    if (this.r4[3]  === m) this.clockR2(0); // обратите внимание: taps
    if (this.r4[7]  === m) this.clockR3(0); // сопоставлены по GSM
    if (this.r4[10] === m) this.clockR1(0);
  }


  private clockR1(inBit: number) {
    const fb = this.r1[18] ^ this.r1[17] ^ this.r1[16] ^ this.r1[13];
    this.r1.pop(); this.r1.unshift(fb ^ inBit);
  }
  private clockR2(inBit: number) {
    const fb = this.r2[21] ^ this.r2[20];
    this.r2.pop(); this.r2.unshift(fb ^ inBit);
  }
  private clockR3(inBit: number) {
    const fb = this.r3[22] ^ this.r3[21] ^ this.r3[20] ^ this.r3[7];
    this.r3.pop(); this.r3.unshift(fb ^ inBit);
  }
  private clockR4(inBit: number) {
    const fb = this.r4[16] ^ this.r4[11];
    this.r4.pop(); this.r4.unshift(fb ^ inBit);
  }
}

/**
 * Шифрование A5/2 поточным способом
 *  (для текста над любым конечным алфавитом).
 */
export function encryptA52(
  plaintext: string,
  keyBin:    string,
  frame:     number,
  alphabet:  string[]
): string {
	try {
		const keyBits = binStringToBits(keyBin);
		const a52     = new A52(keyBits, frame);

		const M = alphabet.length;
		const s = Math.ceil(Math.log2(M));          // бит/символ

		const bitsOut: string[] = [];
		let out = "";

		for (const ch of plaintext) {
			const idx = alphabet.indexOf(ch);
			if (idx === -1) { out += ch; continue; }

			/* s‑битная гамма для этого символа */
			let g = 0;
			for (let b = 0; b < s; b++) g = (g << 1) | a52.getBit();
			bitsOut.push(g.toString(2).padStart(s, "0"));

			out += alphabet[(idx + g) % M];
		}

		console.log("encrypted bits:", bitsOut.join(" "));
		return out;
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
  
}

/**
 * Расшифрование A5/2‑гаммы (симметрично шифрованию)
 */
export function decryptA52(
  ciphertext: string,
  keyBin:     string,
  frame:      number,
  alphabet:   string[]
): string {
	try {
		const keyBits = binStringToBits(keyBin);
		const a52     = new A52(keyBits, frame);

		const M = alphabet.length;
		const s = Math.ceil(Math.log2(M));

		let out = "";
		for (const ch of ciphertext) {
			const idx = alphabet.indexOf(ch);
			if (idx === -1) { out += ch; continue; }

			let g = 0;
			for (let b = 0; b < s; b++) g = (g << 1) | a52.getBit();

			out += alphabet[(idx - g + M) % M];
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