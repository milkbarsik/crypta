const SBOX = [
  [1,7,14,13,0,5,8,3,4,15,10,6,9,12,11,2],
  [8,14,2,5,6,9,1,12,15,4,11,0,13,10,3,7],
  [5,13,15,6,9,2,12,10,11,7,8,1,4,3,14,0],
  [7,15,5,10,8,1,6,13,0,9,3,14,11,4,2,12],
  [12,8,2,1,13,4,15,6,7,0,10,5,3,14,9,11],
  [11,3,5,8,2,15,10,13,14,1,7,4,12,9,6,0],
  [6,8,2,3,9,10,5,12,1,14,4,7,11,13,0,15],
  [12,4,6,2,10,5,11,9,14,8,13,7,0,3,15,1]
];

function t(hex8: string) {
  hex8 = hex8.padStart(8, "0").toLowerCase();
  let out = "";
  for (let i = 0; i < 8; i++) {
    const d = parseInt(hex8[i], 16);
    out += SBOX[i][d].toString(16);
  }
  return out;
}

function rotl32(x: any, shift: any) {
  shift &= 31;
  return ((x << shift) | (x >>> (32 - shift))) >>> 0;
}
function g(k8: any, a8: any) {
  const k = parseInt(k8, 16) >>> 0;
  const a = parseInt(a8, 16) >>> 0;
  const sum = (k + a) >>> 0;
  const tval = parseInt(t(sum.toString(16).padStart(8, "0")), 16) >>> 0;
  return rotl32(tval, 11).toString(16).padStart(8, "0");
}


function feistelRound(a1: any, a0: any, key: any) {
  const gval = g(key, a0);
  const new0 = ((parseInt(a1, 16) ^ parseInt(gval, 16)) >>> 0)
               .toString(16).padStart(8, "0");
  return [a0, new0];
}


function splitKey(master: any) {
  const keys = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 64; i += 8) {
      keys.push(master.slice(i, i + 8));
    }
  }
  for (let i = 56; i >= 0; i -= 8) {
    keys.push(master.slice(i, i + 8));
  }
  return keys;
}

function validate(messageHex: any, keyHex: any) {
  if (!/^[0-9A-Fa-f]{16}$/.test(messageHex)) {
    throw new Error("Сообщение должно быть 16 hex‑символов");
  }
  if (!/^[0-9A-Fa-f]{64}$/.test(keyHex)) {
    throw new Error("Ключ должен быть 64 hex‑символа");
  }
}


function processBlock(messageHex: any, keys: any) {
  let a1 = messageHex.slice(0, 8).toLowerCase();
  let a0 = messageHex.slice(8, 16).toLowerCase();
  for (let i = 0; i < 32; i++) {
    [a1, a0] = feistelRound(a1, a0, keys[i]);
		console.log(a1, a0);
  }
  return a0 + a1;
}

export function encryptBlock(messageHex: any, keyHex: any) {
	try {
		validate(messageHex, keyHex);
		const keys = splitKey(keyHex);
		return processBlock(messageHex, keys);
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
  
}

export function decryptBlock(cipherHex: any, keyHex: any) {
	try {
		validate(cipherHex, keyHex);
		const keys = splitKey(keyHex).reverse();
		return processBlock(cipherHex, keys);
	} catch (e) {
		if (e instanceof Error) {
			return e.message;
		} else {
			return 'неизвестная ошибка';
		}
	}
}

// fedcba9876543210
// ffeeddccbbaa99887766554433221100f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff