import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IoMailOpenOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import API from '../api/axios';

// Module-level cache to track initiated verifications in the page lifecycle (prevents double triggers in React Strict Mode)
const initiatedVerifications = new Set();

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If this token was already processed, skip hitting the API again
    if (initiatedVerifications.has(token)) {
      setStatus('success');
      setMessage('Email verified successfully!');
      return;
    }
    
    initiatedVerifications.add(token);

    const verifyUserEmail = async () => {
      try {
        const response = await API.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired or is invalid.');
      }
    };
    verifyUserEmail();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded shadow-lg w-full max-w-sm pt-12 pb-8 px-6 sm:px-10 mt-16 text-center animate-in fade-in duration-300">
        
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 shadow-sm">
          <IoMailOpenOutline className="text-3xl text-blue-500" />
        </div>

        <h2 className="text-slate-700 text-2xl font-bold tracking-wide mt-4 mb-6">
          Email Verification
        </h2>

        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-3xl" />
            <p className="text-sm text-slate-500 font-medium">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 rounded p-4 text-left">
              <p className="font-bold text-emerald-950 mb-1">Email Verified Successfully!</p>
              <p className="text-xs text-emerald-700 leading-relaxed">{message}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your registration request has been forwarded to the administrator. You will receive an email once your account has been approved.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
            <div className="bg-rose-50 text-rose-800 text-sm border border-rose-200 rounded p-4 text-left">
              <p className="font-bold text-rose-950 mb-1">Verification Failed</p>
              <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please try registering again or contact the library support team.
            </p>
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <Link to="/signin" className="text-blue-500 text-xs font-bold uppercase hover:underline transition-colors">
            Go to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default VerifyEmail;
