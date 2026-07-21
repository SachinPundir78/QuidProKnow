import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../api/requestService';
import { sessionService } from '../api/sessionService';
import { Handshake, Inbox, Send, AlertCircle, Check, X, ArrowLeftRight } from 'lucide-react';

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [inc, snt] = await Promise.all([requestService.incoming(), requestService.sent()]);
    setIncoming(inc);
    setSent(snt);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const openAccept = (req) => {
    setAcceptTarget(req);
    setScheduledTime('');
    setMeetingLink('');
    setError('');
  };

  const confirmAccept = async () => {
    if (!scheduledTime) {
      setError('Pick a date and time for the session.');
      return;
    }
    if (new Date(scheduledTime) <= new Date()) {
      setError('Please choose a future date and time.');
      return;
    }
    if (!meetingLink.trim()) {
      setError('Meeting link is required.');
      return;
    }
    if (!sessionService.isValidMeetingLink(meetingLink)) {
      setError(
        'Invalid meeting link. Supported: Google Meet (https://meet.google.com/xxx-xxxx-xxx), ' +
        'Zoom (https://zoom.us/j/...), Teams (https://teams.microsoft.com/...), ' +
        'Jitsi (https://meet.jit.si/Room).'
      );
      return;
    }
    setBusyId(acceptTarget.id);
    try {
      await requestService.accept(acceptTarget.id, { scheduledTime, meetingLink: meetingLink.trim() });
      setAcceptTarget(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept this request.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await requestService.reject(id);
      await loadAll();
    } finally {
      setBusyId(null);
    }
  };

  const list = tab === 'incoming' ? incoming : sent;

  // Minimum datetime: now + 5 minutes
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sach">
      <div className="mb-8 pb-6 border-b border-gray-300/70 dark:border-zinc-800/70">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white flex items-center gap-2">
          <Handshake className="w-8 h-8 text-give" />
          <span>Requests</span>
        </h1>
        <p className="text-md font-medium text-gray-500 dark:text-zinc-400 mt-1">Skill exchange requests you've sent and received.</p>
      </div>

      <div className="flex border-b border-gray-300/70 dark:border-zinc-800/70 mb-6">
        <button 
          onClick={() => setTab('incoming')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
            tab === 'incoming' 
              ? 'border-give text-give font-bold' 
              : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-give hover:border-gray-300 dark:hover:border-zinc-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span className="text-md font-medium">Incoming ({incoming.filter((r) => r.status === 'PENDING').length})</span>
        </button>
        <button 
          onClick={() => setTab('sent')}
          className={`px-5 py-3 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${
            tab === 'sent' 
              ? 'border-give text-give font-bold' 
              : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-give hover:border-gray-300 dark:hover:border-zinc-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span text-md font-medium>Sent ({sent.length})</span>
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 animate-pulse">Loading…</p>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-white/55 dark:bg-zinc-900/40 backdrop-blur-md border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl">
          <AlertCircle className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-gray-800 dark:text-white text-sm mb-1">Nothing here yet</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {tab === 'incoming' ? 'No one has requested a session with you yet.' : "You haven't sent any requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((req) => (
            <div className="bg-white/80 dark:bg-zinc-900/55 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700/70 rounded-xl p-5 shadow-sm" key={req.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                    <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">
                      {tab === 'incoming' ? req.senderName : req.receiverName}
                    </h3>
                    <Link
                      to={`/users/${tab === 'incoming' ? req.senderId : req.receiverId}`}
                      className="px-2.5 py-1 border rounded-full border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 !text-black dark:!text-white rounded text-[10px] font-semibold transition-all shrink-0"
                    >
                      View profile
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-want-bg text-want text-xs font-semibold rounded-full">
                      Wants: {req.skillWanted}
                    </span>
                    {req.skillOffered && (
                      <>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                          Offers: {req.skillOffered}
                        </span>
                      </>
                    )}
                  </div>
                  {req.comment && (
                    <p className="text-gray-500 dark:text-zinc-300 text-xs bg-gray-50/50 dark:bg-zinc-950/30 p-3 rounded-lg border-l-2 border-gray-300 dark:border-zinc-700 italic mb-3">
                      “{req.comment}”
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap text-[12px] font-bold font-sach  tracking-wider">
                    <span className="px-2 py-1 bg-gray-800  dark:bg-zinc-800 text-white dark:text-zinc-400 rounded-full">
                      {req.oneWay ? 'One-way (25 pts)' : 'Barter'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-md font-extrabold rounded-full bg-green-100 border-green-900 lowercase  text-green-900  badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {tab === 'incoming' && req.status === 'PENDING' && (
                  <div className="flex gap-2 justify-end shrink-0 pt-2 sm:pt-0">
                    <button
                      className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
                      disabled={busyId === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="px-3.5 py-1.5 bg-give hover:brightness-110 text-white rounded-md text-xs font-semibold shadow-md shadow-give/5 transition-all disabled:opacity-50"
                      disabled={busyId === req.id}
                      onClick={() => openAccept(req)}
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {acceptTarget && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900/95 dark:shadow-black/50">
            <h3 className="mb-5 font-display text-lg font-bold text-gray-900 dark:text-white">Schedule with {acceptTarget.senderName}</h3>
            
            {error && (
              <div className="mb-4 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="scheduledTime" className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Date &amp; time</label>
              <input
                id="scheduledTime"
                type="datetime-local"
                min={minDatetime}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-lg text-sm transition-colors bg-gray-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:[color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label htmlFor="meetingLink" className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-zinc-300">
                <span>Meeting link</span>
                {meetingLink.trim() && (
                  <span className={`text-[10px] font-bold ${
                    sessionService.isValidMeetingLink(meetingLink) ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {sessionService.isValidMeetingLink(meetingLink) ? '✓ Valid' : '✗ Invalid'}
                  </span>
                )}
              </label>
              <input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                // autoComplete="off"
                spellCheck="false"
                className={`px-3.5 py-2 border rounded-lg text-sm transition-colors bg-gray-50 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 ${
                  meetingLink && !sessionService.isValidMeetingLink(meetingLink)
                    ? 'border-red-300 dark:border-red-800'
                    : 'border-gray-200 dark:border-zinc-700'
                }`}
              />
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-gray-400 dark:text-zinc-500">
                Supported: Google Meet · Zoom · Microsoft Teams · Jitsi (https only)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-2">
              <button 
                className="rounded-md border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" 
                onClick={() => setAcceptTarget(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-give px-4 py-2 text-xs font-semibold text-white shadow-md shadow-give/20 transition-all hover:brightness-110 disabled:opacity-50"
                disabled={busyId === acceptTarget.id || !sessionService.isValidMeetingLink(meetingLink) || !scheduledTime}
                onClick={confirmAccept}
              >
                {busyId === acceptTarget.id ? 'Scheduling…' : 'Confirm session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
