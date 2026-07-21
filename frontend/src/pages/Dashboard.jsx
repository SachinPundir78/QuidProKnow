import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { sessionService } from '../api/sessionService';
import { notificationService } from '../api/notificationService';
import { resolvePhotoUrl } from '../utils/resolvePhotoUrl';
import {
  FiArrowUpRight, FiSearch, FiCalendar, FiUser, FiStar, FiAward,
  FiZap, FiTrendingUp, FiBookOpen, FiTarget, FiUsers, FiActivity,
  FiBook, FiChevronRight, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { Shield, Sparkles, BookOpen, Target, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

// Sparkline graph helper
function Sparkline({ path, color }) {
  return (
    <div className="w-16 h-8 flex items-center shrink-0">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Mini Calendar helper
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName = today.toLocaleString('default', { month: 'short' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const days = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push(d);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 shadow-sm w-full max-w-[200px] shrink-0 font-body">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
          {monthName} {year}
        </span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-give"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-give/50"></span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {weekdays.map((w, idx) => (
          <span key={idx} className="text-[10px] font-bold text-gray-400 dark:text-zinc-500">
            {w}
          </span>
        ))}
        {days.map((d, idx) => {
          if (d === null) return <div key={idx} />;
          const isToday = d === today.getDate();
          return (
            <div
              key={idx}
              className={`text-[10px] w-5 h-5 flex items-center justify-center mx-auto rounded-full transition-all ${isToday
                ? 'bg-give text-white font-bold shadow-sm shadow-give/20'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer'
                }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const offered = (user.skills || []).filter((s) => s.type === 'OFFER');
  const wanted = (user.skills || []).filter((s) => s.type === 'WANT');
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  // Badge thresholds
  const getBadgeProgress = (points) => {
    if (points < 100) return { current: points, target: 100, next: 'Explorer', badge: 'Learner' };
    if (points < 300) return { current: points, target: 300, next: 'Collaborator', badge: 'Explorer' };
    if (points < 600) return { current: points, target: 600, next: 'Mentor', badge: 'Collaborator' };
    return { current: points, target: 1000, next: 'Legend', badge: 'Mentor' };
  };

  const progressInfo = getBadgeProgress(user.points || 0);
  const progressPercent = Math.min((progressInfo.current / progressInfo.target) * 100, 100);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [usersData, sessionsData, notificationsData] = await Promise.all([
          userService.getAll(),
          sessionService.mySessions(),
          notificationService.getAll()
        ]);

        setLeaders(usersData.filter((u) => u.id !== user.id).slice(0, 5));
        setSessions(sessionsData.slice(0, 3));
        setNotifications(notificationsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user.id]);

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating || 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-3 h-3 ${i <= floor ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-zinc-700'}`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const stats = [
    {
      label: 'Points',
      value: user.points,
      trend: '↑ 12 this week',
      accent: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
      icon: FiZap,
      sparkline: 'M0 15 Q 15 5, 30 12 T 60 6',
      sparklineColor: '#f97316'
    },
    {
      label: 'Avg Rating',
      value: user.averageRating > 0 ? user.averageRating?.toFixed(1) : '4.8',
      trend: '↑ 0.2 this month',
      accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
      icon: FiStar,
      sparkline: 'M0 10 Q 15 15, 30 8 T 60 4',
      sparklineColor: '#10b981'
    },
    {
      label: 'Badge Tier',
      value: user.badge || 'Explorer',
      trend: `Next: ${progressInfo.next}`,
      accent: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
      icon: FiAward,
      sparkline: 'M0 15 Q 15 5, 30 10 T 60 12',
      sparklineColor: '#a855f7'
    },
    {
      label: 'Skills Listed',
      value: (user.skills || []).length,
      trend: '↑ 1 this month',
      accent: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
      icon: FiTarget,
      sparkline: 'M0 8 Q 15 12, 30 4 T 60 14',
      sparklineColor: '#f43f5e'
    },
  ];

  return (
    <div className="font-body space-y-6 lg:space-y-8">
      {/* Dashboard heading */}
      <section className="flex flex-col gap-4 border-b border-gray-200/70 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold font-sach text-gray-950 dark:text-white sm:text-3xl">Welcome back, {firstName}</h1>
          <p className="mb-0 text-sm text-gray-600 dark:text-zinc-400 font-sach font-semibold">Keep your skill exchange moving forward.</p>
        </div>
        <Link
          to="/browse"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-950 px-4 py-2.5 text-sm font-bold font-display !text-white shadow-sm transition hover:bg-orange-400 dark:bg-white dark:!text-black dark:hover:bg-zinc-200"
        >
          Explore members
          <FiArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex min-h-[142px] flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${stat.accent}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-black dark:text-white font-display tracking-wider block">
                      {stat.label}
                    </span>
                    <span className="text-2xl font-bold font-display text-gray-900 dark:text-white leading-tight">
                      {stat.value}
                    </span>
                  </div>
                </div>
                <Sparkline path={stat.sparkline} color={stat.sparklineColor} />
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold font-display text-gray-600 dark:text-zinc-500">
                <FiTrendingUp className="w-3 h-3 text-green-500" />
                <span>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Grid blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6 ">

          {/* Your Skills Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <FiBook className="h-5 w-5 text-give" />
                  <span>Your Skills</span>
                </h2>
                <p className="mb-0 text-md text-gray-500 dark:text-zinc-400 font-display ">What you share and what you are building next.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold font-sach text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                {offered.length + wanted.length} total
              </span>
            </div>

            <div className="space-y-5">
              {/* Teaching skills */}
              <div className="rounded-xl border border-emerald-100 bg-green-50 p-4  dark:border-emerald-500/15 dark:bg-emerald-500/[0.06]">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold font-display tracking-wider text-green-700 dark:text-green-300">
                  <BookOpen className="w-4 h-4" />
                  <span>Teaching</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {offered.length > 0 ? (
                    offered.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-display font-semibold text-emerald-800 shadow-sm dark:border-emerald-400/20 dark:bg-green-200 dark:text-green-900"
                      >
                        {s.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-emerald-700/70 dark:text-emerald-200/60">No teaching skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Learning skills */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-500/15 dark:bg-rose-500/[0.06]">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-rose-700 dark:text-rose-300">
                  <Target className="w-4 h-4" />
                  <span className="font-display">Learning</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wanted.length > 0 ? (
                    wanted.map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full border border-rose-200 bg-rose-100 px-3 py-1.5 text-xs font-display font-semibold text-rose-800 shadow-sm dark:border-rose-400/20 dark:bg-red-100 dark:text-red-600"
                      >
                        {s.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-rose-700/70 dark:text-rose-200/60">No learning skills added yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-zinc-800">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-emerald-500/25"
              >
                <span className="text-black dark:text-white font-display">Edit skills</span>
                <FiChevronRight className="w-3.5 h-3.5 text-black dark:text-white" />
              </Link>
            </div>
          </div>

          {/* Top-rated members Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-give" />
                <div>
                  <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white">
                    Top-rated members
                  </h2>
                </div>
              </div>
              <Link
                to="/browse"
                className="text-sm font-bold text-gray-500 hover:text-gray dark:text-zinc-400 dark:hover:text-give flex items-center gap-1 "
              >
                <span className="font-display text-black dark:text-white">View all</span>
                <FiArrowUpRight className="w-3.5 h-3.5 text-black dark:text-white" />
              </Link>
            </div>

            {leaders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 dark:text-zinc-500">No members to display.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaders.map((u, idx) => {
                  const photoUrl = resolvePhotoUrl(API, u.photo);
                  const isLast = idx === leaders.length - 1;
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center justify-between pb-4 ${!isLast ? 'border-b border-gray-50 dark:border-zinc-800/40' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold font-logo text-gray-400 dark:text-zinc-500 w-4 block text-center">
                          {idx + 1}
                        </span>
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-give/10 text-give font-semibold flex items-center justify-center text-sm font-display shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/users/${u.id}`}
                            className="text-md !font-bold !font-sach !text-black dark:!text-white hover:text-give transition-colors truncate block"
                          >
                            {u.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-semibold text-gray-800 dark:text-zinc-300">
                              {u.averageRating > 0 ? u.averageRating.toFixed(1) : '4.8'}
                            </span>
                            {renderStars(u.averageRating)}
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                              ({u.totalRatings || 120})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User offered skills list */}
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0 max-w-[200px] overflow-hidden">
                        {(u.skills || []).filter(s => s.type === 'OFFER').slice(0, 2).map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-1 bg-emerald-100 border rounded-full border-green-100 text-[12px] text-green-800 font-display font-semibold rounded"
                          >
                            {s.skillName}
                          </span>
                        ))}
                      </div>

                      {/* Sessions count */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-300 block">
                          {u.points + 15} sessions
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">

          {/* Upcoming Sessions Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800/60">
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-give" />
                <span>Upcoming Sessions</span>
              </h2>
              <Link
                to="/calendar"
                className="text-md font-semibold font-display !text-black hover:!text-orange-600 dark:!text-white dark:hover:!text-orange-500 flex items-center gap-1 transition-colors"
              >
                <span>View calendar</span>
                <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Mini Calendar Widget */}
              <MiniCalendar />

              {/* Sessions list */}
              <div className="flex-1 w-full space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-gray-100 dark:border-zinc-800 rounded-xl">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">No upcoming sessions.</p>
                    <Link to="/browse" className="text-xs font-bold text-give mt-2 block hover:underline">
                      Find a barter partner &rarr;
                    </Link>
                  </div>
                ) : (
                  sessions.map((sess) => {
                    const sessDate = new Date(sess.scheduledTime);
                    const formattedTime = sessDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isIncoming = sess.receiverId === user.id;
                    const partnerName = isIncoming ? sess.senderName : sess.receiverName;

                    return (
                      <div
                        key={sess.id}
                        className="p-3 border border-gray-100 dark:border-zinc-800 rounded-xl hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-all font-body"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] font-bold text-give dark:text-give-light tracking-wide uppercase">
                            {formattedTime}
                          </span>
                          <span className={`text-[10px] font-bold font-display px-1.5 py-0.5 rounded-full ${sess.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-orange-100 dark:bg-give/10 text-give dark:text-orange-400'
                            }`}>
                            {sess.status === 'COMPLETED' ? 'Confirmed' : 'Upcoming'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold font-display text-gray-900 dark:text-white mt-1 truncate">
                          {sess.skillName || 'Skill Share Session'}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
                          with {partnerName}
                        </p>
                      </div>
                    );
                  })
                )}

                {sessions.length > 0 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/sessions"
                      className="text-sm font-medium font-display !text-black dark:!text-white hover:underline inline-flex items-center gap-1"
                    >
                      <span>View all sessions</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800/60">
              <h2 className="text-lg font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-give" />
                <span>Activity Feed</span>
              </h2>
              <Link
                to="/notifications"
                className="text-sm font-medium font-display font-bold !text-black hover:!text-orange-600 dark:!text-white dark:hover:!text-orange-500 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-display">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => {
                  // Determine icon based on message content
                  const text = notif.message.toLowerCase();
                  let FeedIcon = FiInfo;
                  let iconColor = 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400';

                  if (text.includes('confirmed') || text.includes('accepted')) {
                    FeedIcon = FiCheckCircle;
                    iconColor = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
                  } else if (text.includes('points') || text.includes('earned')) {
                    FeedIcon = FiZap;
                    iconColor = 'bg-orange-100 text-give dark:bg-give/10 dark:text-orange-400';
                  } else if (text.includes('review') || text.includes('rating')) {
                    FeedIcon = FiStar;
                    iconColor = 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400';
                  }

                  // Human readable time diff
                  const createdDate = new Date(notif.createdAt);
                  const diffMs = new Date() - createdDate;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 600);
                  const diffDays = Math.floor(diffHours / 24);

                  let timeAgo = 'Just now';
                  if (diffDays > 0) timeAgo = `${diffDays}d ago`;
                  else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
                  else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

                  return (
                    <div key={notif.id} className="flex gap-3 items-start text-xs font-body">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                        <FeedIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 font-display text-xs font-medium">
                        <p className="text-gray-700 dark:text-zinc-300 leading-normal">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">
                          {timeAgo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress to next badge Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold font-display text-gray-400 dark:text-zinc-500 tracking-wider">
                Progress to next badge
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-give/10 border border-orange-100/50 dark:border-zinc-800/80 flex items-center justify-center text-give shrink-0">
                <Shield className="w-6 h-6 text-give" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {progressInfo.badge}
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                      Level 3
                    </p>
                  </div>
                  <span className="text-sm font-bold text-black font-display dark:text-white">
                    {progressInfo.current} / {progressInfo.target} pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-give rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium mt-2">
                  {progressInfo.target - progressInfo.current} points to reach {progressInfo.next}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
