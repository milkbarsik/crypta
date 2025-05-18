import { Link } from 'react-router-dom';
import styles from './header.module.css';

const Header = () => {
	return (
		<div className={styles.wrapper}>
			<Link to={'/'}>
				<button>Home</button>
			</Link>
			<p>Романихин Михаил 231-351</p>
		</div>
	)
}

export default Header;