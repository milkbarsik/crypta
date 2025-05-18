// ---------- Утилиты для работы с hex и байтами -------------
function onBytes(hex: string): string[] {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  hex = hex.toLowerCase().replace(/[^0-9a-f]/g, "");
  if (hex.length % 2 !== 0) throw new Error("Hex string must have even length");
  const res: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    res.push("0x" + hex.slice(i, i + 2));
  }
  return res;
}

// ---------- Умножение в поле GF(2)[x]/(x⁸ + x⁷ + x⁶ + x + 1) -------------
function multGalua(a: number, b: number): number {
  let res = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) res ^= a;
    let hi = a & 0x80;
    a = (a << 1) & 0xFF;
    if (hi) a ^= 0xC3; // x^8 + x^7 + x^6 + x + 1 = 0xC3
    b >>= 1;
  }
  return res;
}

// ---------- S-бокс и обратный S-бокс -------------
const S_TABLE = [
  252,238,221, 17,207,110, 49, 22,251,196,250,218, 35,197,  4, 77,
  233,119,240,219,147, 46,153,186, 23, 54,241,187, 20,205, 95,193,
  249, 24,101, 90,226, 92,239, 33,129, 28, 60, 66,139,  1,142, 79,
    5,132,  2,174,227,106,143,160,  6, 11,237,152,127,212,211, 31,
  235, 52, 44, 81,234,200, 72,171,242, 42,104,162,253, 58,206,204,
  181,112, 14, 86,  8, 12,118, 18,191,114, 19, 71,156,183, 93,135,
   21,161,150, 41, 16,123,154,199,243,145,120,111,157,158,178,177,
   50,117, 25, 61,255, 53,138,126,109, 84,198,128,195,189, 13, 87,
  223,245, 36,169, 62,168, 67,201,215,121,214,246,124, 34,185,  3,
  224, 15,236,222,122,148,176,188,220,232, 40, 80, 78, 51, 10, 74,
  167,151, 96,115, 30,  0, 98, 68, 26,184, 56,130,100,159, 38, 65,
  173, 69, 70,146, 39, 94, 85, 47,140,163,165,125,105,213,149, 59,
    7, 88,179, 64,134,172, 29,247, 48, 55,107,228,136,217,231,137,
  225, 27,131, 73, 76, 63,248,254,141, 83,170,144,202,216,133, 97,
   32,113,103,164, 45, 43,  9, 91,203,155, 37,208,190,229,108, 82,
   89,166,116,210,230,244,180,192,209,102,175,194, 57, 75, 99,182
];
const INV_S_TABLE: number[] = Array(256).fill(0);
for (let i = 0; i < 256; i++) {
  INV_S_TABLE[S_TABLE[i]] = i;
}

function S(stroka: string[]): string[] {
  return stroka.map(s => {
    const v = parseInt(s, 16);
    return "0x" + S_TABLE[v].toString(16).padStart(2, "0");
  });
}
function S_de(stroka: string[]): string[] {
  return stroka.map(s => {
    const v = parseInt(s, 16);
    return "0x" + INV_S_TABLE[v].toString(16).padStart(2, "0");
  });
}

// ---------- L-преобразование -------------
function L(stroka: string[]): string[] {
  const arr = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];
  let res = stroka.slice();
  for (let n = 0; n < 16; n++) {
    let x = parseInt(res[15], 16);
    for (let j = 0; j < 15; j++) {
      x ^= multGalua(parseInt(res[j], 16), arr[j]);
    }
    // Сдвиг вправо, вставка x в начало
    for (let j = 15; j > 0; j--) res[j] = res[j - 1];
    res[0] = "0x" + x.toString(16).padStart(2, "0");
  }
  return res;
}

// ---------- Развёртка ключа -------------
function splitKey(keyHex: string): [string, string] {
  if (keyHex.length !== 64) {
    throw new Error("Ключ должен быть 64 hex-символа (256 бит).");
  }
  return [keyHex.slice(0, 32), keyHex.slice(32)];
}

function formKey(keyParts: [string, string]): string[][] {
  const first = onBytes("0x" + keyParts[0]);
  const second = onBytes("0x" + keyParts[1]);

  const consts: string[][] = [];
  for (let i = 1; i <= 32; i++) {
    const c = Array(15).fill("0x00").concat(["0x" + i.toString(16).padStart(2, "0")]);
    consts.push(L(c));
  }

  let A = first;
  let B = second;
  const resultPairs: [string[], string[]][] = [];
  resultPairs.push([A.slice(), B.slice()]);

  let count = 0;
  for (let group = 0; group < 4; group++) {
    for (let k = 0; k < 8; k++) {
      // 1) X[A] ⊕ C[count]
      const t1: string[] = [];
      for (let j = 0; j < 16; j++) {
        const v = parseInt(A[j], 16) ^ parseInt(consts[count][j], 16);
        t1.push("0x" + v.toString(16).padStart(2, "0"));
      }
      // 2) S
      const t2 = S(t1);
      // 3) L
      const t3 = L(t2);
      // 4) ⊕ B
      const newA: string[] = [];
      for (let j = 0; j < 16; j++) {
        const v = parseInt(t3[j], 16) ^ parseInt(B[j], 16);
        newA.push("0x" + v.toString(16).padStart(2, "0"));
      }
      B = A;
      A = newA;
      count++;
    }
    resultPairs.push([A.slice(), B.slice()]);
  }

  // ГОСТ: K1=A0, K2=B0, K3=A1, K4=B1, ..., K9=A4, K10=B4
  const res: string[][] = [];
  for (let i = 0; i < 5; i++) {
    res.push(resultPairs[i][0]);
    res.push(resultPairs[i][1]);
  }
  return res.slice(0, 10); // только 10 ключей!
}

