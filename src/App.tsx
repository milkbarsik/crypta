import './App.css'
import Approuter from './components/appRouter/appRouter'
import Footer from './components/footer/footer'
import Header from './components/header/header'

function App() {

  return (
    <div className='appWrapper'>
			<Header />
			<div className='contentWrapper'>
				<div className='flexWrapper'>
					<Approuter />
					<Footer />
				</div>
			</div>
    </div>
  )
}

export default App