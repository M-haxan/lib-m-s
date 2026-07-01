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

const AVAILABLE_CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts', 'Biography'];

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', stream: '', year: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [preferences, setPreferences] = useState([]);

  const [passwordValidations, setPasswordValidations] = useState({
    hasLength: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === 'password') {
      setPasswordValidations({
        hasLength: value.length >= 8,
        hasUpper: /[A-Z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>\-_]/.test(value)
      });
    }
  };

  const handlePreferenceChange = (category) => {
    if (preferences.includes(category)) {
      setPreferences(preferences.filter(p => p !== category));
    } else {
      setPreferences([...preferences, category]);
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      return await axios.post('/api/auth/register', data);
    },
    onSuccess: () => {
      toast.success("User registered successfully. Verification email sent.");
      navigate('/signin');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration Failed!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordValidations.hasLength || !passwordValidations.hasUpper || !passwordValidations.hasNumber || !passwordValidations.hasSpecial) {
      toast.error("Password must meet all requirements!");
      return;
    }
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    registerMutation.mutate({ ...formData, preferences });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded shadow-lg w-full max-w-sm md:max-w-3xl pt-16 pb-8 px-6 sm:px-10 mt-16 transition-all duration-300">
        
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 shadow-sm">
          <IoPersonCircleSharp className="fa-regular fa-user text-3xl text-gray-400" />
        </div>

        <h2 className="text-center text-gray-400 text-2xl font-light tracking-widest mb-6">
          New Signup
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Form Fields */}
          <div className="space-y-4">
            <h3 className="text-slate-600 font-bold text-sm border-b pb-2">Account Details</h3>

            {/* 1. Username */}
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <IoPerson className="text-gray-600" />
              </div>
              <input
                type="text"
                placeholder="Username"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                id='name'
                onChange={handleChange}
                required
              />
            </div>

            {/* 2. Email */}
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <MdEmail className="text-gray-600" />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                id='email'
                onChange={handleChange}
                required
              />
            </div>

            {/* 3. Department */}
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <FaGraduationCap className="text-gray-600" />
              </div>
              <input
                type="text"
                placeholder="Department"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                id='stream'
                onChange={handleChange}
                required
              />
            </div>

            {/* 4. Year of Study */}
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <FaGraduationCap className="text-gray-600" />
              </div>
              <input
                type="number"
                placeholder="Year of Study"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                id='year'
                onChange={handleChange}
                required
              />
            </div>

            {/* 5. Password (with focus popup validation) */}
            <div className="relative">
              <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
                <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                  <RiLockPasswordFill className="text-gray-600" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                  id='password'
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
              </div>

              {/* Password Validation Popup */}
              {isPasswordFocused && !(passwordValidations.hasLength && passwordValidations.hasUpper && passwordValidations.hasNumber && passwordValidations.hasSpecial) && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white p-3 rounded shadow-xl border border-slate-200 text-[11px] space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="font-bold text-slate-500 mb-0.5">Password Requirements:</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasLength ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={passwordValidations.hasLength ? 'text-emerald-700 font-semibold' : 'text-red-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasUpper ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={passwordValidations.hasUpper ? 'text-emerald-700 font-semibold' : 'text-red-500'}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasNumber ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={passwordValidations.hasNumber ? 'text-emerald-700 font-semibold' : 'text-red-500'}>
                      At least one number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasSpecial ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={passwordValidations.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-red-500'}>
                      At least one special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Retype Password */}
            <div className={`flex overflow-hidden rounded border transition-all ${confirmPassword && formData.password !== confirmPassword ? 'bg-red-50 border-red-500 mb-2' : 'bg-[#dcdcdc] border-transparent mb-6'}`}>
              <div className={`px-4 py-2 flex items-center justify-center ${confirmPassword && formData.password !== confirmPassword ? 'bg-red-200 text-red-600' : 'bg-[#cccccc] text-gray-600'}`}>
                <RiLockPasswordFill />
              </div>
              <input
                type="password"
                placeholder="Retype Password"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {confirmPassword && formData.password !== confirmPassword && (
              <p className="text-red-500 text-xs font-semibold mb-4 -mt-1 pl-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Right Column: Preferences */}
          <div className="space-y-4">
            <h3 className="text-slate-600 font-bold text-sm border-b pb-2">Select Your Book Preferences</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose one or more categories that interest you to customize your catalog recommendations:
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {AVAILABLE_CATEGORIES.map(category => (
                <label key={category} className={`flex items-center space-x-2 p-2.5 rounded border cursor-pointer transition-all ${preferences.includes(category) ? 'bg-blue-50/50 border-blue-500 shadow-sm' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="checkbox"
                    checked={preferences.includes(category)}
                    onChange={() => handlePreferenceChange(category)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${preferences.includes(category) ? 'text-blue-600' : 'text-slate-600'}`}>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button Span across columns */}
          <div className="md:col-span-2 mt-4">
            <button
              disabled={registerMutation.isPending}
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 font-semibold tracking-widest text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 rounded shadow-md"
            >
              {registerMutation.isPending ? 'Signing up...' : 'SignUp'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center flex items-center justify-center gap-1 border-t pt-4">
          <p className="text-sm text-slate-500">Already have an account? </p>
          <Link to="/signin" className="text-[#555555] text-xs font-bold tracking-widest uppercase hover:text-black transition-colors">
            <span className="text-blue-500 hover:underline">Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;