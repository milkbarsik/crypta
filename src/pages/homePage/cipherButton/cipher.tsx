import { FC } from 'react'
import styles from './cipher.module.css'
import { Link } from 'react-router-dom';

type props = {
	name: string;
	nick: string;
}

const Cipher:FC<props> = ({name, nick}) => {


	return (
		<Link to={`cipher/${nick}`} className={styles.wrapper}>
			<button className={styles.button}>
				<p>{name}</p>
			</button>
		</Link>
	)
}

export default Cipher;