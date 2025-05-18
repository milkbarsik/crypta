import styles from './cipherPage.module.css';
import { alphabets, ciphers, Tciphers } from '../../../crypt_methods/constants';
import { useLocation } from 'react-router-dom';
import { useCipher } from '../../store/cipherStore';
import MyInput from './input/input';
import { ChangeEvent, useEffect, useState } from 'react';
import useInput from '../../hooks/useInput';

const CipherPage = () => {
	const {setCipherType, cipherType} = useCipher();

	const cipherNick = useLocation().pathname.split('/').pop();
	const [cipher, setCipher] = useState<Tciphers | null>();

	const text = useInput('');
	const [keysValue, setKeysValue] = useState<Record<string, any>>({});
	const onChange = (e: ChangeEvent<HTMLInputElement>, key: string | number, type: string) => {
		if (type == 'number') {
			setKeysValue({...keysValue, [key]: e.target.value === '' ? '' : parseInt(e.target.value)});
		} else {
			setKeysValue({...keysValue, [key]: e.target.value});
		}
	}

	const [shifrText, setShifrText] = useState<string>('');
	const selectAlphabit = () => {
		if (!cipherType) {
			return alphabets.test_alphabet;
		} else {
			return alphabets.work_alphabet;
		}
	}
	
	useEffect(() => {
		ciphers.map(el => {
			if(el.nick == cipherNick) {
				setCipher(el);
				let keysNames: Record<string, string> = {};
				el.keys.forEach(key => {
					keysNames[key.key] = '';
				})
				setKeysValue({...keysValue, ...keysNames});
			}
		})
	}, [])

	return (
		<div className={styles.wrapper}>
			<h1 className={styles.name}>{cipher?.name}</h1>
			<main className={styles.main}>
				<div className={styles.changeType}>
					<h3>Выберите режим:</h3>
					<button
						onClick={() => setCipherType(false)}
						style={!cipherType
						?
							{boxShadow: '0 0 10px #646cff', color: '#646cff'}
						:
							{boxShadow: 'none', color: 'rgba(255, 255, 255, 0.87)'}
						}
					>test</button>
					<button
						onClick={() => setCipherType(true)}
						style={cipherType
						?
							{boxShadow: '0 0 10px #646cff', color: '#646cff'}
						:
							{boxShadow: 'none', color: 'rgba(255, 255, 255, 0.87)'}
						}
					>work</button>
				</div>
					
				<form className={styles.inputBlock}>
					<MyInput id='inputText' type='text' text='Введите текст' {...text}/>
						{cipher?.keys.map((el) => {
							return <MyInput
								key={el.key}
								text={el.key}
								type={el.type}
								id={`${cipher.nick}${el.key}`}
								value={keysValue[el.key] ?? ''}
								onChange={onChange}
							/>
						})}
					<div className={styles.buttons}>
						<button type='button' onClick={() => {
							setShifrText(cipher?.shifr(text.value, ...Object.values(keysValue), selectAlphabit()) ?? '')
						}}>
							<p>Зашифровать</p>
						</button>
						<button type='button' onClick={() => {
							setShifrText(cipher?.unShifr(text.value, ...Object.values(keysValue), selectAlphabit()) ?? '')
						}}>
							<p>Расшифровать</p>
						</button>
					</div>
				</form>
				{shifrText !== '' &&
					<div className={styles.result} onClick={() => navigator.clipboard.writeText(shifrText)}>
					<p>{shifrText}</p>
				</div>
				}
			</main>
		</div>
	)
}

export default CipherPage;