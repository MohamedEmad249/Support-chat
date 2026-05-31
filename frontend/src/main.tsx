import ReactDOM from 'react-dom/client'
import App from './app/App'
// @ts-ignore: CSS side-effect import declaration
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)