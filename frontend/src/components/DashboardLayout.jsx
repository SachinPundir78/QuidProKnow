import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatService } from '../api/chatService';
import { requestService } from '../api/requestService';
import { resolvePhotoUrl } from '../utils/resolvePhotoUrl';
import NotificationBell from './NotificationBell';
import { TooltipProvider } from './ui/tooltip';
import { UserButton } from '@clerk/clerk-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from './ui/sidebar';
import {
  LayoutDashboard, Search, Inbox, Video, Calendar,
  MessageSquare, User, Sparkles, Handshake, LogOut,
  Sun, Moon, Home, ChevronDown
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

function AppSidebar({ unreadChat, pendingRequests, isDarkMode, menuItems, isLinkActive }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar className="border-r border-white/60 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-950 backdrop-blur-md">
      <SidebarHeader className="p-6">
        {/* Logo */}
        <div>
          <Link
            to="/"
            onClick={() => isMobile && setOpenMobile(false)} className="flex items-center gap-2">
            <Handshake className="w-6 h-6 text-give" />
            <span className={`font-logo font-bold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quid<span className="text-give italic font-extrabold">Pro</span>Know
            </span>
          </Link>
        </div>

        {/* Back to Home Button */}
        <Link
          to="/"
          onClick={() => isMobile && setOpenMobile(false)}
          className="flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-sm font-medium border border-dashed border-gray-200 dark:border-zinc-800 hover:border-black hover:bg-gray-50 dark:hover:border-white dark:hover:bg-zinc-900 text-black hover:text-black dark:text-zinc-400 dark:hover:text-white transition-all"
        >
          <Home className="w-4 h-4 shrink-0 transition-colors text-black dark:text-white" />
          <span className='text-black dark:text-white font-semibold font-display'>Home</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.to);
            return (
              <SidebarMenuItem key={item.to} className="my-0.5">
                <SidebarMenuButton
                  isActive={active}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${active
                    ? 'bg-give-bg/70 dark:bg-give/10 text-black dark:text-white font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-white'
                    }`}
                >
                  <Link
                    to={item.to}
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 transition-colors text-black dark:text-white" />
                      <span className="text-black dark:text-white font-semibold font-display">{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <SidebarMenuBadge className="bg-give text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 mt-auto">
        {/* AI Analyzer promo card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-zinc-900/50 dark:to-zinc-900/30 border border-orange-100/50 dark:border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-give animate-pulse" />
            <span className="text-xs font-display font-bold uppercase tracking-wider text-give">AI Analyzer</span>
          </div>
          <p className="text-xs !font-display text-gray-500 dark:text-zinc-400 leading-relaxed mb-3">
            Get AI-powered insights on your skills & growth.
          </p>
          <Link
            to="/profile-analyzer"
            onClick={() => isMobile && setOpenMobile(false)}
            className="inline-flex  items-center justify-center font-display w-full py-1.5 bg-white dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 hover:bg-orange-50 dark:hover:bg-zinc-700/80 !text-black dark:!text-white text-xs font-bold rounded-lg transition-all"
          >
            Try AI Analyzer &rarr;
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname.startsWith('/chat');

  const [unreadChat, setUnreadChat] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Poll chat rooms and request counts
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const [rooms, incomingReqs] = await Promise.all([
          chatService.getRooms(),
          requestService.incoming()
        ]);
        const chatUnread = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
        const reqsPending = incomingReqs.filter(r => r.status === 'PENDING').length;
        setUnreadChat(chatUnread);
        setPendingRequests(reqsPending);
      } catch (err) {
        // Suppress auth or network errors during poll
      }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/browse', label: 'Browse', icon: Search },
    { to: '/requests', label: 'Requests', icon: Inbox, badge: pendingRequests },
    { to: '/sessions', label: 'Sessions', icon: Video },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/chat', label: 'Chat', icon: MessageSquare, badge: unreadChat },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/profile-analyzer', label: 'AI Analyzer', icon: Sparkles },
  ];

  // Helper to determine if a route is active
  const isLinkActive = (to) => {
    if (to === '/chat') {
      return location.pathname.startsWith('/chat');
    }
    return location.pathname === to;
  };

  const userPhoto = resolvePhotoUrl(API, user?.photo);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full font-body bg-[#fff7ed] dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
          {!isDarkMode && <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(180deg,
                  rgba(255,247,237,1) 0%,
                  rgba(255,237,213,0.8) 25%,
                  rgba(254,215,170,0.6) 50%,
                  rgba(251,146,60,0.4) 75%,
                  rgba(249,115,22,0.3) 100%
                ),
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.6) 0%, transparent 40%),
                radial-gradient(circle at 80% 20%, rgba(254,215,170,0.5) 0%, transparent 50%),
                radial-gradient(circle at 60% 60%, rgba(252,165,165,0.3) 0%, transparent 45%)
              `,
            }}
          />}

          {/* App Sidebar Component */}
          <AppSidebar
            unreadChat={unreadChat}
            pendingRequests={pendingRequests}
            isDarkMode={isDarkMode}
            menuItems={menuItems}
            isLinkActive={isLinkActive}
          />

          {/* Sidebar Inset (Main Area) */}
          <SidebarInset className="relative z-10 flex flex-col flex-1 bg-transparent dark:bg-black transition-colors duration-200">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-white/60 dark:border-zinc-800/40 bg-white/35 dark:bg-black/20 backdrop-blur-md px-6 z-20">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                  title="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="flex items-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </header>

            {/* Subpage content area */}
            <main className={isChatPage ? 'flex-1 min-h-0 w-full' : 'flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto'}>
              {children}
            </main>
          </SidebarInset>

        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
