import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Loader2, AlertCircle, CalendarPlus, X, CalendarDays, Link as LinkIcon, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../api/sessionService';
import { requestService } from '../api/requestService';
import SessionCard from '../components/sessions/SessionCard';
import SessionScheduler from '../components/sessions/SessionScheduler';
import SessionDetails from '../components/sessions/SessionDetails';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);   // accepted requests without a session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'past'

  // Modals
  const [scheduling, setScheduling] = useState(null);  // acceptedRequest
  const [viewSession, setViewSession] = useState(null);  // sessionDTO
  const [editing, setEditing] = useState(null);  // sessionDTO
  const [rateTarget, setRateTarget] = useState(null);  // sessionDTO
  const [rating, setRating] = useState(80);
  const [review, setReview] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editTime, setEditTime] = useState('');
  const [busy, setBusy] = useState(false);

  // Minimum datetime for scheduling = now + 5 minutes
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  // ── Data loading ──────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [sessData, incomingData, sentData] = await Promise.all([
        sessionService.mySessions(),
        requestService.incoming(),
        requestService.sent(),
      ]);
      setSessions(sessData);

      // Accepted requests that don't yet have a scheduled session
      const sessionReqIds = new Set(sessData.map(s => s.sessionRequestId).filter(Boolean));
      const accepted = [...incomingData, ...sentData].filter(
        r => r.status === 'ACCEPTED' && !sessionReqIds.has(r.id)
      );
      setRequests(accepted);
    } catch {
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Filters ───────────────────────────────────────────────────────────
  const upcoming = sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'ONGOING');
  const past = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleComplete = async (id) => {
    setBusy(true);
    try {
      await sessionService.complete(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete session.');
    } finally { setBusy(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    setBusy(true);
    try {
      await sessionService.cancel(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel session.');
    } finally { setBusy(false); }
  };

  const handleRate = (s) => {
    setRateTarget(s);
    setRating(80);
    setReview('');
    setError('');
  };

  const submitRating = async () => {
    setBusy(true);
    try {
      await sessionService.rate(rateTarget.id, Number(rating), review.trim() || null);
      setRateTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit rating.');
    } finally { setBusy(false); }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setEditLink(s.meetingLink || '');
    setEditTime(s.scheduledTime ? s.scheduledTime.slice(0, 16) : '');
    setError('');
  };

  const submitEdit = async () => {
    if (editTime && new Date(editTime) <= new Date()) {
      setError('Please choose a future date and time.');
      return;
    }
    setBusy(true);
    try {
      await sessionService.update(editing.id, {
        scheduledTime: editTime ? editTime + ':00' : undefined,
        meetingLink: editLink || undefined,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update session.');
    } finally { setBusy(false); }
  };

  const handleScheduled = async () => {
    setScheduling(null);
    await load();
  };

  // ── Render helpers ───────────────────────────────────────────────────
  const counterpartName = (r) =>
    r.senderId === user?.id ? r.receiverName : r.senderName;

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 font-sach">
      <div className="mb-8 pb-6 border-b border-slate-200/70 dark:border-zinc-800/70">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sessions</h1>
        <p className="text-slate-600 dark:text-slate-400 text-md font-medium">Manage your skill-exchange sessions.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/50">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Accepted requests ready to schedule */}
      {requests.length > 0 && (
        <div className="mb-8 bg-emerald-50/80 dark:bg-emerald-500/[0.08] backdrop-blur-md border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 shadow-sm">
          <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-4">
            <CalendarPlus className="w-5 h-5" />
            {requests.length} accepted request{requests.length > 1 ? 's' : ''} ready to schedule
          </h4>
          <div className="flex flex-col gap-3">
            {requests.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/70 dark:bg-zinc-900/45 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/15">
                <div className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{r.skillWanted}</span>
                  <span className="text-slate-500 dark:text-slate-400 mx-2">with</span>
                  <span className="font-medium">{counterpartName(r)}</span>
                </div>
                <button
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                  onClick={() => setScheduling(r)}
                >
                  Schedule Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 font-sach mb-6 border-b border-slate-200/70 dark:border-zinc-800/70">
        {[
          { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { id: 'past', label: `Past (${past.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-3 font-medium text-md  transition-colors relative ${tab === t.id
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            {t.label}
            {tab === t.id && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-emerald-600 dark:bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Session list */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
          <p>Loading sessions...</p>
        </div>
      ) : (tab === 'upcoming' ? upcoming : past).length === 0 ? (
        <div className="py-16 !font-sach flex flex-col items-center justify-center text-center bg-slate-50/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-700 border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800/70 text-slate-400 rounded-full flex items-center justify-center mb-4">
            {tab === 'upcoming' ? <CalendarIcon className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          <h3 className="text-xl  font-bold text-slate-800 dark:text-white mb-2">No {tab} sessions</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg">
            {tab === 'upcoming'
              ? 'Accept a request and schedule a session to get started learning and teaching.'
              : 'Completed or cancelled sessions will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(tab === 'upcoming' ? upcoming : past).map(s => (
            <SessionCard
              key={s.id}
              session={s}
              currentUserId={user?.id}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onRate={handleRate}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* ── Schedule modal ── */}
      {scheduling && (
        <SessionScheduler
          acceptedRequest={{
            id: scheduling.id,
            skillWanted: scheduling.skillWanted,
            senderName: scheduling.senderName,
            receiverName: scheduling.receiverName,
          }}
          onSuccess={handleScheduled}
          onClose={() => setScheduling(null)}
        />
      )}

      {/* ── Edit modal ── */}
      {editing && (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-session-title" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16191f] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 sm:p-7">
              <div className="flex justify-between items-start mb-7">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"><CalendarDays className="w-5 h-5" /></div>
                  <h3 id="edit-session-title" className="text-xl font-bold text-slate-900 dark:text-white mb-1">Edit session</h3>
                  <p className="mb-0 text-sm text-slate-500 dark:text-slate-400">Update the details and let your partner know.</p>
                </div>
                <button aria-label="Close edit session dialog" onClick={() => setEditing(null)} className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">New date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={editTime}
                    min={minDatetime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0e1117] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">New meeting link</label>
                  <div className="relative">
                    <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="url"
                      value={editLink}
                      onChange={e => setEditLink(e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0e1117] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-7 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] flex gap-3 justify-end">
              <button
                className="px-5 py-2 text-red-600 bg-red-100 border-red-800 font-bold hover:bg-red-200 dark:hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-emerald-100 hover:bg-emerald-500 text-green-700 font-bold rounded-full transition-colors shadow-lg shadow-emerald-950/20 disabled:opacity-50 flex items-center gap-2"
                onClick={submitEdit}
                disabled={busy}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {busy ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate modal ── */}
      {rateTarget && (
        <div role="dialog" aria-modal="true" aria-labelledby="rate-session-title" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16191f] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10"><Star className="h-5 w-5 fill-current" /></div>
                <div>
                  <h3 id="rate-session-title" className="text-xl font-bold text-slate-900 dark:text-white mb-1">Rate &amp; review</h3>
                  <p className="mb-0 text-sm text-slate-500 dark:text-slate-400">For session: <strong className="text-slate-700 dark:text-slate-300">{rateTarget.skill}</strong> with {rateTarget.user1Id === user?.id ? rateTarget.user2Name : rateTarget.user1Name}</p>
                </div>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}

              <div className="space-y-6">
                <div>
                  <label className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                    <span>Score</span>
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300 px-3 py-1 rounded-full text-md font-extrabold tabular-nums">{rating}<span className="mx-1 text-amber-600/60 dark:text-amber-300/50">/</span>100</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="rating-slider w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                    <span>1 — Needs work</span>
                    <span>100 — Outstanding</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Feedback <span className="font-medium text-slate-400 dark:text-slate-500">(optional)</span></label>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    placeholder="Share your experience to help them improve..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0e1117] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:border-amber-500 dark:focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-7 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] flex gap-3 justify-end">
              <button
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setRateTarget(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-amber-600 hover:bg-amber-400 text-white font-bold rounded-full transition-colors shadow-lg shadow-amber-950/20 disabled:opacity-50 flex items-center gap-2"
                onClick={submitRating}
                disabled={busy}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {busy ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Session detail modal ── */}
      {viewSession && (
        <SessionDetails
          session={viewSession}
          currentUserId={user?.id}
          onClose={() => setViewSession(null)}
        />
      )}
    </div>
  );
}
