import { useState } from 'react';
import axios from 'axios';

const ROLES = ['Admin', 'Service Coordinator', 'FSE', 'Client', 'QC Team'];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!role) {
      setError('Role is required');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/auth/signup', { name, email, password, role });
      setSuccess('Signup successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 to-teal-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-teal-600 text-center mb-6">Create an Account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <select
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={role}
            onChange={e => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
          {success && <div className="text-green-600 text-center font-medium mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
} 