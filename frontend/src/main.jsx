import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
// TanStack Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios';
import { signInSuccess } from './redux/authSlice.js';
import toast from 'react-hot-toast';

// Setup global Axios defaults and interceptor to handle session expiration (401/403)
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Avoid intercepting the logout request itself to prevent infinite loop
      const isLogoutRequest = error.config && error.config.url && error.config.url.includes('/api/auth/logout');
      if (!isLogoutRequest) {
        store.dispatch(signInSuccess(null));
        toast.error('Session expired. Please log in again.');
        try {
          await axios.get('/api/auth/logout');
        } catch (logoutError) {
          console.error('Failed to clear cookie on logout', logoutError);
        }
      }
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* PersistGate aapki app ko tab tak rokay rakhta hai jab tak Redux me data wapas load na ho jaye */}
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)