import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

import { SignIn, SignUp } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import BrowseUsers from './pages/BrowseUsers';
import Requests from './pages/Requests';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Calendar from './pages/Calendar';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import ProfileAnalyzer from './pages/ProfileAnalyzer';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Onboarding from './pages/Onboarding';

function RedirectIfAuthed({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function GlobalTheme({ children }) {
  const { isDarkMode } = useTheme();

  if (isDarkMode) {
    return (
      <div className="min-h-screen w-full bg-black relative overflow-hidden">
        {/* Top Spotlight Background */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background: `
       radial-gradient(
         circle at top,
         rgba(255, 255, 255, 0.08) 0%,
         rgba(255, 255, 255, 0.08) 20%,
         rgba(0, 0, 0, 0.0) 60%
       )
     `,
          }}
        />

        <div className="relative z-10 min-h-screen w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fff7ed] relative">
      {/* Peachy Sunrise Glow Background */}
      <div
        className="fixed inset-0 z-0"
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
      />
      <div className="relative z-10 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <GlobalTheme>
            <Routes>
              {/* Public Routes (Accessible by both authed and unauthed) */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Auth Routes */}
              <Route path="/login" element={
                <div className="flex h-screen w-full items-center justify-center bg-[#fff7ed]">
                  <SignIn routing="path" path="/login" signUpUrl="/register" />
                </div>
              } />
              <Route path="/register" element={
                <div className="flex h-screen w-full items-center justify-center bg-[#fff7ed]">
                  <SignUp routing="path" path="/register" signInUrl="/login" />
                </div>
              } />

              {/* Onboarding */}
              <Route path="/onboarding" element={
                <ProtectedRoute allowUnonboarded={true}>
                  <Onboarding />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/browse" element={<Protected><BrowseUsers /></Protected>} />
              <Route path="/requests" element={<Protected><Requests /></Protected>} />
              <Route path="/sessions" element={<Protected><Sessions /></Protected>} />
              <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
              <Route path="/users/:id" element={<Protected><UserProfile /></Protected>} />

              <Route path="/chat" element={<Protected><Chat /></Protected>} />
              <Route path="/chat/:roomId" element={<Protected><Chat /></Protected>} />
              <Route path="/profile-analyzer" element={<Protected><ProfileAnalyzer /></Protected>} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </GlobalTheme>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
