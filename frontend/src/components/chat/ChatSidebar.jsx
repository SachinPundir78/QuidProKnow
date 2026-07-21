import { useNavigate } from 'react-router-dom';
import { resolvePhotoUrl } from '../../utils/resolvePhotoUrl';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

function formatLastMsg(room, myId) {
  if (!room.lastMessage) return 'No messages yet';
  const mine = room.lastMessage.senderId === myId;
  const text = room.lastMessage.content;
  return (mine ? 'You: ' : '') + (text.length > 40 ? text.slice(0, 40) + '…' : text);
}

export default function ChatSidebar({ rooms, activeRoomId, myId, onlineUsers, loading, isConversationOpen }) {
  const navigate = useNavigate();
  const formatMessageTime = (message) => {
    if (!message?.sentAt) return '';
    const date = new Date(message.sentAt);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className={`chat-sidebar ${isConversationOpen ? 'chat-sidebar--conversation-open' : ''} flex w-[320px] shrink-0 flex-col border-r border-orange-100 bg-white dark:border-zinc-800 dark:bg-[#181818]`}>
      <div className="border-b border-orange-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <h3 className="mb-0 font-display text-lg font-bold text-gray-900 dark:text-zinc-100">Chats</h3>
          <p className="mb-0 mt-0.5 text-[12px] font-medium text-gray-500 dark:text-zinc-500">Your conversations</p>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading && <p className="text-xs text-gray-400 p-4 animate-pulse">Loading…</p>}
        {!loading && rooms.length === 0 && (
          <div className="p-5 text-gray-400 text-sm text-center leading-relaxed font-display">
            No chats yet. Accept a session request to start chatting.
          </div>
        )}
        {rooms.map(room => {
          const otherId = room.user1Id === myId ? room.user2Id : room.user1Id;
          const otherName = room.user1Id === myId ? room.user2Name : room.user1Name;
          const otherPhoto = room.user1Id === myId ? room.user2Photo : room.user1Photo;
          const isOnline = onlineUsers.has(otherId);
          const isActive = room.id === activeRoomId;

          return (
            <div 
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className={`flex min-h-[72px] items-center gap-3 border-l-[3px] px-4 py-3.5 transition-colors ${
                isActive 
                  ? 'border-orange-400 bg-orange-50/80 dark:bg-orange-500/10' 
                  : 'border-transparent hover:bg-orange-50/50 dark:hover:bg-zinc-800/80'
              }`}
            >
              {/* Avatar with presence dot */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-give-bg text-give flex items-center justify-center overflow-hidden text-base font-bold border border-give/10">
                  {otherPhoto ? (
                    <img 
                      src={resolvePhotoUrl(API, otherPhoto)} 
                      alt={otherName}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    otherName?.[0]?.toUpperCase()
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-600' : 'bg-gray-300'
                }`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate pr-1 text-sm font-bold text-gray-900 dark:text-zinc-100">{otherName}</span>
                  <span className={`shrink-0 text-[10px] font-semibold ${room.unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-zinc-500'}`}>{formatMessageTime(room.lastMessage)}</span>
                </div>
                <div className="mt-0.5 flex min-w-0 items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-zinc-400">
                    {formatLastMsg(room, myId)}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="flex h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
