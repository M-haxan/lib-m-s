import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MdEmail } from "react-icons/md";
import { IoKeySharp } from "react-icons/io5";
import toast from 'react-hot-toast';
import API from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: async (emailData) => {
      return await API.post('/api/auth/forgot-password', emailData);
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Reset link sent!");
      setIsSent(true);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded shadow-lg w-full max-w-sm pt-12 pb-8 px-6 sm:px-10 mt-16 animate-in fade-in duration-300">
        
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 shadow-sm">
          <IoKeySharp className="text-3xl text-blue-500" />
        </div>

        <h2 className="text-center text-slate-700 text-2xl font-bold tracking-wide mt-4 mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-slate-400 text-xs mb-8">
          Enter your email to receive a password reset link.
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <div className="flex bg-[#dcdcdc] mb-6 overflow-hidden rounded">
              <div className="bg-[#cccccc] px-4 py-3 flex items-center justify-center">
                <MdEmail className="text-gray-600" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                required
              />
            </div>

            <button
              disabled={forgotMutation.isPending}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 font-semibold tracking-widest text-sm hover:bg-blue-500 transition-colors rounded disabled:opacity-50"
            >
              {forgotMutation.isPending ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 rounded p-4">
              A password reset link has been sent to <strong>{email}</strong>. It will expire in <strong>5 minutes</strong>.
            </div>
            <p className="text-xs text-slate-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/signin" className="text-blue-500 text-xs font-bold uppercase hover:underline transition-colors">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
