import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,23,42,0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(99,102,241,0.1)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)