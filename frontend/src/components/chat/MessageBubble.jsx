import { Check, CheckCheck } from 'lucide-react';
import { resolvePhotoUrl } from '../../utils/resolvePhotoUrl';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

function formatTime(timestamp) {
  return timestamp
    ? new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ReadTick({ status }) {
  if (status === 'READ') return <CheckCheck className="h-3.5 w-3.5 text-sky-500" strokeWidth={2.4} />;
  if (status === 'DELIVERED') return <CheckCheck className="h-3.5 w-3.5 text-orange-300" strokeWidth={2.4} />;
  return <Check className="h-3.5 w-3.5 text-orange-300" strokeWidth={2.4} />;
}

export default function MessageBubble({ message, isMine, showAvatar, showDate }) {
  return (
    <>
      {showDate && (
        <div className="my-3 text-center">
          <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-gray-500 shadow-sm dark:bg-zinc-800/90 dark:text-zinc-300 dark:shadow-black/30">
            {formatDate(message.sentAt)}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-xs font-bold text-orange-500 ${showAvatar ? 'visible' : 'invisible'}`}
          >
            {message.senderPhoto
              ? <img className="h-full w-full object-cover" src={resolvePhotoUrl(API, message.senderPhoto)} alt="" />
              : message.senderName?.[0]?.toUpperCase()}
          </div>
        )}

        <div className="max-w-[82%] sm:max-w-[70%]">
          <div className={`break-words px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
            isMine
              ? 'rounded-[18px] rounded-br-[5px] bg-orange-200 text-orange-950 dark:bg-orange-500 dark:text-white'
              : 'rounded-[18px] rounded-bl-[5px] border border-orange-100 bg-white text-gray-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
          }`}>
            {message.content}
          </div>
          <div className={`mt-1 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start pl-1'}`}>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">{formatTime(message.sentAt)}</span>
            {isMine && <ReadTick status={message.readStatus} />}
          </div>
        </div>
      </div>
    </>
  );
}
