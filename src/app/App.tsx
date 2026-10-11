import { BrowserRouter } from 'react-router'
import { AppRouter } from './AppRouter'
import { AuthProvider } from '../features/auth/AuthProvider'
import './config'

export default function App() {
  return <BrowserRouter><AuthProvider><AppRouter /></AuthProvider></BrowserRouter>
}
