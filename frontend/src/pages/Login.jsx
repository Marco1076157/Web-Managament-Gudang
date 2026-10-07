import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { homeForRole, getUserRole } from '../routes/ProtectedRoute';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitLogin = async (creds) => {
    setLoading(true);
    setError('');
    try {
      const { user } = await login(creds);
      navigate(homeForRole(getUserRole(user)), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitLogin({ email, password });
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    submitLogin({ email: demoEmail, password: 'password' });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-slate-200/80">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-2 bg-blue-600 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xl shadow-md">
          {/* Ganti span M dengan img */}
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          MONDAY
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Hey 👋, Welcome Back!</h1>
        <p className="text-sm text-slate-500">Login to your account to continue!</p>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Your email address"
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            required
          />

          <Input
            label="Your password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={Lock}
            required
          />

          <div className="flex justify-end">
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3.5 rounded-full shadow-lg transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400 font-medium">Or try demo accounts:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('manager@monday.com')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-full text-xs transition-all border border-slate-300 cursor-pointer"
            >
              Manager Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('keeper@monday.com')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-full text-xs transition-all border border-slate-300 cursor-pointer"
            >
              Keeper Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          © 2026 Monday. All rights reserved.
        </p>
      </div>
    </div>
  );
}