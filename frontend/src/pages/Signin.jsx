import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/authSlice';
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaShieldAlt, FaUserGraduate, FaBolt } from "react-icons/fa";
import toast from 'react-hot-toast';
import API from '../api/axios';
import { DEMO_CREDENTIALS, ENABLE_DEMO_LOGIN } from '../config/demoCredentials';

function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { loading } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (!ENABLE_DEMO_LOGIN) return;
    const demo = searchParams.get('demo');
    if (demo && DEMO_CREDENTIALS[demo]) {
      setFormData({
        email: DEMO_CREDENTIALS[demo].email,
        password: DEMO_CREDENTIALS[demo].password
      });
      toast.success(`Loaded ${DEMO_CREDENTIALS[demo].label} credentials!`, {
        icon: '⚡',
        duration: 3000
      });
    }
  }, [searchParams]);

  const handleFillDemo = (role) => {
    if (DEMO_CREDENTIALS[role]) {
      setFormData({
        email: DEMO_CREDENTIALS[role].email,
        password: DEMO_CREDENTIALS[role].password
      });
      toast.success(`${DEMO_CREDENTIALS[role].label} credentials filled!`, {
        icon: '🔑'
      });
    }
  };

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
      toast.success("User logged in successfully");

      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    },
    onError: (err) => {
      dispatch(signInFailure(err.response?.data?.message || 'Login Failed!'));
      toast.error(err.response?.data?.message || 'Login Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm pt-10 pb-8 px-6 sm:px-8 mt-16 border border-slate-100">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-md border border-slate-100">
          <IoPersonCircleSharp className="text-4xl text-blue-600" />
        </div>

        <h2 className="text-center text-gray-800 text-2xl font-bold tracking-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-xs text-slate-500 mb-6">
          Sign in to manage your library account
        </p>

        {/* 1-Click Quick Demo Test Buttons (Can be toggled in demoCredentials.js) */}
        {ENABLE_DEMO_LOGIN && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <FaBolt className="text-amber-500 text-xs" /> Quick Test / Demo:
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                1-Click
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <FaShieldAlt className="text-indigo-600 text-xs" /> Test Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('student')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <FaUserGraduate className="text-emerald-600 text-xs" /> Test Student
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex bg-[#f1f3f5] rounded-lg mb-3 overflow-hidden border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="bg-[#e9ecef] px-3.5 py-2.5 flex items-center justify-center">
              <MdEmail className="text-gray-500" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent w-full px-3 py-2 text-sm text-slate-800 outline-none placeholder-gray-400 font-medium"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex bg-[#f1f3f5] rounded-lg mb-3 overflow-hidden border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="bg-[#e9ecef] px-3.5 py-2.5 flex items-center justify-center">
              <RiLockPasswordFill className="text-gray-500" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent w-full px-3 py-2 text-sm text-slate-800 outline-none placeholder-gray-400"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium transition-colors">
              Forgot Password?
            </Link>
          </div>

          <div className="w-full flex flex-col gap-2">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold tracking-wide text-sm hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <p className="text-gray-500 text-[13px] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signin;