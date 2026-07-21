import { useState } from 'react';
import { Calendar, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { sessionService, PROVIDER_META } from '../../api/sessionService';

/**
 * Modal form to schedule a session for an accepted request.
 * Props:
 *   acceptedRequest – { id, skillWanted, senderName, receiverName }
 *   onSuccess(sessionDTO) – called after successful creation
 *   onClose()
 */
export default function SessionScheduler({ acceptedRequest, onSuccess, onClose }) {
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetingLink, setMeetingLink]     = useState('');
  const [busy, setBusy]                   = useState(false);
  const [error, setError]                 = useState('');

  const provider     = sessionService.detectProvider(meetingLink);
  const providerMeta = provider ? PROVIDER_META[provider] : null;
  const linkValid    = sessionService.isValidMeetingLink(meetingLink);

  // Minimum datetime = now + 5 minutes
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString().slice(0, 16);

  const handleSubmit = async () => {
    setError('');
    if (!scheduledTime) { setError('Please pick a date and time.'); return; }
    if (!meetingLink.trim()) { setError('Meeting link is required.'); return; }
    if (!linkValid) {
      setError(
        'Invalid meeting link. Supported: Google Meet (https://meet.google.com/xxx-xxxx-xxx), ' +
        'Zoom (https://zoom.us/j/...), Teams (https://teams.microsoft.com/...), ' +
        'Jitsi (https://meet.jit.si/Room).'
      );
      return;
    }

    setBusy(true);
    try {
      const session = await sessionService.create({
        sessionRequestId: acceptedRequest.id,
        scheduledTime: scheduledTime + ':00', // add seconds
        meetingLink: meetingLink.trim(),
      });
      onSuccess(session);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule the session. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/95 dark:bg-zinc-900/75 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-zinc-700/80 shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Schedule Session</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Skill: <strong className="text-slate-700 dark:text-slate-300">{acceptedRequest.skillWanted}</strong> ·{' '}
            {acceptedRequest.senderName} ↔ {acceptedRequest.receiverName}
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Date & Time */}
            <div>
              <label htmlFor="sched-time" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date &amp; Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  id="sched-time"
                  type="datetime-local"
                  min={minDatetime}
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label htmlFor="meeting-link" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meeting Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input
                  id="meeting-link"
                  type="url"
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:ring-2 outline-none transition-all text-slate-800 dark:text-white ${
                    meetingLink && !linkValid 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Provider badge */}
              {meetingLink.trim() && (
                <div className="mt-2 text-sm flex items-center gap-2">
                  {linkValid && providerMeta ? (
                    <>
                      <span 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs border"
                        style={{ 
                          backgroundColor: `${providerMeta.color}15`, 
                          color: providerMeta.color,
                          borderColor: `${providerMeta.color}30` 
                        }}
                      >
                        <span>{providerMeta.emoji}</span>
                        <span>{providerMeta.label}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid link
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1 text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Unsupported or invalid link
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400 mt-2">
                Supported: Google Meet · Zoom · Microsoft Teams · Jitsi (https only)
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-700/70 bg-slate-50/70 dark:bg-zinc-950/25 flex gap-3 justify-end">
          <button 
            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            onClick={onClose} 
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubmit}
            disabled={busy || !linkValid || !scheduledTime}
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              'Confirm Session'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
