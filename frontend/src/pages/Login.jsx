import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Handshake, X } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-950 via-purple-950/20 to-gray-950 p-4 font-body">
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl">
        {/* Close / back button */}
        <button
          onClick={() => navigate('/')}
          aria-label="Go back to home"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 mb-6">
          <Handshake className="w-5 h-5 text-give" />
          <span className="font-logo font-bold text-lg text-ink">
            Quid<span className="text-give italic">Pro</span>Know
          </span>
        </div>
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to trade a skill today.</p>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2.5 bg-give hover:brightness-110 text-white rounded-lg text-sm font-semibold shadow-lg shadow-give/10 transition-all disabled:opacity-50" 
            disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="text-center mt-6 text-xs text-gray-500">
          New to QuidProKnow? <Link to="/register" className="text-give-light hover:underline font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
