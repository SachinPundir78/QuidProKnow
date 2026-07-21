import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkillTagInput from '../components/SkillTagInput';
import { Handshake, X } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', bio: '', userType: 'LEARNER',
  });
  const [skillsWanted,  setSkillsWanted]  = useState([]);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = (name, type) => {
    if (type === 'WANT')  setSkillsWanted(prev => [...prev, name]);
    if (type === 'OFFER') setSkillsOffered(prev => [...prev, name]);
  };

  const handleRemove = (index, type) => {
    if (type === 'WANT')  setSkillsWanted(prev => prev.filter((_, i) => i !== index));
    if (type === 'OFFER') setSkillsOffered(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (skillsWanted.length === 0)  { setError('Add at least one skill you want to learn.'); return; }
    if (form.userType === 'BARTER_USER' && skillsOffered.length === 0) {
      setError('Barter users must add at least one skill they can teach.'); return;
    }
    setLoading(true);
    try {
      await register({ ...form, age: Number(form.age) || 0, skillsWanted, skillsOffered });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-950 via-purple-950/20 to-gray-950 p-4 font-body py-12">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl">
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
        <h1 className="text-2xl font-bold font-display text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6 font-medium">Trade what you know for what you want to learn.</p>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">How do you want to participate?</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {[['LEARNER','Learner','Start with 100 pts. Spend 25 pts per lesson.'],
                ['BARTER_USER','Barter user','Trade skill-for-skill. No points required.']].map(([val, title, desc]) => (
                <div key={val}
                  className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${
                    form.userType === val 
                      ? 'border-give bg-give-bg/30 ring-1 ring-give' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setForm(f => ({ ...f, userType: val }))}>
                  <strong className="block text-sm text-gray-800">{title}</strong>
                  <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-gray-600">Full name</label>
              <input id="name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="age" className="text-xs font-semibold text-gray-600">Age</label>
              <input id="age" type="number" min="0" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</label>
            <input id="email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</label>
            <input id="password" type="password" minLength={6} required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-xs font-semibold text-gray-600">Short bio (optional)</label>
            <textarea id="bio" rows={2} maxLength={500} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell others about yourself…"
              className="px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-gray-50" />
          </div>

          <SkillTagInput
            label="Skills you want to learn"
            skills={skillsWanted}
            onAdd={handleAdd}
            onRemove={handleRemove}
            type="WANT"
            placeholder="e.g. Guitar, Python, Spanish…"
          />

          {form.userType === 'BARTER_USER' && (
            <SkillTagInput
              label="Skills you can teach"
              skills={skillsOffered}
              onAdd={handleAdd}
              onRemove={handleRemove}
              type="OFFER"
              placeholder="e.g. Excel, Yoga, Drawing…"
            />
          )}

          <button 
            type="submit" 
            className="w-full py-2.5 bg-give hover:brightness-110 text-white rounded-lg text-sm font-semibold shadow-lg shadow-give/10 transition-all disabled:opacity-50 mt-2" 
            disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center mt-6 text-xs text-gray-500">
          Already have an account? <Link to="/login" className="text-give-light hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
