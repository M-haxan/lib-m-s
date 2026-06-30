import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IoPersonCircleSharp } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri"
import { FaGraduationCap } from "react-icons/fa";
import toast from 'react-hot-toast'

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', stream: '', year: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // TanStack Query Mutation
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      return await axios.post('http://localhost:3000/api/auth/register', data);
    },
    onSuccess: () => {
      alert('Account Created Successfully! Please Log In.');
      navigate('/signin');
      toast.success("user Successfully register")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100 flex items-center justify-center p-4">

<div className="relative bg-white rounded-[2rem] shadow-lg w-full max-w-sm pt-16 pb-8 px-6 sm:px-10 mt-16">

        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 ">
          <IoPersonCircleSharp className="fa-regular fa-user text-3xl text-gray-400" />
        </div>

        <h2 className="text-center text-gray-400 text-2xl font-light tracking-widest mb-4">
          New Signup
        </h2>
        <form onSubmit={handleSubmit}>

          <div className="flex bg-[#dcdcdc] mb-4 overflow-hidden">
            <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
              <IoPerson className="text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
              id='name'
              onChange={handleChange}
            />
          </div>
          <div className="flex bg-[#dcdcdc] mb-4 overflow-hidden">
            <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
              <MdEmail className="text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Email"
              className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
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


          <div className="flex bg-[#dcdcdc] mb-4 overflow-hidden">
            <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
              <FaGraduationCap className="text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Department"
              className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
              id='stream'
              onChange={handleChange}
            />
          </div>

           <div className="flex bg-[#dcdcdc] mb-4 overflow-hidden">
            <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
              <FaGraduationCap className="text-gray-600" />
            </div>
            <input
              type="number"
              placeholder="Year of Study"
              className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
              id='year'
              onChange={handleChange}
            />
          </div>


          <div className="w-full flex flex-col gap-2">
            <button
            
              type="submit"
              className="w-full bg-[#3D4A5D] text-white py-2 font-semibold tracking-widest text-sm hover:bg-gray-700 transition-colors"
            >

              SignUp
            </button>
           
            
          </div>
        </form>
        <div className="mt-4 text-center flex items-center justify-center gap-1">
          <p>Already have an account? </p>
          <Link to="/sign-in" className="text-[#555555] text-xs font-bold tracking-widest uppercase hover:text-black transition-colors">
            <span className="text-blue-500">Sign In</span>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default Signup;