import { FC } from 'react';
import styles from './input.module.css';

type Tprops = {
	type: string;
	id: string;
	text: string;
	value: string | number;
	onChange: (...params: any) => any;
}

const MyInput: FC<Tprops> = ({type, id, text, value, onChange}) => {


	return (
		<div className={styles.wrapper}>
			<input className={styles.input}
				type={type}
				id={id}
				required
				autoComplete='off'
				value={value}
				onChange={(e) => onChange(e, text, type)}/>
			<label className={styles.label} htmlFor={id}>{text}</label>
		</div>
	)
}

export default MyInput;