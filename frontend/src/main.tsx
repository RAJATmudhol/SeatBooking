import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { SeatProvider } from "../src/context/Context.tsx";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
