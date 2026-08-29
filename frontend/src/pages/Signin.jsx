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

// Lazmi: Har request k sath cookies bhejne k liye
axios.defaults.withCredentials = true;

function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Redux se loading aur error state nikal rahay hain
  const [loadings, setLoading] = useState(false)
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      dispatch(signInStart()); // Redux: Loading start
      
      return await axios.post('/api/auth/login', data);
      
    },
    onSuccess: (response) => {
      // Redux: User data save karo
      dispatch(signInSuccess(response.data)); 
      toast.success("user loged in Successfuly");
      setLoading (false)
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
      toast.error(error.response?.data?.message || 'login Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
    
          <div className="relative bg-white rounded-[2rem] shadow-lg w-full max-w-sm pt-10 pb-8 px-6 sm:px-10 mt-16">
    
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
                  className="bg-transparent w-full  px-4 py-2 font-bold text-sm text-gray-700 outline-none placeholder-gray-400"
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
    
    
              <div className="flex justify-between items-center text-[11px] text-gray-400 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-2 accent-gray-500" /> Remember me
                </label>
                <a href="#" className="italic hover:text-gray-600 transition-colors">
                  Forgot Password?
                </a>
              </div>
    
    
              <div className="w-full flex flex-col gap-2">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#3D4A5D] text-white py-2 font-semibold tracking-widest text-sm hover:bg-gray-700 transition-colors"
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