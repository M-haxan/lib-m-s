import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', stream: '', year: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // TanStack Query Mutation
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      return await axios.post('http://localhost:5000/api/auth/register', data);
    },
    onSuccess: () => {
      alert('Account Created Successfully! Please Log In.');
      navigate('/login');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Registration Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account 📚</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required 
                 className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />
          
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required 
                 className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />
          
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                 className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />

          <select name="role" value={formData.role} onChange={handleChange} 
                  className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none">
            <option value="student">Student</option>
            <option value="admin">Administrator</option>
          </select>

          {formData.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="stream" placeholder="Stream (e.g. BSCS)" onChange={handleChange} required 
                     className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />
              <input type="number" name="year" placeholder="Year" onChange={handleChange} required 
                     className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none" />
            </div>
          )}

          <button type="submit" disabled={registerMutation.isPending} 
                  className="w-full rounded bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400">
            {registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;