// ---------- Шифрование / Расшифрование одного блока -------------
export function kuznechikEncrypt(
  plainHex: string,
  keyHex: string
): string {
	try {
		if (plainHex.length !== 32) {
			throw new Error("Сообщение должно быть 32 hex-символа (128 бит).");
		}
		let state = onBytes("0x" + plainHex);
		const keys = formKey(splitKey(keyHex));
		// 9 полных раундов
		for (let i = 0; i < 9; i++) {
			// X
			state = state.map((b, j) => {
				const v = parseInt(b, 16) ^ parseInt(keys[i][j], 16);
				return "0x" + v.toString(16).padStart(2, "0");
			});
			// S
			state = S(state);
			// L
			state = L(state);
		}
		// последний X
		state = state.map((b, j) => {
			const v = parseInt(b, 16) ^ parseInt(keys[9][j], 16);
			return "0x" + v.toString(16).padStart(2, "0");
		});
		// собираем hex без "0x"
		return state.map(x => x.slice(2)).join("");
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

export function kuznechikDecrypt(
  cipherHex: string,
  keyHex: string
): string {
  try {
    if (cipherHex.length !== 32) {
      throw new Error("Шифртекст должен быть 32 hex-символа (128 бит).");
    }
    let state = onBytes("0x" + cipherHex);
    const keys = formKey(splitKey(keyHex));
    // первый X с K10
    state = state.map((b, j) => {
      const v = parseInt(b, 16) ^ parseInt(keys[9][j], 16);
      return "0x" + v.toString(16).padStart(2, "0");
    });
    // 9 обратных раундов
    for (let i = 0; i < 9; i++) {
      state = invL(state);
      state = S_de(state);
      const round = 8 - i; // ключи K9..K1
      state = state.map((b, j) => {
        const v = parseInt(b, 16) ^ parseInt(keys[round][j], 16);
        return "0x" + v.toString(16).padStart(2, "0");
      });
    }
    // УДАЛИТЬ финальный X с K1!
    // return state.map(x => x.slice(2)).join("");
    // Вместо этого:
    return state.map(x => x.slice(2)).join("");
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    } else {
      return 'неизвестная ошибка';
    }
  }
}

// Добавьте функцию обратного L-преобразования:
function invL(stroka: string[]): string[] {
    const arr = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];
    let res = stroka.slice();
    for (let n = 0; n < 16; n++) {
        let x = parseInt(res[0], 16);
        for (let j = 1; j < 16; j++) {
            x ^= multGalua(parseInt(res[j], 16), arr[j - 1]);
        }
        // Сдвиг влево, вставка x в конец
        for (let j = 0; j < 15; j++) res[j] = res[j + 1];
        res[15] = "0x" + x.toString(16).padStart(2, "0");
    }
    return res;
}

function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// hex → текст (UTF-8)
function hexToText(hex: string): string {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function pkcs7pad(hex: string, blockSize: number): string {
  // blockSize — в байтах!
  const padLen = blockSize - ((hex.length / 2) % blockSize);
  const padHex = padLen.toString(16).padStart(2, "0").repeat(padLen);
  return hex + padHex;
}

function pkcs7unpad(hex: string): string {
  if (hex.length < 2) return "";
  const padLen = parseInt(hex.slice(-2), 16);
  if (padLen === 0 || padLen > 16) return ""; // некорректный паддинг
  // Проверяем, что все паддинг-байты совпадают
  const pad = hex.slice(-padLen * 2);
  const padByte = padLen.toString(16).padStart(2, "0");
  if (pad !== padByte.repeat(padLen)) return ""; // некорректный паддинг
  return hex.slice(0, -padLen * 2);
}

/**
 * Шифрует текст (UTF-8) в Кузнечике (ECB, паддинг нулями)
 */
export function kuznechikEncryptText(text: string, keyHex: string): string {
  let hex = textToHex(text);
  hex = pkcs7pad(hex, 16); // 16 байт
  let result = [];
  for (let i = 0; i < hex.length; i += 32) {
    let block = hex.substr(i, 32);
    result.push(kuznechikEncrypt(block, keyHex));
  }
  return result.join(" ");
}

export function kuznechikDecryptText(cipherHex: string, keyHex: string): string {
    const blocks = cipherHex.trim().split(/\s+/);
    let hex = blocks.map(b => kuznechikDecrypt(b, keyHex)).join("");
    const unpadded = pkcs7unpad(hex);
    const text = hexToText(unpadded);
    return text;
}

// const key = 8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef
// const pt = "1122334455667700ffeeddccbbaa9988";
// const expectedCt = "7f679d90bebc24305a468d42b9d4edcd";