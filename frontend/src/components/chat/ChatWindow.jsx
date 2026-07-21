import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, ImagePlus, Palette, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { FaMusic } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../api/chatService';
import { publish, subscribe } from '../../api/websocket';
import { resolvePhotoUrl } from '../../utils/resolvePhotoUrl';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import OnlineStatus from './OnlineStatus';

const API = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
const PUBLIC_TRACKS = Object.entries(import.meta.glob('../../public/*.{mp3,wav,ogg,m4a,aac,flac}', { eager: true, query: '?url', import: 'default' }))
  .map(([path, src]) => ({
    src,
    title: path.split('/').pop().replace(/\.[^/.]+$/, ''),
  }));

export default function ChatWindow({ room, onlineUsers, onNewMessage }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [isMusicPanelOpen, setIsMusicPanelOpen] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [wallpaperUrl, setWallpaperUrl] = useState('');
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const audioRef = useRef(null);
  const wallpaperInputRef = useRef(null);
  const resumeAfterTrackChange = useRef(false);

  const otherId = room.user1Id === user.id ? room.user2Id : room.user1Id;
  const otherName = room.user1Id === user.id ? room.user2Name : room.user1Name;
  const otherPhoto = room.user1Id === user.id ? room.user2Photo : room.user1Photo;
  const isOnline = onlineUsers.has(otherId);

  useEffect(() => {
    chatService.getMessages(room.id).then(setMessages);
    chatService.markRead(room.id)
      .then(() => onNewMessage?.())
      .catch(() => {});
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  useEffect(() => {
    const unsubscribe = subscribe(`/topic/chat/${room.id}`, (message) => {
      setMessages(previous => previous.some(item => item.id === message.id) ? previous : [...previous, message]);
      if (message.senderId !== user.id) {
        chatService.markRead(room.id)
          .then(() => onNewMessage?.())
          .catch(() => {});
      } else {
        onNewMessage?.();
      }
    });
    const unsubscribeRead = subscribe(`/topic/chat/${room.id}/read`, () => {
      setMessages(previous => previous.map(message => message.senderId === user.id ? { ...message, readStatus: 'READ' } : message));
    });
    return () => { unsubscribe(); unsubscribeRead(); };
  }, [room.id, user.id, onNewMessage]);

  useEffect(() => {
    const unsubscribe = subscribe(`/topic/chat/${room.id}/typing`, (event) => {
      if (event.userId !== user.id) {
        setTypingUser(event.typing ? event.userName : null);
      }
    });

    return () => unsubscribe();
  }, [room.id, user.id]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  useEffect(() => {
    setWallpaperUrl(localStorage.getItem(`chat-wallpaper-${room.id}`) || '');
  }, [room.id]);

  const sendTyping = useCallback((typing) => {
    publish('/app/chat.typing', { roomId: room.id, userId: user.id, userName: user.name, typing });
  }, [room.id, user.id, user.name]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (!isTyping.current) { isTyping.current = true; sendTyping(true); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { isTyping.current = false; sendTyping(false); }, 3000);
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    clearTimeout(typingTimer.current);
    isTyping.current = false;
    sendTyping(false);
    setInput('');
    publish('/app/chat.sendMessage', { roomId: room.id, senderId: user.id, receiverId: otherId, content, messageType: 'TEXT' });
    setSending(false);
  };

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleWallpaperUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setWallpaperUrl(image);
      localStorage.setItem(`chat-wallpaper-${room.id}`, image);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeWallpaper = () => {
    setWallpaperUrl('');
    localStorage.removeItem(`chat-wallpaper-${room.id}`);
  };

  const togglePlayback = async () => {
    if (!audioRef.current || !musicUrl) return;
    if (audioRef.current.paused) {
      try { await audioRef.current.play(); } catch { setIsPlaying(false); }
    } else {
      audioRef.current.pause();
    }
  };

  const changeTrack = (direction, shouldResume = Boolean(audioRef.current && !audioRef.current.paused)) => {
    if (PUBLIC_TRACKS.length === 0) return;
    resumeAfterTrackChange.current = shouldResume;
    setTrackIndex(index => (index + direction + PUBLIC_TRACKS.length) % PUBLIC_TRACKS.length);
    setCurrentTime(0);
    setDuration(0);
  };

  const activeTrack = PUBLIC_TRACKS[trackIndex];
  const musicUrl = activeTrack?.src || '';
  const musicTitle = activeTrack?.title || 'No tracks found';

  const enriched = messages.map((message, index) => ({
    ...message,
    showAvatar: index === 0 || messages[index - 1]?.senderId !== message.senderId,
    showDate: index === 0 || message.sentAt?.slice(0, 10) !== messages[index - 1]?.sentAt?.slice(0, 10),
  }));

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#efeae2] dark:bg-[#171717]">
      <header className="z-10 flex items-center gap-3 border-b border-orange-100 bg-white px-3 py-3 shadow-sm dark:border-zinc-800 dark:bg-[#1d1d1d] dark:shadow-black/20 md:px-5">
        <button type="button" onClick={() => navigate('/chat')} aria-label="Back to chats" className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-orange-50 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-orange-100 bg-orange-50 font-bold text-orange-500 dark:border-orange-500/20 dark:bg-orange-500/10">
            {otherPhoto ? <img src={resolvePhotoUrl(API, otherPhoto)} alt={otherName} className="h-full w-full object-cover" /> : otherName?.[0]?.toUpperCase()}
          </div>
          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
        </div>
        <div className="min-w-0"><div className="truncate text-sm font-bold text-gray-900 dark:text-zinc-100">{otherName}</div><OnlineStatus isOnline={isOnline} showLabel /></div>
        <div className="relative ml-auto flex items-center gap-1">
          <button type="button" onClick={() => { setIsThemePanelOpen(open => !open); setIsMusicPanelOpen(false); }} aria-label="Open chat theme controls" aria-expanded={isThemePanelOpen} className={`flex h-10 w-10 items-center justify-center rounded-full transition ${isThemePanelOpen || wallpaperUrl ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-300'}`}>
            <Palette className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => { setIsMusicPanelOpen(open => !open); setIsThemePanelOpen(false); }} aria-label="Open music player" aria-expanded={isMusicPanelOpen} className={`flex h-10 w-10 items-center justify-center rounded-full transition ${isMusicPanelOpen || isPlaying ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-orange-300'}`}>
            <FaMusic className="h-[18px] w-[18px]" />
          </button>

          {isThemePanelOpen && (
            <section className="absolute right-11 top-12 z-30 w-72 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl shadow-orange-950/10 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60"><div><p className="mb-0 text-sm font-bold text-gray-900 dark:text-white">Chat theme</p><p className="mb-0 text-[11px] text-gray-500 dark:text-zinc-400">Personalize your chat background</p></div><button type="button" onClick={() => setIsThemePanelOpen(false)} aria-label="Close theme controls" className="rounded-full p-1 text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-zinc-700 dark:hover:text-white"><X className="h-4 w-4" /></button></div>
              <div className="p-4"><div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"><ImagePlus className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs font-bold text-gray-800 dark:text-zinc-100">Chat wallpaper</span><span className="block truncate text-[10px] text-gray-500 dark:text-zinc-400">{wallpaperUrl ? 'Custom image applied' : 'Use a photo from your device'}</span></span></div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => wallpaperInputRef.current?.click()} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-orange-600 shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-50 dark:bg-zinc-800 dark:ring-zinc-700">Upload</button>{wallpaperUrl && <button type="button" onClick={removeWallpaper} aria-label="Remove wallpaper" className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-rose-500 dark:hover:bg-zinc-800"><X className="h-3.5 w-3.5" /></button>}</div></div></div>
            </section>
          )}

          {isMusicPanelOpen && (
            <section className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-700 bg-[#202124] text-white shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-zinc-700 bg-[#202124] px-4 py-3">
                <div><p className="mb-0 text-sm font-bold text-white">Background music</p><p className="mb-0.5 text-[11px] text-zinc-400">Tracks from the public folder</p></div>
                <button type="button" onClick={() => setIsMusicPanelOpen(false)} aria-label="Close controls" className="rounded-full p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white"><X className="h-4 w-4" /></button>
              </div>

              <div className="p-4">
                <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-[#1d1d21] via-[#171719] to-[#101012] p-3.5 shadow-inner shadow-black/30">
                  <div className="mb-3 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#070a10] text-orange-500 shadow-md shadow-black/50"><FaMusic className="h-5 w-5" /></span><div className="min-w-0"><p className="mb-0 truncate text-xs font-bold text-white">{musicTitle}</p><p className="mb-0 text-[10px] text-orange-200/70">{PUBLIC_TRACKS.length ? `${trackIndex + 1} of ${PUBLIC_TRACKS.length} · Playing only for you` : 'Add audio files to src/public'}</p></div></div>
                  {musicUrl ? <><input aria-label="Music progress" type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={event => { const time = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = time; setCurrentTime(time); }} className="h-1.5 w-full cursor-pointer accent-orange-500" /><div className="mt-1 flex justify-between text-[10px] font-medium text-orange-200/70"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div><div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => changeTrack(-1)} aria-label="Previous track" className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-orange-500"><SkipBack className="h-4 w-4 fill-current" /></button><button type="button" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); } }} aria-label="Restart track" className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-orange-500"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause music' : 'Play music'} className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600">{isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}</button><button type="button" onClick={() => changeTrack(1)} aria-label="Next track" className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-orange-500"><SkipForward className="h-4 w-4 fill-current" /></button><div className="flex items-center gap-1.5 text-zinc-400"><button type="button" onClick={() => setVolume(value => value > 0 ? 0 : 0.65)} aria-label="Mute music">{volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button><input aria-label="Music volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} className="w-12 accent-orange-500" /></div></div></> : <p className="mb-0 rounded-lg bg-zinc-900 px-3 py-2 text-center text-xs text-zinc-400">No audio tracks are available.</p>}
                </div>
              </div>
            </section>
          )}
          <input ref={wallpaperInputRef} type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
        </div>
      </header>

      <audio ref={audioRef} src={musicUrl || undefined} volume={volume} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => changeTrack(1, true)} onLoadedMetadata={async event => { setDuration(event.currentTarget.duration); if (resumeAfterTrackChange.current) { resumeAfterTrackChange.current = false; try { await event.currentTarget.play(); } catch { setIsPlaying(false); } } }} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} />

      <div className={`flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto px-3 py-4 md:px-5 ${wallpaperUrl ? 'bg-cover bg-center bg-no-repeat' : 'bg-[#efeae2] bg-[radial-gradient(rgba(249,115,22,0.07)_1px,transparent_1px)] bg-[size:18px_18px] dark:bg-[#151515] dark:bg-[radial-gradient(rgba(249,115,22,0.1)_1px,transparent_1px)]'}`} style={wallpaperUrl ? { backgroundImage: `url("${wallpaperUrl}")` } : undefined}>
        {messages.length === 0 && <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-gray-400"><span className="text-3xl">👋</span><h3 className="mb-0 text-sm font-bold text-gray-700">Say hello to {otherName}!</h3><p className="mb-0 max-w-[240px] text-[11px]">This chat was created for your session.</p></div>}
        {enriched.map((message, index) => <MessageBubble key={message.id ?? `temp-${index}`} message={message} isMine={message.senderId === user.id} showAvatar={message.showAvatar} showDate={message.showDate} />)}
        <TypingIndicator name={typingUser} />
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-orange-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-zinc-800 dark:bg-[#1d1d1d] md:px-5">
        <textarea value={input} onChange={handleInputChange} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="Type a message" rows={1} className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-[22px] border border-orange-100 bg-orange-50/60 px-4 py-2.5 text-sm leading-normal focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-orange-500 dark:focus:bg-zinc-900 dark:focus:ring-orange-500/15" onInput={event => { event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`; }} />
        <button onClick={handleSend} disabled={!input.trim() || sending} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-400 text-white shadow-md shadow-orange-200 transition hover:bg-orange-500 dark:shadow-orange-950/30 disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
