import axios from 'axios';


const API = axios.create({

  baseURL: import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3000'), 
  withCredentials: true, 
});

export default API;