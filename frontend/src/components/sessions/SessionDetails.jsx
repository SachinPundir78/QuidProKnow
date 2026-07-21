import { X, Calendar, Clock, Link as LinkIcon, User, Info, Type, Settings, Shield } from 'lucide-react';
import { PROVIDER_META } from '../../api/sessionService';

/**
 * Full-page style detail view of one session.
 * Props: session, currentUserId, onClose, onJoin
 */
export default function SessionDetails({ session: s, currentUserId, onClose }) {
  if (!s) return null;

  const isUser1      = s.user1Id === currentUserId;
  const counterpart  = isUser1 ? s.user2Name : s.user1Name;
  const providerMeta = s.meetingProvider ? PROVIDER_META[s.meetingProvider] : null;

  const handleJoin = () => {
    window.open(s.meetingLink, '_blank', 'noopener,noreferrer');
  };

  const sessionTime = s.scheduledTime ? new Date(s.scheduledTime) : null;
  const now = Date.now();
  const canJoin = s.status === 'SCHEDULED' && s.meetingLink && sessionTime &&
    (sessionTime.getTime() - now) <= 15 * 60 * 1000;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/95 dark:bg-zinc-900/75 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-zinc-700/80 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-zinc-700/70 bg-slate-50/70 dark:bg-zinc-950/25">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="truncate">{s.skill}</span>
            <span className="text-slate-600 dark:text-orange-400 font-medium">with</span>
            <span className="text-emerald-600 dark:text-emerald-400">{counterpart}</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <Row icon={Info} label="Status">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{s.status}</span>
          </Row>
          
          <Row icon={Type} label="Type">
            {s.oneWay ? 'One-way learning' : 'Barter exchange'}
          </Row>
          
          {sessionTime && (
            <Row icon={Calendar} label="Scheduled">
              {sessionTime.toLocaleString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Row>
          )}
          
          {providerMeta && (
            <Row icon={Settings} label="Provider">
              <span 
                className="font-semibold flex items-center gap-2"
                style={{ color: providerMeta.color }}
              >
                {providerMeta.emoji} {providerMeta.label}
              </span>
            </Row>
          )}
          
          {s.meetingLink && (
            <Row icon={LinkIcon} label="Meeting Link">
              <a 
                href={s.meetingLink} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm !font-sach font-medium"
              >
                {s.meetingLink}
              </a>
            </Row>
          )}
          
          {s.hostUserId === currentUserId && (
            <Row icon={Shield} label="Role">
              <span className="text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                Host
              </span>
            </Row>
          )}
          
          {s.createdAt && (
            <Row icon={Clock} label="Created">
              {new Date(s.createdAt).toLocaleString()}
            </Row>
          )}
        </div>

        {/* Footer Actions */}
        {canJoin && (
          <div className="p-6 border-t border-slate-200 dark:border-zinc-700/70 bg-slate-50/70 dark:bg-zinc-950/25">
            <button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              onClick={handleJoin}
            >
              <span>🚀 Join Meeting</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 mt-0.5 text-slate-400 flex items-center justify-center shrink-0">
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <div className="text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
