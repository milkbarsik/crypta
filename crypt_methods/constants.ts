import { encryptA51, decryptA51 } from "./ciphers/a5_1";
import { decryptA52, encryptA52 } from "./ciphers/a5_2";
import { decryptAES128Text, encryptAES128Text } from "./ciphers/aes128";
import { shifrAtbash, unShifrAtbash } from "./ciphers/atbash";
import { shifrCezar, unShifrCezar } from "./ciphers/cezar";
import { ecc1Encrypt, ecc2Decrypt } from "./ciphers/ecc";
import { decryptElgamal, encryptElgamal } from "./ciphers/elgamal";
import { decryptElgamalPodpis, encryptElgamalPodpis } from "./ciphers/elgamalPodpis";
import { decryptBlock, encryptBlock } from "./ciphers/feystel";
import { signGostR34102012, verifyGostR34102012 } from "./ciphers/gost34_10_2012";
import { signGostR341094, verifyGostR341094 } from "./ciphers/gost34_10_94";
import { emptyStribog, stribog256 } from "./ciphers/gost34_11";
import { shifrKordano, unShifrKordano } from "./ciphers/kordano";
import { kuznechikDecryptText, kuznechikEncryptText } from "./ciphers/kuznechik";
import { decryptMagmaText, encryptMagmaText } from "./ciphers/magma";
import { decryptMagmaECBText, encryptMagmaECBText } from "./ciphers/magma34";
import { decryptMagmaGamma, encryptMagmaGamma } from "./ciphers/magmaGamma";
import { shifrMatrix, unShifrMatrix } from "./ciphers/matrix";
import { shifrPlaypher, unShifrPlaypher } from "./ciphers/playpher";
import { shifrPolibiy, unShifrPolibiy } from "./ciphers/polibiy";
import { decryptRsa, encryptRsa } from "./ciphers/rsa";
import { decryptRsaPodpis, encryptRsaPodpis } from "./ciphers/RSApodpis";
import { shifrShennon, unShifrShennon } from "./ciphers/shennon";
import { shifrTriyemiy, unShifrTritemiy } from "./ciphers/tritemiy";
import { shifrVertical, unShifrVertical } from "./ciphers/vertical";
import { shifrVizhinerKey, unShifrVizhinerKey } from "./ciphers/vizhinerkey";
import { shifrVizhinerText, unShifrVizhinerText } from "./ciphers/vizhinertext";
import { diffyhelman, empty2 } from "./ciphers/diffyHelman";

export interface Ialphabets {
	work_alphabet: string[];
	test_alphabet: string[];
}

export type Tciphers = {
	name: string,
	nick: string;
	keys: {key: string, type: string}[] | [];
	shifr: (...params: any) => string;
	unShifr: (...params: any) => string;
}

export const alphabets: Ialphabets = {
	work_alphabet: [
		'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й',
		'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у',
		'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э',
		'ю', 'я', ' ', '.', ',', '-', '!', '?', ':', ';',
		'"', '(', ')', '1', '2', '3', '4', '5', '6', '7',
		'8', '9', '0'
	],
	
	test_alphabet: [
		'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й',
		'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у',
		'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э',
		'ю', 'я',
	]
}

