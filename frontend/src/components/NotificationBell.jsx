import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../api/notificationService';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await notificationService.unreadCount();
        if (!cancelled) setUnread(data.unreadCount);
      } catch {
        // Auth may have lapsed; the axios interceptor already handles
        // clearing local state, so just skip this tick silently.
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link to="/notifications" className="nav-link relative flex items-center justify-center  !rounded-full transition-all duration-200 group hover:!bg-black/5 dark:hover:!bg-white/10" aria-label={`Notifications, ${unread} unread`}>
      <span className={unread > 0 ? 'notif-dot relative inline-flex items-center justify-center' : 'inline-flex items-center justify-center'} data-count={unread > 0 ? unread : undefined}>
        <Bell className="w-5 h-5 text-black dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </span>
    </Link>
  );
}
