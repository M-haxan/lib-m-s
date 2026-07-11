import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/authSlice';
import { IoPersonCircleSharp } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri"
import toast from 'react-hot-toast'
import API from '../api/axios'



function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  const [loadings, setLoading] = useState(false)
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      dispatch(signInStart()); 
      
      return await API.post('/api/auth/login', data);
      
    },
    onSuccess: (response) => {
     
      dispatch(signInSuccess(response.data)); 
      toast.success("user loged in Successfuly");
      setLoading (false)
     
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    },
    onError: (err) => {
     
      dispatch(signInFailure(err.response?.data?.message || 'Login Failed!'));
      toast.error(error.response?.data?.message || 'login Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
    
          <div className="relative bg-white rounded shadow-lg w-full max-w-sm pt-10 pb-8 px-6 sm:px-10 mt-16">
    
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 ">
              <IoPersonCircleSharp className="fa-regular fa-user text-3xl text-gray-400" />
            </div>
    
            <h2 className="text-center text-gray-400 text-2xl font-light tracking-widest mb-8">
              Welcome Back 
            </h2>
            <form onSubmit={handleSubmit} >
    
             
              <div className="flex bg-[#dcdcdc] mb-4  overflow-hidden">
                <div className="bg-[#cccccc] px-4 py-3 flex items-center justify-center">
                  <MdEmail className="text-gray-600" />
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  className="bg-transparent w-full  px-4 py-2 font-bold text-sm text- outline-none placeholder-gray-400"
                  id='email'
                  onChange={handleChange}
                  
                />
              </div>
    
    
              <div className="flex bg-[#dcdcdc] mb-4 overflow-hidden">
                <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                  <RiLockPasswordFill className="text-gray-600" />
                </div>
                <input
                  type="password"
                  placeholder="***********"
                  className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                  id='password'
                  onChange={handleChange}
                  
                />
              </div>
    
    
             
    
    
              <div className="w-full flex flex-col gap-2">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 font-semibold tracking-widest text-sm hover:bg-blue-500 transition-colors"
                >
                  {loading ? 'Sign in ...' : 'Sign In'}
              
                </button>
              
              
              </div>
              
              <p className="text-gray-400 text-[13px] text-center mt-6">
                Don't have an account?{' '}
                <Link to='/sign-up' className="text-blue-500 hover:underline transition-colors">
                  Sign Up
                </Link>
              </p>
            </form>
          
          </div>
        </div>
  );
}

export default Signin;