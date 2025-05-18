const SBOX = [
  [1, 7, 14, 13, 0, 5, 8, 3, 4, 15, 10, 6, 9, 12, 11, 2],
  [8, 14, 2, 5, 6, 9, 1, 12, 15, 4, 11, 0, 13, 10, 3, 7],
  [5, 13, 15, 6, 9, 2, 12, 10, 11, 7, 8, 1, 4, 3, 14, 0],
  [7, 15, 5, 10, 8, 1, 6, 13, 0, 9, 3, 14, 11, 4, 2, 12],
  [12, 8, 2, 1, 13, 4, 15, 6, 7, 0, 10, 5, 3, 14, 9, 11],
  [11, 3, 5, 8, 2, 15, 10, 13, 14, 1, 7, 4, 12, 9, 6, 0],
  [6, 8, 2, 3, 9, 10, 5, 12, 1, 14, 4, 7, 11, 13, 0, 15],
  [12, 4, 6, 2, 10, 5, 11, 9, 14, 8, 13, 7, 0, 3, 15, 1]
];


function validateHexInput(hexStr: string) {
  return /^[0-9a-fA-F]+$/.test(hexStr);
}


function processBlock(block: string) {
  if (!block || block.length % 2 !== 0) {
    throw new Error("Invalid block length");
  }
  if (!validateHexInput(block)) {
    throw new Error("Invalid hex input");
  }
  const bytes = [];
  for (let i = 0; i < block.length; i += 2) {
    bytes.push(parseInt(block.substr(i, 2), 16));
  }
  return bytes;
}

function textToHex(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Преобразует hex-строку обратно в строку
function hexToText(hex: string): string {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

export function encryptMagma(hexStr: string) {
  if (hexStr.length !== 8) {
    return("Expected 8 hex characters (4 bytes)");
  }
  if (!validateHexInput(hexStr)) {
    return ("Invalid hex input");
  }
  const inBytes = processBlock(hexStr);
  const outData = new Array(4);
  for (let i = 0; i < 4; i++) {
    let firstNibble = (inBytes[i] & 0xF0) >> 4;
    let secondNibble = inBytes[i] & 0x0F;
    firstNibble = SBOX[i * 2][firstNibble];
    secondNibble = SBOX[i * 2 + 1][secondNibble];
    const combined = (firstNibble << 4) | secondNibble;
    outData[i] = combined.toString(16).padStart(2, '0');
  }
  return outData.join("");
}

export function decryptMagma(hexStr: string) {
  if (hexStr.length !== 8) {
    return ("Expected 8 hex characters (4 bytes)");
  }
  if (!validateHexInput(hexStr)) {
    return ("Invalid hex input");
  }

  const inData = [];
  for (let i = 0; i < 8; i += 2) {
    inData.push(hexStr.substr(i, 2));
  }
  const outData = new Array(4);
  for (let i = 0; i < 4; i++) {
    const firstChar = inData[i].charAt(0);
    const secondChar = inData[i].charAt(1);
    let firstVal = parseInt(firstChar, 16);
    let secondVal = parseInt(secondChar, 16);
    firstVal = SBOX[i * 2].indexOf(firstVal);
    secondVal = SBOX[i * 2 + 1].indexOf(secondVal);
    outData[i] = (firstVal << 4) | secondVal;
  }
  return outData.map(byte => byte.toString(16).padStart(2, '0')).join("");
}

export function encryptMagmaText(text: string): string {
  const hex = textToHex(text);
  let result = '';
  for (let i = 0; i < hex.length; i += 8) {
    let block = hex.substr(i, 8);
    if (block.length < 8) block = block.padEnd(8, '0'); // padding
    result += encryptMagma(block);
  }
  return result;
}

// Расшифровывает hex-строку обратно в текст
export function decryptMagmaText(cipherHex: string): string {
  let hex = '';
  for (let i = 0; i < cipherHex.length; i += 8) {
    hex += decryptMagma(cipherHex.substr(i, 8));
  }
  // Удаляем возможные паддинговые нули в конце
  return hexToText(hex).replace(/\0+$/, '');
}