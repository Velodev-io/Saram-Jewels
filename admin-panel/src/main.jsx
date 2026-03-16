import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider } from './context/AuthContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'sk_test_juiKgCJ9Z320tt6Mbq88zBFFewNMJwc7OF2SYZjRwG' // Fallback for testing if missing

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
