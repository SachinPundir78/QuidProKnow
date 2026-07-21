import { useEffect, useState } from 'react';
import { Bell, BellRing, Clock3, Info } from 'lucide-react';
import { notificationService } from '../api/notificationService';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await notificationService.getAll();
      setItems(data);
      setLoading(false);

      if (data.some(notification => !notification.isRead)) {
        notificationService.markAllRead().catch(() => {});
      }
    };
    load();
  }, []);

  const formatDate = (value) => new Date(value).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 font-body sm:px-6 sm:py-10">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-display font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">Activity center</p>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><BellRing className="h-5 w-5" /></span>
              Notifications
            </h1>
            <p className="mt-2 text-md font-sach leading-relaxed text-slate-500 dark:text-zinc-400">Stay up to date with requests, sessions, profile updates, and ratings.</p>
          </div>
          {/* {!loading && items.length > 0 && <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">{items.length} total</span>} */}
        </div>
      </header>

      {!loading && items.length > 0 && <p className="mb-3 px-1 text-sm font-medium font-sach text-slate-700 dark:text-zinc-500">Latest activity</p>}

      {loading ? (
        <div className="space-y-3 animate-pulse ">
          {[1, 2, 3].map(item => <div key={item} className="h-24 rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/70" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border   border-dashed border-slate-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/70">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400"><Info className="h-6 w-6" /></span>
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-zinc-100">You're all caught up</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500">New activity will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(notification => (
            <article key={notification.id} className={`group flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md dark:bg-zinc-900/70 dark:hover:border-orange-500/30 ${notification.isRead ? 'border-slate-200 dark:border-zinc-800' : 'border-orange-200 dark:border-orange-500/30'}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Bell className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 font-sach">
                <p className="text-sm leading-6 text-slate-700 dark:text-zinc-200">{notification.message}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500"><Clock3 className="h-3.5 w-3.5" />{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-label="Unread notification" />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
