import { Link } from 'react-router-dom';
import { resolvePhotoUrl } from '../utils/resolvePhotoUrl';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

export default function UserCard({ user, action }) {
  const offered = user.skills?.filter(s => s.type === 'OFFER') ?? [];
  const wanted = user.skills?.filter(s => s.type === 'WANT') ?? [];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/55 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700/70 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex gap-4 items-start flex-1">
          {/* Clickable avatar */}
          <Link to={`/users/${user.id}`} className="shrink-0 transition-opacity hover:opacity-85">
            <div className="w-12 h-12 rounded-full bg-give-bg text-give flex items-center justify-center overflow-hidden text-lg font-bold border border-give/10">
              {user.profilePhotoUrl ? (
                <img
                  src={resolvePhotoUrl(API, user.profilePhotoUrl)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Clickable name */}
              <Link
                to={`/users/${user.id}`}
                className="!font-sach font-bold !text-black dark:!text-white text-gray-900 dark:text-white hover:text-give transition-colors"
              >
                {user.name}
              </Link>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold font-sach tracking-wider rounded-full !bg-cyan-200 !text-pink-800 badge-${user.badge}`}>
                {user.badge}
              </span>
            </div>

            {user.bio && (
              <p className="text-gray-500 dark:text-zinc-400 text-xs mb-2 leading-relaxed max-w-xl">
                {user.bio.length > 120 ? user.bio.slice(0, 120) + '…' : user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2">
              {offered.map(s => (
                <span key={s.id} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                  ✦ {s.skillName}
                </span>
              ))}
              {wanted.map(s => (
                <span key={s.id} className="px-2 py-0.5 bg-want-bg text-want text-[10px] font-semibold rounded-full">
                  ◈ {s.skillName}
                </span>
              ))}
              {offered.length === 0 && wanted.length === 0 && (
                <span className="text-gray-400 dark:text-zinc-500 text-xs italic">No skills listed yet</span>
              )}
            </div>

            <p className="text-gray-400 dark:text-zinc-500 text-xs font-medium">
              {user.totalRatings > 0
                ? `${user.averageRating?.toFixed(1)} avg (${user.totalRatings} reviews)`
                : 'No reviews yet'}
              {' · '}{user.points} pts
            </p>
          </div>
        </div>

        <div className="shrink-0 flex sm:flex-col gap-2 justify-end sm:items-end mt-2 sm:mt-0">
          {action}
          <Link to={`/users/${user.id}`} className="px-3.5 py-1.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 !text-gray-700 dark:!text-zinc-200 rounded-md text-xs font-semibold transition-all">
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
