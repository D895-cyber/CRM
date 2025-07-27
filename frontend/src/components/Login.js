import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-600 tracking-tight">Sign In to C.R.M</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="relative">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
          </div>
          <div className="relative">
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="form-checkbox" /> Remember Me
            </label>
            <button
              type="button"
              className="hover:underline text-teal-600 bg-transparent border-none p-0 m-0 cursor-pointer"
              onClick={() => {}}
            >
              Forgot Password?
            </button>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-teal-600 text-white py-2 rounded-lg shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-semibold">
            {isLoading ? 'Logging in...' : 'LOG IN'}
          </button>
          {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-600 hover:underline font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
