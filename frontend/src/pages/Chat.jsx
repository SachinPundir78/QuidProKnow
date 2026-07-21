import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../api/chatService';
import { connect, disconnect, subscribe } from '../api/websocket';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function Chat() {
  const { roomId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [wsReady, setWsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const unsubPresence = useRef(null);

  // ── Load rooms ────────────────────────────────────────────────────────────
  const loadRooms = async () => {
    const data = await chatService.getRooms();
    setRooms(data);
    return data;
  };

  // ── Connect WebSocket and set up presence ─────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Load rooms first so sidebar renders quickly
        const data = await loadRooms();

        // Seed presence from REST
        const onlineIds = await chatService.presence();
        if (mounted) setOnlineUsers(new Set(onlineIds));

        // Connect WebSocket
        await connect(token);
        if (!mounted) return;

        setWsReady(true);

        // Subscribe to global presence channel
        unsubPresence.current = subscribe('/topic/presence', (event) => {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            if (event.status === 'ONLINE') next.add(event.userId);
            else next.delete(event.userId);
            return next;
          });
        });

        // If a roomId is in the URL, activate that room
        if (roomId) {
          const room = data.find(r => r.id === Number(roomId));
          if (room) setActiveRoom(room);
          else {
            // May be a new room not yet in the list - fetch it
            try {
              const fresh = await chatService.getRoom(Number(roomId));
              setActiveRoom(fresh);
            } catch { navigate('/chat'); }
          }
        }
      } catch (err) {
        console.error('Chat init failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      unsubPresence.current?.();
      disconnect();
    };
  }, []);

  // ── Activate room when URL changes ────────────────────────────────────────
  useEffect(() => {
    if (!roomId) { setActiveRoom(null); return; }
    const room = rooms.find(r => r.id === Number(roomId));
    if (room) setActiveRoom(room);
  }, [roomId, rooms]);

  const handleNewMessage = () => {
    loadRooms(); // Refresh sidebar to update last-message / unread count
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 overflow-hidden bg-[#f7f3ee] font-display md:rounded-xl md:border md:border-orange-100 md:shadow-sm dark:border-zinc-800 dark:bg-[#151515] dark:shadow-black/30">
      <ChatSidebar
        rooms={rooms}
        activeRoomId={activeRoom?.id}
        myId={user.id}
        onlineUsers={onlineUsers}
        loading={loading}
        isConversationOpen={Boolean(activeRoom)}
      />

      <div className={`chat-pane min-w-0 flex-1 flex-col bg-white dark:bg-[#1b1b1b] ${activeRoom ? 'flex' : 'chat-pane--no-conversation flex'}`}>
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-gray-400 dark:text-zinc-500">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-zinc-700" />
            <h3 className="font-display text-lg font-bold text-gray-700 dark:text-zinc-100">Select a chat</h3>
            <p className="max-w-[280px] text-center text-sm leading-relaxed font-display">
              Pick a conversation from the sidebar, or accept a session request to start one.
            </p>
          </div>
        ) : wsReady ? (
          <ChatWindow
            key={activeRoom.id}
            room={activeRoom}
            onlineUsers={onlineUsers}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-give" />
              <p className="text-xs text-gray-400">Connecting…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