export const ciphers:Tciphers[] = [
	{
		name: 'Шифр АТБАШ',
		nick: 'atbash',
		keys: [],
		shifr: shifrAtbash,
		unShifr: unShifrAtbash
	},
	{
		name: 'Шифр Полибия',
		nick: 'polibiy',
		keys: [],
		shifr: shifrPolibiy,
		unShifr: unShifrPolibiy
	},
	{
		name: 'Шифр Цезаря',
		nick: 'cezar',
		keys: [{key: 'key', type: 'number'}],
		shifr: shifrCezar,
		unShifr: unShifrCezar
	},
	{
		name: 'Шифр Тритемия',
		nick: 'tritemiy',
		keys: [],
		shifr: shifrTriyemiy,
		unShifr: unShifrTritemiy
	},
	{
		name: 'Шифр Вижинера с самоключом',
		nick: 'vizhinerkey',
		keys: [{key: 'key', type: 'text'}],
		shifr: shifrVizhinerKey,
		unShifr: unShifrVizhinerKey
	},
	{
		name: 'Шифр Вижинера шифртекстом',
		nick: 'vizhinertext',
		keys: [{key: 'key', type: 'text'}],
		shifr: shifrVizhinerText,
		unShifr: unShifrVizhinerText
	},
	{
		name: 'Магма',
		nick: 'magma',
		keys: [],
		shifr: encryptMagmaText,
		unShifr: decryptMagmaText
	},
	{
		name: 'Шифр Плейфера',
		nick: 'playpher',
		keys: [{key: 'key', type: 'text'}],
		shifr: shifrPlaypher,
		unShifr: unShifrPlaypher
	},
	{
		name: 'Матричный шифр',
		nick: 'matrix',
		keys: [{key: 'key', type: 'text'}],
		shifr: shifrMatrix,
		unShifr: unShifrMatrix
	},
	{
		name: 'Шифр вертикальной перестановки',
		nick: 'vertical',
		keys: [{key: 'key', type: 'text'}],
		shifr: shifrVertical,
		unShifr: unShifrVertical
	},
	{
		name: 'Решетка кардано',
		nick: 'kordano',
		keys: [],
		shifr: shifrKordano,
		unShifr: unShifrKordano
	},
	{
		name: 'Сеть Фейстеля',
		nick: 'feystel',
		keys: [{key: 'key', type: 'text'}],
		shifr: encryptBlock,
		unShifr: decryptBlock
	},
	{
		name: 'Одноразовый блокнот Шеннона',
		nick: 'shennon',
		keys: [{key: 'a', type: 'number'}, {key: 'c', type: 'number'}, {key: 'T0', type: 'number'}],
		shifr: shifrShennon,
		unShifr: unShifrShennon
	},
	{
		name: 'Гаммирование Магма',
		nick: 'magmaGamma',
		keys: [{key: 'key', type: 'text'}, {key: 'iv', type: 'text'}],
		shifr: encryptMagmaGamma,
		unShifr: decryptMagmaGamma
	},
	{
		name: 'А5/1',
		nick: 'A5_1',
		keys: [{key: 'key', type: 'text'}, {key: 'frame', type: 'number'}],
		shifr: encryptA51,
		unShifr: decryptA51
	},
	{
		name: 'А5/2',
		nick: 'A5_2',
		keys: [{key: 'key', type: 'text'}, {key: 'frame', type: 'number'}],
		shifr: encryptA52,
		unShifr: decryptA52
	},
	{
		name: 'МАГМА в режиме простой замены',
		nick: 'magma34',
		keys: [{key: 'key', type: 'text'}],
		shifr: encryptMagmaECBText,
		unShifr: decryptMagmaECBText
	},
	{
		name: 'AES-128',
		nick: 'AES128',
		keys: [{key: 'key', type: 'text'}],
		shifr: encryptAES128Text,
		unShifr: decryptAES128Text
	},
	{
		name: 'Кузнечик',
		nick: 'kuznechik',
		keys: [{key: 'key', type: 'text'}],
		shifr: kuznechikEncryptText,
		unShifr: kuznechikDecryptText
	},
	{
		name: 'RSA',
		nick: 'rsa',
		keys: [{key: 'p', type: 'number'}, {key: 'q', type: 'number'}, {key: 'e', type: 'number'}],
		shifr: encryptRsa,
		unShifr: decryptRsa
	},
	{
		name: 'Elgamal',
		nick: 'elgamal',
		keys: [{key: 'p', type: 'number'}, {key: 'x', type: 'number'}, {key: 'g', type: 'number'}],
		shifr: encryptElgamal,
		unShifr: decryptElgamal
	},
	{
		name: 'Elgamal-ECC',
		nick: 'elgamalEcc',
		keys: [{key: 'a', type: 'number'}, {key: 'b', type: 'number'}, {key: 'p', type: 'number'}, {key: 'Gpoint', type: 'text'}, {key: 'cb', type: 'number'}, {key: 'k', type: 'number'}],
		shifr: ecc1Encrypt,
		unShifr: ecc2Decrypt
	},
	{
		name: 'RSA подпись',
		nick: 'rsaPodpis',
		keys: [{key: 'p', type: 'number'}, {key: 'q', type: 'number'}, {key: 'e', type: 'number'}],
		shifr: encryptRsaPodpis,
		unShifr: decryptRsaPodpis
	},
	{
		name: 'Elgamal подпись',
		nick: 'elgamalPodpis',
		keys: [{key: 'p', type: 'number'}, {key: 'x', type: 'number'}, {key: 'g', type: 'number'}, {key: 'y', type: 'number'}],
		shifr: encryptElgamalPodpis,
		unShifr: decryptElgamalPodpis
	},
	{
    name: 'ГОСТ 34.10-94 ЦП',
    nick: 'gost341094',
    keys: [
        { key: 'p', type: 'number' },
        { key: 'q', type: 'number' },
        { key: 'a', type: 'number' },
        { key: 'x', type: 'number' },
    ],
    shifr: signGostR341094,
    unShifr: verifyGostR341094
	},
	{
    name: 'ГОСТ 34.10-2012 ЦП',
    nick: 'gost34102012',
    keys: [
				{key: 'signature', type: 'string'},
        { key: 'a', type: 'number' },
        { key: 'b', type: 'number' },
        { key: 'p', type: 'number' },
        { key: 'q', type: 'number' },
        { key: 'P', type: 'string' },
				{ key: 'Q', type: 'string' },
        { key: 'x', type: 'number' }
    ],
    shifr: signGostR34102012,
    unShifr: verifyGostR34102012
	},
	{
		name: 'ГОСТ 34.11-2012 хэш Стрибог',
		nick: 'stribog',
		keys: [],
		shifr: stribog256,
		unShifr: emptyStribog
	},
	{
    name: 'обмен ключами по Диффи-Хелману',
    nick: 'diffyHelman',
    keys: [
        { key: 'n', type: 'number' },
        { key: 'a', type: 'number' },
        { key: 'Ka', type: 'number' },
        { key: 'Kb', type: 'number' },
    ],
    shifr: diffyhelman,
    unShifr: empty2
	},
]