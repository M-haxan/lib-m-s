import axios from 'axios';


const API = axios.create({

  baseURL: import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === 'production' ? '' : 'http://127.0.0.1:3000'), 
  withCredentials: true, 
});

export default API;