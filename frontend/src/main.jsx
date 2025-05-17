// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AppContextProvider from './context/AppContext.jsx'
import SharedContextProvider from '@shared/context/SharedContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <SharedContextProvider>
  <AppContextProvider>
    <App />
  </AppContextProvider>
  </SharedContextProvider>
  </BrowserRouter>,
)
