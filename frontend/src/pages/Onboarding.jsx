import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Handshake, GraduationCap, ArrowRight, Loader2, BookOpen, PenTool } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Onboarding() {
  const { onboardUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: '',
    age: '',
    bio: '',
    skillsWanted: [],
    skillsOffered: []
  });

  const [wantInput, setWantInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already onboarded
  if (user?.onboarded) {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const addSkill = (type, input, setInput) => {
    if (!input.trim()) return;
    setFormData(prev => ({
      ...prev,
      [type]: [...new Set([...prev[type], input.trim()])]
    }));
    setInput('');
  };

  const removeSkill = (type, skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (formData.userType === 'BARTER_USER' && formData.skillsOffered.length === 0) {
      setError('Barter users must offer at least one skill.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      await onboardUser(formData);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete onboarding');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fff7ed] dark:bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-give/20 blur-[120px] animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-xl w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/60 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-give' : 'bg-gray-200 dark:bg-zinc-800'}`} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Step 1: User Type */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Welcome to QuidProKnow!</h1>
            <p className="text-gray-500 dark:text-zinc-400 mb-8">How would you like to participate in the community?</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setFormData(prev => ({ ...prev, userType: 'LEARNER' }))}
                className={`p-6 text-left rounded-2xl border-2 transition-all duration-300 ${formData.userType === 'LEARNER' ? 'border-give bg-orange-50 dark:bg-orange-950/20 shadow-lg shadow-orange-500/10 scale-[1.02]' : 'border-gray-100 dark:border-zinc-800 hover:border-give/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4 text-give">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Learner</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">I just want to learn new skills from others.</p>
              </button>

              <button
                onClick={() => setFormData(prev => ({ ...prev, userType: 'BARTER_USER' }))}
                className={`p-6 text-left rounded-2xl border-2 transition-all duration-300 ${formData.userType === 'BARTER_USER' ? 'border-give bg-orange-50 dark:bg-orange-950/20 shadow-lg shadow-orange-500/10 scale-[1.02]' : 'border-gray-100 dark:border-zinc-800 hover:border-give/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4 text-give">
                  <Handshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Barter</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">I want to teach my skills in exchange for learning new ones.</p>
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleNext} disabled={!formData.userType} className="w-full sm:w-auto font-semibold">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">A bit about yourself</h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-8">Help others know who they are connecting with.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Your Age</label>
                <input
                  type="number"
                  min="13" max="100"
                  value={formData.age}
                  placeholder="e.g. 25"
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : '' }))}
                  className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-give outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Short Bio</label>
                <textarea
                  rows="3"
                  placeholder="I am a software engineer looking to learn Spanish..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-give outline-none transition-all resize-none dark:text-white"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={handleBack} className="font-semibold">
                Back
              </Button>
              <Button onClick={handleNext} className="w-full sm:w-auto font-semibold">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Skills */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Your Skills</h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-8">What do you want to learn? What can you teach?</p>

            <div className="space-y-6">
              {/* Want Skills */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                  <BookOpen className="w-4 h-4 text-give" /> Skills you want to learn
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Spanish, React, Guitar"
                    value={wantInput}
                    onChange={(e) => setWantInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill('skillsWanted', wantInput, setWantInput)}
                    className="flex-1 p-3 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-give outline-none transition-all dark:text-white text-sm"
                  />
                  <Button variant="outline" onClick={() => addSkill('skillsWanted', wantInput, setWantInput)}>Add</Button>
                </div>
                {formData.skillsWanted.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skillsWanted.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-full text-sm flex items-center gap-1 font-medium">
                        {skill}
                        <button onClick={() => removeSkill('skillsWanted', skill)} className="text-gray-400 hover:text-red-500 ml-1">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Skills (Only for Barter) */}
              {formData.userType === 'BARTER_USER' && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-2">
                    <PenTool className="w-4 h-4 text-give" /> Skills you can teach
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. English, Math, Python"
                      value={offerInput}
                      onChange={(e) => setOfferInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill('skillsOffered', offerInput, setOfferInput)}
                      className="flex-1 p-3 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-give outline-none transition-all dark:text-white text-sm"
                    />
                    <Button variant="outline" onClick={() => addSkill('skillsOffered', offerInput, setOfferInput)}>Add</Button>
                  </div>
                  {formData.skillsOffered.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skillsOffered.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm flex items-center gap-1 font-medium border border-orange-200 dark:border-orange-800/50">
                          {skill}
                          <button onClick={() => removeSkill('skillsOffered', skill)} className="text-orange-400 hover:text-orange-600 ml-1">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={isSubmitting} className="font-semibold">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || (formData.userType === 'BARTER_USER' && formData.skillsOffered.length === 0)} className="w-full sm:w-auto font-semibold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Profile'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
