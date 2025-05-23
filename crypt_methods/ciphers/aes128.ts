const SBOX: number[] = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

const INV_SBOX: number[] = [
  0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
  0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
  0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
  0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
  0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
  0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
  0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
  0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
  0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
  0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
  0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
  0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
  0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
  0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
  0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
  0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
];

// массив Rcon
const RCON: number[] = [
  0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36
];

function hexToBytes(hex: string): Uint8Array {
  const len = hex.length >> 1;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(hex.substr(i*2, 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Galois‐field mul & xtime
function xtime(a: number): number {
  return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
}

function gfMul(a: number, b: number): number {
  let res = 0;
  let aa = a;
  let bb = b;
  for (let i = 0; i < 8; i++) {
    if (bb & 1) res ^= aa;
    aa = xtime(aa);
    bb >>>= 1;
  }
  return res;
}

// Основные шаги AES
function subBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] = SBOX[state[i]];
}

function invSubBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] = INV_SBOX[state[i]];
}

function shiftRows(state: Uint8Array): void {
  // строка r складывается из state[r + 4*c]
  for (let r = 1; r < 4; r++) {
    const tmp = [
      state[r + 4*0],
      state[r + 4*1],
      state[r + 4*2],
      state[r + 4*3]
    ];
    for (let c = 0; c < 4; c++) {
      state[r + 4*c] = tmp[(c + r) & 3];
    }
  }
}

function invShiftRows(state: Uint8Array): void {
  for (let r = 1; r < 4; r++) {
    const tmp = [
      state[r + 4*0],
      state[r + 4*1],
      state[r + 4*2],
      state[r + 4*3]
    ];
    for (let c = 0; c < 4; c++) {
      state[r + 4*c] = tmp[(c - r + 4) & 3];
    }
  }
}

function mixColumns(state: Uint8Array): void {
  for (let c = 0; c < 4; c++) {
    const i = 4*c;
    const a0 = state[i+0], a1 = state[i+1], a2 = state[i+2], a3 = state[i+3];
    state[i+0] = gfMul(a0,2) ^ gfMul(a1,3) ^ a2 ^ a3;
    state[i+1] = a0 ^ gfMul(a1,2) ^ gfMul(a2,3) ^ a3;
    state[i+2] = a0 ^ a1 ^ gfMul(a2,2) ^ gfMul(a3,3);
    state[i+3] = gfMul(a0,3) ^ a1 ^ a2 ^ gfMul(a3,2);
  }
}

function invMixColumns(state: Uint8Array): void {
  for (let c = 0; c < 4; c++) {
    const i = 4*c;
    const a0 = state[i+0], a1 = state[i+1], a2 = state[i+2], a3 = state[i+3];
    state[i+0] = gfMul(a0,0x0e) ^ gfMul(a1,0x0b) ^ gfMul(a2,0x0d) ^ gfMul(a3,0x09);
    state[i+1] = gfMul(a0,0x09) ^ gfMul(a1,0x0e) ^ gfMul(a2,0x0b) ^ gfMul(a3,0x0d);
    state[i+2] = gfMul(a0,0x0d) ^ gfMul(a1,0x09) ^ gfMul(a2,0x0e) ^ gfMul(a3,0x0b);
    state[i+3] = gfMul(a0,0x0b) ^ gfMul(a1,0x0d) ^ gfMul(a2,0x09) ^ gfMul(a3,0x0e);
  }
}

function addRoundKey(state: Uint8Array, roundKey: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] ^= roundKey[i];
}

// 5. Расширение ключа AES-128
function keyExpansion(key: Uint8Array): Uint8Array {
  const Nk = 4, Nb = 4, Nr = 10;
  const w = new Uint8Array(4 * Nb * (Nr + 1));
  w.set(key.slice(0, 4*Nk));
  let bytesGen = 4*Nk, rconIter = 1;
  const temp = new Uint8Array(4);

  while (bytesGen < 4*Nb*(Nr+1)) {
    temp.set(w.slice(bytesGen - 4, bytesGen));
    if (bytesGen % (4*Nk) === 0) {
      // RotWord
      const t = temp[0];
      temp[0]=temp[1]; temp[1]=temp[2]; temp[2]=temp[3]; temp[3]=t;
      // SubWord
      for (let i=0; i<4; i++) temp[i] = SBOX[temp[i]];
      // Rcon
      temp[0] ^= RCON[rconIter++];
    }
    for (let i = 0; i < 4; i++) {
      w[bytesGen] = w[bytesGen - 4*Nk] ^ temp[i];
      bytesGen++;
    }
  }
  return w;
}

// 6. Шифрование/расшифрование одного блока
function encryptBlock(block: Uint8Array, roundKeys: Uint8Array): Uint8Array {
  const state = new Uint8Array(block);
  const Nr = 10;
  addRoundKey(state, roundKeys.subarray(0,16));
  for (let round = 1; round < Nr; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, roundKeys.subarray(16*round, 16*(round+1)));
  }
  subBytes(state);
  shiftRows(state);
  addRoundKey(state, roundKeys.subarray(16*Nr, 16*(Nr+1)));
  return state;
}

function decryptBlock(block: Uint8Array, roundKeys: Uint8Array): Uint8Array {
  const state = new Uint8Array(block);
  const Nr = 10;
  addRoundKey(state, roundKeys.subarray(16*Nr, 16*(Nr+1)));
  invShiftRows(state);
  invSubBytes(state);
  for (let round = Nr - 1; round > 0; round--) {
    addRoundKey(state, roundKeys.subarray(16*round, 16*(round+1)));
    invMixColumns(state);
    invShiftRows(state);
    invSubBytes(state);
  }
  addRoundKey(state, roundKeys.subarray(0,16));
  return state;
}

function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToHex(bytes);
}

// hex → текст (UTF-8)
function hexToText(hex: string): string {
  const bytes = hexToBytes(hex);
  return new TextDecoder().decode(bytes);
}

// 7. Экспортируемые функции: шифрование/расшифрование hex-строк
export function encryptAES128(hexPlain: string, hexKey: string, ): string {
	try {
		const key = hexToBytes(hexKey);
		const pt  = hexToBytes(hexPlain);
		const rk  = keyExpansion(key);
		const ct  = encryptBlock(pt, rk);
		return bytesToHex(ct);
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

export function decryptAES128(hexCipher: string, hexKey: string, ): string {
	try {
		const key = hexToBytes(hexKey);
		const ct  = hexToBytes(hexCipher);
		const rk  = keyExpansion(key);
		const pt  = decryptBlock(ct, rk);
		return bytesToHex(pt);
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

export function encryptAES128Text(text: string, hexKey: string): string {
  const hex = textToHex(text);
  let result = [];
  for (let i = 0; i < hex.length; i += 32) { // 16 байт = 32 hex
    let block = hex.substr(i, 32);
    if (block.length < 32) block = block.padEnd(32, "0"); // padding
    result.push(encryptAES128(block, hexKey));
  }
  return result.join(" ");
}

/**
 * Расшифровывает AES-128 (ECB) hex-строку обратно в текст (UTF-8)
 */
export function decryptAES128Text(cipherHex: string, hexKey: string): string {
  const blocks = cipherHex.trim().split(/\s+/);
  let hex = blocks.map(b => decryptAES128(b, hexKey)).join("");
  // Удаляем возможные паддинговые нули в конце
  return hexToText(hex.replace(/00+$/, ""));
}

//   const Key    = 000102030405060708090a0b0c0d0e0f
//   const text    = 00112233445566778899aabbccddeeff
//   const res = 69c4e0d86a7b0430d8cdb78070b4c55a