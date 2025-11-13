import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import "./app.css"
import { getToken, isAuthenicated } from './utils/auth/user.ts'
if (process.env.NODE_ENV === "production") axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
else axios.defaults.baseURL = "/api"
if (isAuthenicated()) axios.defaults.headers.common.Authorization = "Bearer " + getToken()
axios.defaults.validateStatus = () => true;

createRoot(document.body).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false,
          retry: false,
          staleTime: 5 * 60 * 1000
        }
      }
    })}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
