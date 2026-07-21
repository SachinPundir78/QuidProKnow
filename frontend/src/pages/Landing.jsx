import Navbar from '../components/Navbar';
import LandingHero from '../components/LandingHero';
import LandingAbout from '../components/LandingAbout';
import LandingHowItWorks from '../components/LandingHowItWorks';
import LandingCTA from '../components/LandingCTA';
import LandingFooter from '../components/LandingFooter';

export default function Landing() {
  return (
    <>
      <Navbar />
      {/* Add pt-16 here to offset the fixed navbar since we removed LandingTheme wrapper that might have done this, though Hero had its own padding. */}
      <div className="">
        <LandingHero scrollToAbout={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} />
        <LandingAbout />
        <LandingHowItWorks />
        <LandingCTA />
        <LandingFooter />
      </div>
    </>
  );
}
