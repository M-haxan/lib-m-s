import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { signInSuccess } from '../redux/authSlice';
import { IoPersonCircleSharp, IoPerson } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa";
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    stream: currentUser?.stream || '',
    year: currentUser?.year || '',
    password: ''
  });

  const isStudent = currentUser?.role === 'student';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put('/api/users/profile', data, { withCredentials: true });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully');
      dispatch(signInSuccess(data.user));
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isStudent) return;
    
    // Only send non-empty fields
    const updatedData = {
      name: formData.name,
      email: formData.email,
      stream: formData.stream,
      year: formData.year
    };
    if (formData.password) {
      updatedData.password = formData.password;
    }
    
    updateProfileMutation.mutate(updatedData);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded shadow-lg w-full max-w-md pt-16 pb-8 px-6 sm:px-10 mt-16 border border-slate-100">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 shadow-sm border border-slate-50">
          <IoPersonCircleSharp className="text-4xl text-blue-600" />
        </div>

        <h2 className="text-center text-blue-600 text-2xl font-bold tracking-wider mb-2">
          My Profile
        </h2>
        <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-6">
          Role: {currentUser?.role || 'User'}
        </p>

        {!isStudent && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm text-center">
            Administrator profile details are managed by the database configuration and are read-only here.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <IoPerson className="text-gray-600" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isStudent}
                placeholder="Full Name"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400 disabled:opacity-70"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                <MdEmail className="text-gray-600" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isStudent}
                placeholder="Email Address"
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400 disabled:opacity-70"
                required
              />
            </div>
          </div>

          {/* Stream & Year (Only for Students) */}
          {isStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Stream / Dept</label>
                <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
                  <div className="bg-[#cccccc] px-3 py-2 flex items-center justify-center">
                    <FaGraduationCap className="text-gray-600" />
                  </div>
                  <input
                    type="text"
                    id="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    placeholder="e.g. CS"
                    className="bg-transparent w-full px-3 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Year of Study</label>
                <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
                  <div className="bg-[#cccccc] px-3 py-2 flex items-center justify-center">
                    <FaGraduationCap className="text-gray-600" />
                  </div>
                  <input
                    type="number"
                    id="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="Year"
                    min="1"
                    max="5"
                    className="bg-transparent w-full px-3 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                    required
                  />
                </div>
              </div>
            </div>
          )}
         

          {/* Password (Optional for Student) */}
          {isStudent && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">New Password (Leave blank to keep current)</label>
              <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
                <div className="bg-[#cccccc] px-4 py-2 flex items-center justify-center">
                  <RiLockPasswordFill className="text-gray-600" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {isStudent && (
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Updating Profile...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
