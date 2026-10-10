import { BrowserRouter } from 'react-router'
import { AppRouter } from './AppRouter'
import './config'

export default function App() {
  return <BrowserRouter><AppRouter /></BrowserRouter>
}
