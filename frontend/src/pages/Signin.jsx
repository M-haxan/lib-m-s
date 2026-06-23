import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/authSlice';

// Lazmi: Har request k sath cookies bhejne k liye
axios.defaults.withCredentials = true;

function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Redux se loading aur error state nikal rahay hain
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      dispatch(signInStart()); // Redux: Loading start
      return await axios.post('http://localhost:5000/api/auth/login', data);
    },
    onSuccess: (response) => {
      // Redux: User data save karo
      dispatch(signInSuccess(response.data)); 
      
      // Role k mutabiq dashboard par bhejo
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    },
    onError: (err) => {
      // Redux: Error save karo
      dispatch(signInFailure(err.response?.data?.message || 'Login Failed!'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Welcome Back 👋</h2>

        {/* Agar redux mein error hai toh yahan show hoga */}
        {error && <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required 
                 className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />
          
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                 className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />

          <button type="submit" disabled={loading} 
                  className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 flex justify-center">
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;