import { MockScenarioPicker } from '../features/mock/MockScenarioPicker'
import { BrowserRouter } from 'react-router'
import { MotionConfig } from 'motion/react'
import { AppRouter } from './AppRouter'
import { AuthProvider } from '../features/auth/AuthProvider'
import './config'

export default function App() {
  return <MotionConfig reducedMotion="user"><BrowserRouter><AuthProvider><MockScenarioPicker /><AppRouter /></AuthProvider></BrowserRouter></MotionConfig>
}
