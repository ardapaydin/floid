import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import "./app.css"
if (process.env.NODE_ENV === "production") axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
else axios.defaults.baseURL = "/api"
axios.defaults.validateStatus = () => true;

createRoot(document.body).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient({
      defaultOptions: {}
    })}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
