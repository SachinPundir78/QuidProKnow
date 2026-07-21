import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, Eye, Handshake, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';

export default function LandingHero({ scrollToAbout }) {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden py-24 md:py-24 ">
      <div className="text-center px-6 max-w-4xl mx-auto flex flex-col items-center">

        {/* Sleek Pill Badge matching the screenshot */}
        <div className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 bg-white/80 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Peer-to-Peer</span>
          <Zap className="w-3 h-3 text-give mx-1" />
          <span className="font-semibold text-gray-900 dark:text-white">Skill Exchange &rarr;</span>
        </div>

        {/* Clean, Sleek Typography matching the screenshot */}
        <h1 className="!font-logo font-bold text-6xl md:text-[5.5rem] lg:text-[6.5rem] tracking-tight leading-[1.05] mb-6 text-gray-900 dark:text-white">
          <span className="text-gray-900 dark:text-white">Quid</span><span className="text-give italic drop-shadow-[0_0_30px_rgba(122,30,52,0.15)]">Pro</span><span className="text-gray-900 dark:text-white">Know</span>
        </h1>
        <div className="py-3 mb-4">
          <p className="text-base md:text-lg text-gray-600 dark:text-white leading-relaxed max-w-4xl mx-auto mb-6">
            Unlock your potential by trading skills, not money. Connect with a global community of people who want to learn exactly what you know — and can teach you exactly what you need.
          </p>
          <p className="text-base md:text-lg text-gray-600 dark:text-white leading-relaxed max-w-4xl mx-auto mb-10">
            Whether you're looking to master a new language, dive into coding, or explore creative arts, our platform makes peer-to-peer learning accessible, engaging, and entirely free.
          </p>
        </div>

        {/* Card Buttons matching the screenshot */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl mb-14">
          <button
            className="flex-1 flex items-center gap-4 p-4 bg-white/90 dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm dark:hover:bg-white/5 transition-all text-left group"
            onClick={() => navigate('/register')}>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm mb-0.5 ">Start Exchanging</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Create your free account</div>
            </div>
          </button>

          <button
            className="flex-1 flex items-center gap-4 p-4 bg-white/90 dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm dark:hover:bg-white/5 transition-all text-left group"
            onClick={scrollToAbout}>
            <div className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">Learn More</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">See how it works</div>
            </div>
          </button>
        </div>

        {/* Bottom solid & outline buttons matching the screenshot */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <Button onClick={() => navigate('/register')} className="!rounded-lg px-6 py-2.5 bg-gray-900 !text-white dark:bg-white dark:!text-gray-900 shadow-sm border border-transparent hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold text-sm w-full sm:w-auto !shadow-none !bg-none">
            <Handshake className="w-4 h-4 mr-2" />
            Join 5,000+ Members
          </Button>
          <Button onClick={scrollToAbout} variant="outline" className="!rounded-lg px-6 py-2.5 bg-white text-gray-900 dark:bg-black dark:!text-white shadow-sm border border-orange-500 dark:border-orange-500 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold text-sm w-full sm:w-auto">
            <Shield className="w-4 h-4 mr-2" />
            Secure & Verified
          </Button>
        </div>

        {/* Bottom Logos / Core Values matching the screenshot footer */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 mt-8 pt-8 border-t border-gray-200/60 dark:border-gray-800/60 w-full max-w-3xl">
          {[
            { label: 'Share Skills Program', val: 'Exchange', icon: 'bg-indigo-500' },
            { label: 'Hundreds of active users', val: 'Collaborate', icon: 'bg-emerald-500' },
            { label: 'Growth templates & tools', val: 'Evolve', icon: 'bg-rose-500' }
          ].map(({ label, val, icon }) => (
            <div key={label} className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 rounded bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <span className={`w-2 h-2 ${icon} rounded-sm`}></span>
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{val}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
