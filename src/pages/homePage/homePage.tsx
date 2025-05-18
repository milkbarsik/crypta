import styles from './homePage.module.css';
import { ciphers } from '../../../crypt_methods/constants';
import Cipher from './cipherButton/cipher';

const HomePage = () => {
	return (
		<div className={styles.wrapper}>
			<h1 className={styles.header}>Выберите шифр:</h1>
			<main className={styles.main}>
				{
					ciphers.map((el) => {
						return <Cipher key={el.nick} name={el.name} nick={el.nick} />
					})
				}
			</main>
		</div>
	)
}

export default HomePage;