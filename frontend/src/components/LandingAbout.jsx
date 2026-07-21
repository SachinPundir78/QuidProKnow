import { FaExchangeAlt, FaCalendarAlt, FaStar, FaRegBell, FaMagic } from 'react-icons/fa';
import { MdOutlineChat } from 'react-icons/md';

export default function LandingAbout() {
  return (
    <section id="about" className=" px-6 bg-transparent ">
      <div className="max-w-5xl mx-auto ">
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-give/50"></div>
            <span className="font-logo italic text-give text-2xl font-medium tracking-wide">
              About QuidProKnow
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-give/50"></div>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-gray-900 dark:text-white mb-4">
            <span className="dark:text-white">A new way to learn </span><br />
            <span className="text-want italic">by teaching.</span>
          </h2>
          <div className="w-[100%] flex items-center justify-center max-w-4xl mx-auto mt-4">
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed ">
              QuidProKnow is a peer-to-peer skill exchange platform that connects learners and mentors based on complementary skills. Create a profile, match with others, chat in real time, schedule learning sessions, share meeting links, and rate completed sessions. Evaluate your setup with an AI-powered profile analyzer to optimize your community matching potential.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FaExchangeAlt className="w-5 h-5 text-give group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-give/10 group-hover:bg-give",
              title: 'Skill Matching',
              desc: 'Offer what you know, request what you want. The platform surfaces compatible exchange partners automatically.'
            },
            {
              icon: <MdOutlineChat className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-indigo-600/10 group-hover:bg-indigo-600",
              title: 'Real-Time Chat',
              desc: 'Message your matches instantly with typing indicators, read receipts, and online presence — no email chains.'
            },
            {
              icon: <FaCalendarAlt className="w-5 h-5 text-want group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-want/10 group-hover:bg-want",
              title: 'Session Scheduling',
              desc: 'Book sessions with built-in calendar, meeting links, and reminders so nothing falls through the cracks.'
            },
            {
              icon: <FaMagic className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-violet-600/10 group-hover:bg-violet-600",
              title: 'AI Profile Analyzer',
              desc: 'Get a scored breakdown of your profile with Gemini-powered recommendations to boost your credibility.'
            },
            {
              icon: <FaStar className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-amber-500/10 group-hover:bg-amber-500",
              title: 'Ratings & Reviews',
              desc: 'Rate every session and build a verified reputation that makes future matches more trustworthy.'
            },
            {
              icon: <FaRegBell className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors duration-300" />,
              bgClass: "bg-emerald-600/10 group-hover:bg-emerald-600",
              title: 'Notifications',
              desc: 'Stay informed on requests, session reminders, and messages without having to check manually.'
            },
          ].map(({ icon, bgClass, title, desc }) => (
            <div key={title} className="group relative bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-[2rem] hover:shadow-xl hover:border-give/30 dark:hover:border-give/50 hover:-translate-y-1 overflow-hidden transition-all duration-300 z-10 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-300 ${bgClass}`}>
                  {icon}
                </div>
                <h3 className="font-logo text-lg font-bold text-gray-900 dark:!text-white group-hover:text-give transition-colors">{title}</h3>
              </div>
              <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
