import { Handshake } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="py-4 px-6 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-300/60 dark:border-white/10">
      <div className="flex items-center gap-1.5">
        <Handshake className="w-5 h-5 text-give" />
        <span className="!font-logo font-bold text-base text-gray-900 dark:text-gray-100">
          Quid<span className="text-give italic">Pro</span>Know
        </span>
      </div>
      <span className="text-sm text-gray-600 font-sach dark:text-gray-400">© 2026 QuidProKnow. All rights reserved.</span>
    </footer>
  );
}
