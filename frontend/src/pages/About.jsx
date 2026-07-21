import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';

export default function About() {
  return (
    <>
      <Navbar />
      <div className="pt-12 min-h-screen flex flex-col justify-between">
        <main className="flex-grow container mx-auto px-6 py-12 md:py-16 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-give/50"></div>
            <span className="font-logo italic text-give text-2xl font-bold tracking-wide">
              Our Mission
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-give/50"></div>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-none mb-8 text-gray-900 dark:!text-white">
            Empowering growth through <span className="text-give italic">shared knowledge.</span>
          </h1>

          <p className="text-md md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
            <span className='text-orange-500 font-semibold italic text-xl font-logo'>QuidProKnow</span> was built on a simple belief: everyone has something valuable to teach, and everyone has something new to learn.
            By removing the financial barrier to education, we're fostering a global community of peer-to-peer mentorship.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-14">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm">
              <h2 className="text-3xl font-bold font-display mb-4 text-gray-900 dark:!text-white">Why we started</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Traditional education and tutoring can be expensive. We realized that while one person might struggle to afford guitar lessons, they might be an expert in programming. By creating a barter system for skills, we unlock endless learning potential.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm">
              <h2 className="text-3xl font-bold font-display mb-4 text-gray-900 dark:!text-white">Our vision</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                A world where knowledge flows freely. Where your currency is your expertise, and your willingness to help others is rewarded with the opportunity to grow your own skill set.
              </p>
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
