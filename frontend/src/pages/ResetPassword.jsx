import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RiLockPasswordFill } from "react-icons/ri";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import toast from 'react-hot-toast';
import API from '../api/axios';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [passwordValidations, setPasswordValidations] = useState({
    hasLength: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false
  });

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordValidations({
      hasLength: val.length >= 8,
      hasUpper: /[A-Z]/.test(val),
      hasNumber: /\d/.test(val),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>\-_]/.test(val)
    });
  };

  const resetMutation = useMutation({
    mutationFn: async (passwordData) => {
      return await API.post(`/api/auth/reset-password/${token}`, passwordData);
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Password reset successful!");
      setIsSuccess(true);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordValidations.hasLength || !passwordValidations.hasUpper || !passwordValidations.hasNumber || !passwordValidations.hasSpecial) {
      toast.error("Password does not meet all requirements!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    resetMutation.mutate({ password });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="relative bg-white rounded shadow-lg w-full max-w-sm pt-12 pb-8 px-6 sm:px-10 mt-16 animate-in fade-in duration-300">
        
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-5 shadow-sm">
          <IoShieldCheckmarkSharp className="text-3xl text-blue-500" />
        </div>

        <h2 className="text-center text-slate-700 text-2xl font-bold tracking-wide mt-4 mb-2">
          Reset Password
        </h2>
        <p className="text-center text-slate-400 text-xs mb-8">
          Enter your new password below.
        </p>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            {/* Password Field */}
            <div className="relative mb-4">
              <div className="flex bg-[#dcdcdc] overflow-hidden rounded">
                <div className="bg-[#cccccc] px-4 py-3 flex items-center justify-center">
                  <RiLockPasswordFill className="text-gray-600" />
                </div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                  required
                />
              </div>

              {/* Password Validation Popup */}
              {isPasswordFocused && !(passwordValidations.hasLength && passwordValidations.hasUpper && passwordValidations.hasNumber && passwordValidations.hasSpecial) && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white p-3 rounded shadow-xl border border-slate-200 text-[11px] space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="font-bold text-slate-500 mb-0.5">Password Requirements:</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={passwordValidations.hasLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasUpper ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={passwordValidations.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={passwordValidations.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      At least one number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${passwordValidations.hasSpecial ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={passwordValidations.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      At least one special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className={`flex overflow-hidden rounded border transition-all ${confirmPassword && password !== confirmPassword ? 'bg-red-50 border-red-500 mb-2' : 'bg-[#dcdcdc] border-transparent mb-6'}`}>
              <div className={`px-4 py-3 flex items-center justify-center ${confirmPassword && password !== confirmPassword ? 'bg-red-200 text-red-600' : 'bg-[#cccccc] text-gray-600'}`}>
                <RiLockPasswordFill />
              </div>
              <input
                type="password"
                placeholder="Retype New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-transparent w-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400"
                required
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs font-semibold mb-4 -mt-1 pl-1">
                Passwords do not match
              </p>
            )}

            <button
              disabled={resetMutation.isPending || !passwordValidations.hasLength || !passwordValidations.hasUpper || !passwordValidations.hasNumber || !passwordValidations.hasSpecial}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 font-semibold tracking-widest text-sm hover:bg-blue-500 transition-colors rounded disabled:opacity-50"
            >
              {resetMutation.isPending ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 rounded p-4">
              Your password has been reset successfully.
            </div>
            <p className="text-xs text-slate-500">
              You can now log in using your new credentials.
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

export default ResetPassword;
