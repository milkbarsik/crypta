/** hex → Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("Hex string must have even length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

/** Uint8Array → hex */
function bytesToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

const SBOX: number[][] = [
  [12,4,6,2,10,5,11,9,14,8,13,7, 0,3,15,1],
  [6,8,2,3,9,10,5,12,1,14, 4,7,11,13, 0,15],
  [11,3,5,8,2,15,10,13,14,1, 7,4,12, 9, 6,0],
  [12,8,2,1,13,4,15,6, 7,0,10,5, 3,14, 9,11],
  [7,15,5,10,8,1,6,13, 0,9, 3,14,11, 4, 2,12],
  [5,13,15,6,9,2,12,10,11,7, 8,1, 4, 3,14,0],
  [8,14,2,5,6,9,1,12,15,4,11,0,13,10, 3,7],
  [1,7,14,13,0,5,8, 3, 4,15,10,6, 9,12,11,2],
];

/** Нелинейное t-преобразование 32-бит слова */
function tTransform(x: number): number {
  let r = 0 >>> 0;
  for (let i = 0; i < 8; i++) {
    const nib = (x >>> (4 * i)) & 0xF;
    const sub = SBOX[i][nib];
    r |= (sub << (4 * i));
  }
  return r >>> 0;
}

/** g-функция Магмы: ROL11( t((a + k) mod 2^32) ) */
function gFunction(a: number, k: number): number {
  const sum = (a + k) >>> 0;
  const t   = tTransform(sum);
  return ((t << 11) | (t >>> (32 - 11))) >>> 0;
}

/** Один Feistel-раунд */
function feistelRound(l: number, r: number, k: number): [number, number] {
  return [ r, (l ^ gFunction(r, k)) >>> 0 ];
}

// Раскладываем 256-битный мастер-ключ
// в 32 раундовых слова (32×32-бит)
function expandKey(keyHex: string): number[] {
  if (!/^[0-9A-Fa-f]{64}$/.test(keyHex)) {
    throw new Error("invalid key");
  }
  // 1) распарсим первые 8 слов (8×8 hex)
  const parts: number[] = [];
  for (let i = 0; i < 8; i++) {
    const w = keyHex.substr(i * 8, 8);
    parts.push(Number.parseInt(w, 16) >>> 0);
  }
  // 2) расписание: K₁..K₈, трижды, затем K₈..K₁
  const rk: number[] = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const w of parts) rk.push(w);
  }
  for (let j = 7; j >= 0; j--) {
    rk.push(parts[j]);
  }
  return rk;
}

/** 
 * Шифруем 64-битный блок (16 hex) → 16 hex 
 */
function encryptBlock64(blockHex: string, rk: number[]): string {
  const blk = BigInt("0x" + blockHex.padStart(16, "0"));
  let L = Number((blk >> 32n) & 0xFFFFFFFFn);
  let R = Number( blk         & 0xFFFFFFFFn);
  for (let i = 0; i < 32; i++) {
    [L, R] = feistelRound(L, R, rk[i]);
  }
  const C = (BigInt(R) << 32n) | BigInt(L >>> 0);
  return C.toString(16).padStart(16, "0");
}

/** 
 * Дешифруем 64-битный блок в ECB-режиме 
 */
function decryptBlock64(blockHex: string, rk: number[]): string {
  // для дешифра переворачиваем расписание ключей
  const rev = [...rk].reverse();
  return encryptBlock64(blockHex, rev);
}

///////////////////////////////////////////////////////
// API: Magma ECB-режим (простая замена)             //
///////////////////////////////////////////////////////

function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToHex(bytes);
}

// hex → текст (UTF-8)
function hexToText(hex: string): string {
  const bytes = hexToBytes(hex);
  return new TextDecoder().decode(bytes);
}

export function encryptMagmaECB(input: string, keyHex: string): string {
	try {
		const blocks = input.trim().split(/\s+/);
		const rk     = expandKey(keyHex);
		const ct     = blocks.map(b => encryptBlock64(b, rk));
		return ct.join(" ");
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

/**
 * Расшифрует строку из 64-битных блоков hex в ECB-режиме.
 */
export function decryptMagmaECB(input: string, keyHex: string): string {
	try {
		const blocks = input.trim().split(/\s+/);
		const rk     = expandKey(keyHex);
		const pt     = blocks.map(b => decryptBlock64(b, rk));
		return pt.join(" ");
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

export function encryptMagmaECBText(text: string, keyHex: string): string {
  const hex = textToHex(text);
  let result = [];
  for (let i = 0; i < hex.length; i += 16) {
    let block = hex.substr(i, 16);
    if (block.length < 16) block = block.padEnd(16, "0"); // padding
    result.push(encryptMagmaECB(block, keyHex));
  }
  return result.join(" ");
}

/**
 * Расшифровывает hex-строку обратно в текст (ECB-режим)
 */
export function decryptMagmaECBText(cipherHex: string, keyHex: string): string {
  const blocks = cipherHex.trim().split(/\s+/);
  let hex = blocks.map(b => decryptMagmaECB(b, keyHex)).join("");
  // Удаляем возможные паддинговые нули в конце
  return hexToText(hex.replace(/00+$/, ""));
}

// 92def06b3c130a59 db54c704f8189d20 4a98fb2e67a8024c 8912409b17b57e41
// ffeeddccbbaa99887766554433221100f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff