function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

function bytesToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

const SBOX: number[][] = [
  [1,  7,14,13, 0, 5, 8, 3, 4,15,10, 6, 9,12,11, 2],
  [8, 14, 2, 5, 6, 9, 1,12,15, 4,11, 0,13,10, 3, 7],
  [5, 13,15, 6, 9, 2,12,10,11, 7, 8, 1, 4, 3,14, 0],
  [7, 15, 5,10, 8, 1, 6,13, 0, 9, 3,14,11, 4, 2,12],
  [12, 8, 2, 1,13, 4,15, 6, 7, 0,10, 5, 3,14, 9,11],
  [11, 3, 5, 8, 2,15,10,13,14, 1, 7, 4,12, 9, 6, 0],
  [6,  8, 2, 3, 9,10, 5,12, 1,14, 4, 7,11,13, 0,15],
  [12, 4, 6, 2,10, 5,11, 9,14, 8,13, 7, 0, 3,15, 1],
];

/** Нелинейное t‑преобразование одного 32‑бит слова */
function tTransform(x: number): number {
  let r = 0 >>> 0;
  for (let i = 0; i < 8; i++) {
    const nib = (x >>> (4 * i)) & 0xF;
    const sub = SBOX[7 - i][nib];
    r |= (sub << (4 * i));
  }
  return r >>> 0;
}

/** g‑функция Магмы: ROL11( t((a + k) mod 2^32) ) */
function gFunction(a: number, k: number): number {
  const sum = (a + k) >>> 0;
  const t = tTransform(sum);
  return ((t << 11) | (t >>> (32 - 11))) >>> 0;
}

/** Один раунд Feistel‑сети */
function feistelRound(L: number, R: number, K: number): [number, number] {
  return [ R, (L ^ gFunction(R, K)) >>> 0 ];
}

/**
 * Раскладываем 256‑битный ключ (64 hex) на 8×32‑бит слов:
 * parts[0] = первые 8 hex (MS‑32), parts[7] = последние 8 hex (LS‑32).
 * Потом три раза parts[0..7] и один раз parts[7..0].
 */
function expandKey(keyHex: string): number[] {
  if (!/^[0-9A-Fa-f]{64}$/.test(keyHex)) {
    throw new Error("Key must be 64 hex characters");
  }
  const parts: number[] = [];
  for (let i = 0; i < 8; i++) {
    const w = keyHex.substr(i * 8, 8);
    parts.push(parseInt(w, 16) >>> 0);
  }
  const rk: number[] = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let w of parts) rk.push(w);
  }
  for (let j = 7; j >= 0; j--) {
    rk.push(parts[j]);
  }
  return rk;
}

/** Шифруем 64‑битный счетчик → возвращаем 64‑бит гамму */
function encryptBlock64(counter: bigint, rk: number[]): bigint {
  let L = Number((counter >> 32n) & 0xFFFFFFFFn);
  let R = Number(counter & 0xFFFFFFFFn);
  for (let i = 0; i < 32; i++) {
    [L, R] = feistelRound(L, R, rk[i]);
  }

  return (BigInt(R) << 32n) | BigInt(L);
}

function ctrEncryptBytes(
  data: Uint8Array,
  keyHex: string,
  ivHex: string
): Uint8Array {
  let ivFull: string;
  if (/^[0-9A-Fa-f]{8}$/.test(ivHex)) {
    ivFull = ivHex + "00000000";
  } else if (/^[0-9A-Fa-f]{16}$/.test(ivHex)) {
    ivFull = ivHex;
  } else {
    throw new Error("IV must be 8 or 16 hex characters");
  }

  const rk = expandKey(keyHex);
  let ctr = BigInt("0x" + ivFull);
  const out = new Uint8Array(data.length);

  for (let pos = 0; pos < data.length; pos += 8) {
    const len = Math.min(8, data.length - pos);
    const gamma = encryptBlock64(ctr, rk);
    const buf = new Uint8Array(8);
    new DataView(buf.buffer).setBigUint64(0, gamma, false);
    for (let i = 0; i < len; i++) {
      out[pos + i] = data[pos + i] ^ buf[i];
    }
    ctr = (ctr + 1n) & ((1n << 64n) - 1n);
  }
  return out;
}

export function encryptMagmaGamma(
  input: string,
  keyHex: string,
  ivHex: string
): string {
	try {
		const toks = input.trim().split(/\s+/);
		const isBlk = toks.every(t => /^[0-9A-Fa-f]{16}$/.test(t));

		if (isBlk) {
			// Блочный режим
			const ptBytes = hexToBytes(toks.join(""));
			const ctBytes = ctrEncryptBytes(ptBytes, keyHex, ivHex);
			const hx = bytesToHex(ctBytes);
			return hx.match(/.{1,16}/g)!.join(" ");
		} else {
			// Текстовый режим
			const ptBytes = new TextEncoder().encode(input);
			const ctBytes = ctrEncryptBytes(ptBytes, keyHex, ivHex);
			return bytesToHex(ctBytes);
		}
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}

}

export function decryptMagmaGamma(
  input: string,
  keyHex: string,
  ivHex: string
): string {
	try {
		const toks = input.trim().split(/\s+/);
		const isBlk = toks.every(t => /^[0-9A-Fa-f]{16}$/.test(t));

		if (isBlk) {
			const ctBytes = hexToBytes(toks.join(""));
			const ptBytes = ctrEncryptBytes(ctBytes, keyHex, ivHex);
			const hx = bytesToHex(ptBytes);
			return hx.match(/.{1,16}/g)!.join(" ");
		} else {
			const ctBytes = hexToBytes(input);
			const ptBytes = ctrEncryptBytes(ctBytes, keyHex, ivHex);
			return new TextDecoder().decode(ptBytes);
		}
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}

}


// 4e98110c97b7b93c 3e250d93d6e85d69 136d868807b2dbef 568eb680ab52a12d
// 92def06b3c130a59 db54c704f8189d20 4a98fb2e67a8024c 8912409b17b57e41
// ffeeddccbbaa99887766554433221100f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff
// 12345678