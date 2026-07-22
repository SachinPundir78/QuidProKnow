import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const faqs = [
  {
    question: "Do my exchange partners need to create an account?",
    answer: "Yes, to ensure a safe and verified community, everyone needs an account to participate in a skill exchange. This allows us to track reputation and skill matching effectively."
  },
  {
    question: "Is it really free?",
    answer: "Yes! QuidProKnow is built on a peer-to-peer exchange model. Instead of paying with money, you pay by sharing your own knowledge with others."
  },
  {
    question: "How does it handle timezones?",
    answer: "Our built-in scheduling system automatically converts all session times to your local timezone. When you propose a time, your partner sees it in theirs."
  }
];

export default function LandingCTA() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();

  return (
    <>
      {/* FAQ Section */}
      <section className="py-24 md:py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div className="text-left">
            <h2 className="font-logo font-bold text-4xl md:text-5xl text-gray-900 dark:!text-white mb-6">
              Any questions?<br />We got you.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
              Everything you need to know about QuidProKnow. Can't find the answer you're looking for? Reach out to our team.
            </p>
            <a href="#contact" className="inline-flex items-center text-sm font-bold !text-black dark:!text-white hover:text-give transition-colors group">
              More FAQs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="space-y-2 mt-4 md:mt-0">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 dark:border-white/10 pb-2"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-4 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <span className="font-sach font-bold text-lg text-gray-900 dark:text-gray-100">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 text-center bg-transparent">
        <div className="max-w-4xl mx-auto">
          {user ? (
            <div className="bg-give-bg dark:bg-white/5 border border-transparent dark:border-white/10 rounded-[3rem] p-12 md:p-20 shadow-lg flex flex-col items-center">
              <h1 className="font-logo font-bold text-5xl md:text-7xl text-ink dark:text-white mb-6 leading-tight">
                Plan less.<br />Meet more.
              </h1>
              <p className="text-lg md:text-xl text-ink-soft dark:text-white/80 mb-10 max-w-2xl mx-auto">
                No sign-up walls. No credit card. Just share a link and let everyone paint their time.
              </p>
              <Button
                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-gradient-to-r from-[#f97316] to-[#8b5cf6] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 transition-all rounded-full"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h2 className="font-logo font-bold text-3xl md:text-4xl text-gray-900 dark:!text-white mb-4">
                Ready to trade your first skill?
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8">
                Join QuidProKnow free. No credit card required.
              </p>
              <div className="flex flex-col items-center justify-center">
                <Button
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-gradient-to-r from-[#f97316] to-[#8b5cf6] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 transition-all rounded-full"
                  onClick={() => navigate('/register')}>
                  Create Your Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <span onClick={() => navigate('/login')} className="text-give dark:text-give-light hover:underline cursor-pointer font-bold">
                    Log in
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
