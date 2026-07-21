import { FaPen, FaLink, FaVideo } from 'react-icons/fa';

export default function LandingHowItWorks() {
  return (
    <section className="py-24 md:py-20 px-6 bg-transparent">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-give/50"></div>
          <span className="font-logo italic text-give text-2xl font-bold tracking-wide">
            How It Works
          </span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-give/50"></div>
        </div>
        <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 dark:!text-white ">
          Three steps to your first exchange
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {[
            {
              num: '01',
              title: 'Build your profile',
              desc: 'List what you can teach and what you want to learn. Add GitHub, LinkedIn, and projects.',
              pill: 'Setup',
              icon: <FaPen className="w-4 h-4" />,
              bgClass: 'bg-fuchsia-100 dark:bg-[#2a1336]/60 dark:border-[#4d2363]/50',
              pillBg: 'bg-yellow-200/80 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200',
              numColor: 'text-fuchsia-200/80 dark:text-fuchsia-800/60',
              iconBg: 'bg-black/5 dark:bg-black/40',
              iconColor: 'text-gray-800 dark:text-fuchsia-300',
              titleColor: 'text-gray-900 dark:!text-fuchsia-50',
              descColor: 'text-gray-700 dark:!text-fuchsia-200/70',
            },
            {
              num: '02',
              title: 'Find your match',
              desc: 'Browse users whose skills complement yours. Send a session request in one click.',
              pill: 'Discover',
              icon: <FaLink className="w-4 h-4" />,
              bgClass: 'bg-sky-100 dark:bg-[#0c2338]/60 dark:border-[#1a4b73]/50',
              pillBg: 'bg-green-200/80 text-green-900 dark:bg-emerald-500/20 dark:text-emerald-200',
              numColor: 'text-sky-200/80 dark:text-sky-800/60',
              iconBg: 'bg-black/5 dark:bg-black/40',
              iconColor: 'text-gray-800 dark:text-sky-300',
              titleColor: 'text-gray-900 dark:!text-sky-50',
              descColor: 'text-gray-700 dark:!text-sky-200/70',
            },
            {
              num: '03',
              title: 'Exchange & grow',
              desc: 'Schedule a session, meet on video, rate each other. Your reputation builds with every exchange.',
              pill: 'Connect',
              icon: <FaVideo className="w-4 h-4" />,
              bgClass: 'bg-amber-100 dark:bg-[#36230f]/60 dark:border-[#6b451c]/50',
              pillBg: 'bg-purple-200/80 text-purple-900 dark:bg-purple-500/20 dark:text-purple-200',
              numColor: 'text-amber-200/80 dark:text-amber-800/60',
              iconBg: 'bg-black/5 dark:bg-black/40',
              iconColor: 'text-gray-800 dark:text-amber-300',
              titleColor: 'text-gray-900 dark:!text-amber-50',
              descColor: 'text-gray-700 dark:!text-amber-200/70',
            },
          ].map(({ num, title, desc, pill, icon, bgClass, pillBg, numColor, iconBg, iconColor, titleColor, descColor }) => (
            <div key={num} className={`text-left ${bgClass} p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border`}>
              <div className={`absolute right-4 top-4 font-display text-7xl font-bold leading-none z-0 select-none ${numColor}`}>
                {num}
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className={`w-11 h-11 rounded-[0.9rem] flex items-center justify-center shadow-sm backdrop-blur-sm ${iconBg} ${iconColor}`}>
                    {icon}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide mt-1 backdrop-blur-sm ${pillBg}`}>
                    {pill}
                  </div>
                </div>

                <h3 className={`font-display text-xl font-bold mb-3 ${titleColor}`}>{title}</h3>
                <p className={`text-[15px] leading-relaxed ${descColor}`}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
