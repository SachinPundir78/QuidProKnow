import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../api/sessionService';
import { Calendar as CalendarPicker } from '../components/ui/calendar';
import {
  ArrowRight,
  CalendarDays,
  CalendarCheck2,
  Clock3,
  Info,
  Sparkles,
  Video,
} from 'lucide-react';

function parseSessionDate(session) {
  if (!session.scheduledTime) return null;
  const date = new Date(session.scheduledTime);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function sessionName(session) {
  return session.skill || session.skillName || 'Skill share session';
}

function statusClass(status) {
  if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (status === 'ONGOING') return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300';
}

function SessionCard({ session, user, compact = false }) {
  const date = parseSessionDate(session);
  const counterpart = session.user1Id === user.id ? session.user2Name : session.user1Name;

  return (
    <article className={`rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/70 ${compact ? '' : 'transition hover:border-orange-200 dark:hover:border-orange-500/30'}`}>
      <div className="flex items-start justify-between gap-3 font-display">
        <div className="min-w-0">
          <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 dark:text-white">{sessionName(session)}</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">with {counterpart || 'your learning partner'}</p>
          {date && (
            <p className="mb-0 flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
              <Clock3 className="h-3.5 w-3.5 text-orange-500" />
              {date.toLocaleString(undefined, compact
                ? { hour: '2-digit', minute: '2-digit' }
                : { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${statusClass(session.status)}`}>
          {session.status || 'Scheduled'}
        </span>
      </div>
      {session.meetingLink && (session.status === 'SCHEDULED' || session.status === 'ONGOING') && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-3 py-2 text-sm font-bold font-sach !text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <Video className="h-3.5 w-3.5" />
          Join meeting
        </a>
      )}
    </article>
  );
}

export default function Calendar() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState();
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    let mounted = true;

    const loadSessions = async () => {
      try {
        const data = await sessionService.mySessions();
        if (mounted) setSessions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load sessions', error);
        if (mounted) setSessions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSessions();
    return () => { mounted = false; };
  }, []);

  const sessionsByDate = useMemo(() => {
    return sessions.reduce((result, session) => {
      const date = parseSessionDate(session);
      if (!date) return result;
      const key = dateKey(date);
      (result[key] ||= []).push(session);
      return result;
    }, {});
  }, [sessions]);

  const sessionDates = useMemo(
    () => Object.keys(sessionsByDate).map(key => {
      const [year, monthIndex, day] = key.split('-').map(Number);
      return new Date(year, monthIndex, day);
    }),
    [sessionsByDate]
  );

  const sessionsOnSelected = selected ? sessionsByDate[dateKey(selected)] || [] : [];
  const upcoming = useMemo(
    () => sessions
      .filter(session => session.status === 'SCHEDULED' && parseSessionDate(session) > new Date())
      .sort((first, second) => parseSessionDate(first) - parseSessionDate(second)),
    [sessions]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 font-body lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-orange-200/45 blur-3xl dark:bg-orange-500/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[12px] font-bold tracking-[0.14em] text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              <CalendarCheck2 className="h-3.5 w-3.5" />
              Session Planner
            </span>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
              <CalendarDays className="h-8 w-8 text-orange-500 sm:h-9 sm:w-9" />
              Calendar
            </h1>
            <p className="mb-0 max-w-xl text-md font-display leading-relaxed text-gray-600 dark:text-zinc-400">See every scheduled skill-sharing session, choose a day, and join your next meeting in one place.</p>
          </div>
          <button
            type="button"
            onClick={() => { const today = new Date(); setMonth(today); setSelected(today); }}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Today
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6  xl:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="font-display">
              <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Your schedule</h2>
              <p className="mb-0 text-sm text-gray-500 dark:text-zinc-400">Dates with sessions are marked with an orange dot.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          <div className="flex justify-center overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-3">
            <CalendarPicker
              mode="single"
              fixedWeeks
              selected={selected}
              onSelect={setSelected}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ hasSession: sessionDates }}
              modifiersClassNames={{
                hasSession: '[&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:rounded-full [&>button]:after:bg-orange-500 [&>button[data-selected-single=true]]:after:bg-white',
              }}
              className="rounded-lg bg-transparent p-1 text-gray-900 [--cell-size:2.25rem] dark:bg-transparent dark:text-zinc-100 sm:[--cell-size:2.5rem]"
              classNames={{
                root: 'w-[420px] max-w-full',
                month: 'flex w-full flex-col gap-3',
                month_grid: 'w-full table-fixed border-collapse',
                weekdays: 'flex w-full',
                week: 'flex w-full',
                caption_label: 'text-sm font-bold text-gray-900 dark:text-white',
                weekday: 'w-[14.285714%] text-center text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-zinc-500',
                today: '[&>button]:border [&>button]:border-orange-200 [&>button]:bg-orange-50 [&>button]:font-bold [&>button]:text-orange-700 dark:[&>button]:border-orange-500/25 dark:[&>button]:bg-orange-500/10 dark:[&>button]:text-orange-200',
                selected: '[&>button]:!bg-orange-500 [&>button]:!text-white [&>button]:shadow-md [&>button]:shadow-orange-500/20',
                outside: 'text-gray-300 dark:text-zinc-700',
              }}
            />
          </div>
        </section>

        <aside className="flex min-h-[240px] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 font-display shadow-sm dark:border-zinc-800 dark:bg-zinc-950 xl:col-span-5 xl:aspect-square">
          {!selected ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center font-display">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-base font-bold text-gray-900 dark:text-white">Choose a date</h2>
              <p className="mb-0 max-w-[230px] text-sm leading-relaxed text-gray-500 dark:text-zinc-400">Select a day in the calendar to view the sessions booked for it.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-5 border-b border-gray-100 pb-4 dark:border-zinc-800 font-display">
                <span className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-300"><Sparkles className="h-3.5 w-3.5" /> Selected day</span>
                <h2 className="mb-0 text-lg font-bold text-gray-900 dark:text-white">{selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              </div>
              {loading && <p className="text-xs text-gray-400 dark:text-zinc-500">Loading sessions…</p>}
              {!loading && sessionsOnSelected.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-5 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="mb-1 text-sm font-bold text-gray-700 dark:text-zinc-200">Nothing scheduled</p>
                  <p className="mb-0 text-xs text-gray-500 dark:text-zinc-400">Choose another day or browse members to plan a session.</p>
                </div>
              )}
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">{sessionsOnSelected.map(session => <SessionCard key={session.id} session={session} user={user} compact />)}</div>
            </div>
          )}
        </aside>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4 font-display">
          <div>
            <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Upcoming sessions</h2>
            <p className="mb-0 text-sm text-gray-500 dark:text-zinc-400">Your next opportunities to learn, teach, and connect.</p>
          </div>
          <span className="hidden rounded-full bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 sm:inline-flex">{upcoming.length} scheduled</span>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">Loading your schedule…</div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <CalendarDays className="mx-auto mb-3 h-7 w-7 text-gray-700 dark:text-zinc-500" />
            <h3 className="mb-1 text-sm font-bold text-gray-800 dark:text-zinc-200">Nothing coming up</h3>
            <p className="mb-0 text-sm font-display text-gray-500 dark:text-zinc-400">Accepted requests will appear here once a session is scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map(session => <SessionCard key={session.id} session={session} user={user} />)}
          </div>
        )}
      </section>
    </div>
  );
}
