import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { chatService } from '../api/chatService';
import { Handshake, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadChat, setUnreadChat] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const rooms = await chatService.getRooms();
        const total = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
        setUnreadChat(total);
      } catch { }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkClass = `relative text-sm font-medium transition-colors !text-gray-900 dark:!text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-orange-400 after:via-orange-500 after:to-orange-600 after:transition-transform after:duration-200 hover:after:scale-x-100 dark:after:from-orange-500 dark:after:via-orange-600 dark:after:to-orange-700`;

  const activeNavLinkClass = `!text-gray-900 dark:!text-white after:scale-x-100 after:h-[3px]`;

  const getNavLinkClass = ({ isActive }) => {
    return `${navLinkClass} ${isActive ? activeNavLinkClass : ""}`.trim();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 py-1 w-full border-b backdrop-blur-md supports-[backdrop-filter]:bg-background/10 ${isDarkMode ? 'bg-black/70 border-gray-800' : 'bg-white/40 border-gray-200'}`}>
      <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Handshake className="w-6 h-6 text-give" />
          <span className={`font-logo font-bold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quid<span className="text-give italic">Pro</span>Know
          </span>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-6">
          <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
          <NavLink to="/about" className={getNavLinkClass}>About</NavLink>

          {user && (
            <>
              <NavLink to="/dashboard" className={getNavLinkClass}>DashBoard</NavLink>
              <NavLink to="/chat" className={getNavLinkClass}>
                <span className="relative">
                  Chat
                  {unreadChat > 0 && (
                    <span className="absolute -top-1.5 -right-3.5 bg-red-600 text-white text-[10px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                      {unreadChat}
                    </span>
                  )}
                </span>
              </NavLink>
            </>
          )}

          <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-all duration-200 group ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            {isDarkMode ? <Sun className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" /> : <Moon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />}
          </button>

          {user ? (
            <>
              <NotificationBell />
              <Button variant="outline" className="hidden sm:flex gap-1.5" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Button onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-t ${isDarkMode ? 'bg-black/60 border-gray-800' : 'bg-white/60 border-gray-200'} backdrop-blur-lg shadow-lg`}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <NavLink to="/" className={(props) => `${getNavLinkClass(props)} w-fit`} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={(props) => `${getNavLinkClass(props)} w-fit`} onClick={() => setIsMobileMenuOpen(false)}>About</NavLink>

            {user && (
              <>
                <NavLink to="/dashboard" className={(props) => `${getNavLinkClass(props)} w-fit`} onClick={() => setIsMobileMenuOpen(false)}>DashBoard</NavLink>
                <NavLink to="/chat" className={(props) => `${getNavLinkClass(props)} w-fit`} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="relative inline-block">
                    Chat
                    {unreadChat > 0 && (
                      <span className="absolute -top-1.5 -right-3.5 bg-red-600 text-white text-[10px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                        {unreadChat}
                      </span>
                    )}
                  </span>
                </NavLink>
              </>
            )}

            <NavLink to="/contact" className={(props) => `${getNavLinkClass(props)} w-fit`} onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink>

            <div className="border-t my-2 border-gray-200 dark:border-gray-800 sm:hidden"></div>

            {!user && (
              <div className="flex sm:hidden flex-col gap-3">
                <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="w-full">
                  Login
                </Button>
                <Button variant="outline" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="w-full">
                  Sign Up
                </Button>
              </div>
            )}
            {user && (
              <div className="flex sm:hidden flex-col gap-3">
                <Button variant="outline" className="w-full gap-1.5" onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}>
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
