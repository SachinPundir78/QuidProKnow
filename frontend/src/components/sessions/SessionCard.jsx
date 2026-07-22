import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, Calendar, CheckCircle2, UserCircle, Star, Edit, XCircle } from 'lucide-react';
import { PROVIDER_META } from '../../api/sessionService';

export default function SessionCard({ session: s, currentUserId, onComplete, onCancel, onRate, onEdit }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const isUser1 = s.user1Id === currentUserId;
  const counterpart = isUser1 ? s.user2Name : s.user1Name;
  const counterpartId = isUser1 ? s.user2Id : s.user1Id;
  const myRating = isUser1 ? s.user1Rating : s.user2Rating;
  const isHost = s.hostUserId === currentUserId;
  const providerMeta = s.meetingProvider ? PROVIDER_META[s.meetingProvider] : null;

  const sessionMs = s.scheduledTime ? new Date(s.scheduledTime).getTime() : null;
  const diffMs = sessionMs !== null ? sessionMs - now : null;

  const JOIN_BEFORE_MS = 15 * 60 * 1000;
  const JOIN_AFTER_MS = 2 * 60 * 60 * 1000;

  const canJoin =
    s.status === 'SCHEDULED' &&
    !!s.meetingLink &&
    diffMs !== null &&
    diffMs <= JOIN_BEFORE_MS &&
    diffMs >= -JOIN_AFTER_MS;

  const handleJoin = () => window.open(s.meetingLink, '_blank', 'noopener,noreferrer');

  const formatCountdown = () => {
    if (diffMs === null || diffMs <= 0) return '🚀 Starting now!';
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    const sec = Math.floor((diffMs % 60000) / 1000);
    if (h > 0) return `Starts in ${h}h ${m}m`;
    if (m > 0) return `Starts in ${m}m ${sec}s`;
    return `Starts in ${sec}s`;
  };

  const statusStyles = {
    SCHEDULED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    ONGOING: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  return (
    <div className="font-sach bg-white/80 dark:bg-zinc-900/55 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-zinc-700/70 shadow-sm hover:shadow-md dark:hover:border-zinc-600 transition-all mb-4 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <span className="truncate max-w-[200px] sm:max-w-xs">{s.skill}</span>
              <span className="text-slate-400 text-sm font-normal">with</span>
              <Link
                to={`/users/${counterpartId}`}
                className="session-card-counterpart hover:underline flex items-center gap-1 truncate max-w-[150px]"
              >
                {counterpart}
              </Link>
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {s.scheduledTime
                  ? new Date(s.scheduledTime).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                  : 'Time not set'}
              </div>

              {s.status === 'SCHEDULED' && diffMs !== null && diffMs > 0 && diffMs < 2 * 3600000 && (
                <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {formatCountdown()}
                </div>
              )}
              {s.status === 'SCHEDULED' && diffMs !== null && diffMs <= 0 && diffMs >= -JOIN_AFTER_MS && (
                <div className="flex items-center gap-1.5 font-sach text-pink-600 dark:text-pink-400 font-semibold px-2 py-0.5 bg-pink-100 dark:bg-red-100 !rounded-full animate-pulse">
                  <span>🚀</span> Starting now!
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusStyles[s.status]}`}>
              {s.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-200 text-pink-800 dark:bg-red-50 dark:text-red-600">
              {s.oneWay ? 'One-way' : 'Barter'}
            </span>
            {providerMeta && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1"
                style={{
                  backgroundColor: `${providerMeta.color}15`,
                  color: providerMeta.color,
                  borderColor: `${providerMeta.color}30`
                }}
              >
                {providerMeta.emoji} {providerMeta.label}
              </span>
            )}
            {isHost && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Host
              </span>
            )}
          </div>
        </div>

        {s.meetingLink && s.status !== 'CANCELLED' && (
          <div className="mb-4 p-3 bg-slate-50/70 dark:bg-zinc-950/35 rounded-xl border border-slate-100 dark:border-zinc-800/70 flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            <a
              href={s.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="session-card-meeting-link hover:underline truncate"
            >
              {s.meetingLink}
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-700/50">
          <Link
            to={`/users/${counterpartId}`}
            className="session-card-profile-link px-3 py-1.5 text-md !text-white  font-medium bg-black dark:bg-zinc-800/70 hover:bg-orange-400 hover:text-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-1.5"
          >
            <UserCircle className="w-4 h-4" /> View Profile
          </Link>

          {canJoin && (
            <button
              className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-sm flex items-center gap-1.5"
              onClick={handleJoin}
            >
              <img src="https://img.icons8.com/?size=100&id=23269&format=png&color=000000" className="w-4 h-4 invert" alt="Join" /> Join Meeting
            </button>
          )}

          {isHost && s.status === 'SCHEDULED' && onEdit && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors flex items-center gap-1.5"
              onClick={() => onEdit(s)}
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}

          {s.status === 'SCHEDULED' && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-full transition-colors flex items-center gap-1.5"
              onClick={() => onComplete(s.id)}
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Complete
            </button>
          )}

          {s.status === 'COMPLETED' && myRating === 0 && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors flex items-center gap-1.5"
              onClick={() => onRate(s)}
            >
              <Star className="w-4 h-4" /> Rate &amp; Review
            </button>
          )}

          {s.status === 'COMPLETED' && myRating > 0 && (
            <div className="flex items-center gap-1 text-md font-medium text-amber-500 bg-amber-100 dark:bg-amber-900 px-3 py-1.5 !rounded-full">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>Rated: {myRating}/100</span>
            </div>
          )}

          {(s.status === 'SCHEDULED' || s.status === 'ONGOING') && (
            <button
              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors flex items-center gap-1.5"
              onClick={() => onCancel(s.id)}
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
