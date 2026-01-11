
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Share2, 
  MessageSquare, History, Info, Send, 
  Sparkles, ChevronRight, ExternalLink, 
  Facebook, Globe, Youtube, Radio
} from 'lucide-react';
import { Track, ChatMessage, PlayerState, GroundingSource } from './types';
import { askSpiritualCompanion } from './services/geminiService';
import Visualizer from './components/Visualizer';

const PRODUCTION_CONFIG = {
  STREAM_URL: "https://radioiqra.ice.infomaniak.ch/radioiqra-128.mp3",
  SOCIAL_LINKS: [
    { name: 'Site Web', icon: Globe, url: 'https://radioiqra.bf' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/radioiqrabf' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/user/radioiqrabf' },
  ],
  PROGRAMS: [
    { id: '1', time: '12:00', title: 'Sermon du Vendredi (Live)', duration: '45:00', isActive: true, link: '#' },
    { id: '2', time: '11:00', title: 'Lecture du Coran - Juz 15', duration: '60:00', link: 'https://archive.org/details/coran-iqra' },
    { id: '3', time: '10:00', title: 'Leçons de Vie Islamique', duration: '30:00', link: 'https://radioiqra.bf/replays/123' },
    { id: '4', time: '09:00', title: 'Émission Spéciale Jeunesse', duration: '45:00', link: '#' },
    { id: '5', time: '07:00', title: 'Invocations du Matin', duration: '30:00', link: 'https://www.youtube.com/watch?v=example' },
  ]
};

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.PAUSED);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playerState === PlayerState.PLAYING) {
      audioRef.current.pause();
      setPlayerState(PlayerState.PAUSED);
    } else {
      setError(null);
      audioRef.current.play().catch(e => {
        console.error("Playback Error:", e);
        setError("Erreur de connexion au flux.");
      });
      setPlayerState(PlayerState.PLAYING);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await askSpiritualCompanion(userMsg.text, history);
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text, 
        timestamp: new Date(),
        sources: response.sources as GroundingSource[]
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "La bibliothèque spirituelle est temporairement inaccessible.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-emerald-950 text-[#fcf8f1] flex flex-col md:flex-row overflow-hidden select-none">
      <audio 
        ref={audioRef} 
        src={PRODUCTION_CONFIG.STREAM_URL} 
        onPlay={() => setPlayerState(PlayerState.PLAYING)}
        onPause={() => setPlayerState(PlayerState.PAUSED)}
        crossOrigin="anonymous"
      />

      <main className={`flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-8 transition-all duration-700 overflow-y-auto ${showChat ? 'md:mr-[400px] lg:mr-[450px]' : ''}`}>
        
        {/* LECTEUR PRINCIPAL */}
        <div className="max-w-md w-full glass-panel rounded-[3.5rem] p-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden my-auto border border-amber-500/10">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10 text-center mb-8">
            <div className="inline-block relative">
              <div className={`absolute inset-0 bg-amber-400/10 rounded-full blur-3xl transition-all duration-1000 ${playerState === PlayerState.PLAYING ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
              <div className="w-52 h-52 md:w-60 md:h-60 rounded-full border-[6px] border-amber-500/30 p-2.5 overflow-hidden bg-emerald-900/50 shadow-2xl transform transition-all hover:scale-105 active:scale-95 duration-500 relative">
                <img 
                  src="https://i.postimg.cc/WzDp64wr/iqra-logo-ok.png" 
                  alt="Radio Iqra Logo" 
                  className="w-full h-full object-cover rounded-full filter brightness-110"
                />
                <button 
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-emerald-950/20 hover:bg-black/10 transition-colors"
                >
                  {playerState === PlayerState.PLAYING ? (
                    <Pause className="w-20 h-20 text-amber-400 fill-amber-400 drop-shadow-2xl" />
                  ) : (
                    <Play className="w-20 h-20 text-amber-400 fill-amber-400 ml-2 drop-shadow-2xl" />
                  )}
                </button>
              </div>
              
              {/* Badge LIVE avec style Or/Rouge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1.5 rounded-full border-2 border-amber-500 flex items-center gap-2 shadow-2xl animate-live-badge">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">En Direct</span>
              </div>
            </div>
            
            <h1 className="mt-10 text-3xl font-black tracking-tight text-amber-50 drop-shadow-md">RADIO IQRA BF</h1>
            <p className="text-amber-500 font-black text-xs tracking-[0.3em] mt-2 opacity-90 uppercase">96.1 MHz • Ouagadougou</p>
          </div>

          <div className="mb-8 h-12">
            <Visualizer isPlaying={playerState === PlayerState.PLAYING} />
          </div>

          <div className="flex flex-col gap-8 relative z-10">
            {error && <div className="bg-red-950/60 border border-red-500/40 text-red-200 text-[10px] py-2 px-4 rounded-xl text-center uppercase tracking-widest">{error}</div>}

            <div className="flex items-center justify-between gap-6 px-4">
              <button onClick={() => { setIsMuted(!isMuted); if(audioRef.current) audioRef.current.muted = !isMuted; }} className="text-amber-500 hover:text-amber-400 transition-colors">
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>
              <input 
                type="range" min="0" max="100" value={isMuted ? 0 : volume} 
                onChange={(e) => { const v = parseInt(e.target.value); setVolume(v); if(audioRef.current) audioRef.current.volume = v/100; }}
                className="flex-1 h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <button onClick={() => navigator.share?.({title:'Iqra', url: window.location.href})} className="text-amber-500 hover:text-amber-400 transition-colors">
                <Share2 className="w-7 h-7" />
              </button>
            </div>

            <div className="bg-amber-500/5 rounded-[2rem] p-6 border border-amber-500/10 shadow-inner group transition-all hover:bg-amber-500/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Radio className="w-7 h-7 text-amber-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] uppercase font-black text-amber-500 mb-1 tracking-widest opacity-80">À l'antenne maintenant</p>
                  <p className="font-bold text-amber-50 truncate text-xl">Le Saint Coran</p>
                  <p className="text-xs text-amber-200/50 font-medium italic">Diffusé sur tout le Burkina</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIENS & PROGRAMMATION (PRODUCTION) */}
        {!showChat && (
          <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-16">
            <div className="grid grid-cols-3 gap-5 px-2">
              {PRODUCTION_CONFIG.SOCIAL_LINKS.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" 
                  className="flex flex-col items-center gap-3 p-5 rounded-[2.5rem] glass-panel border border-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500 hover:text-emerald-950 hover:scale-105 transition-all group shadow-xl">
                  <link.icon className="w-8 h-8 text-amber-400 group-hover:text-emerald-950" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="px-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-amber-500" />
                  <h2 className="font-black text-amber-100 text-[11px] uppercase tracking-[0.3em]">Programmes & Replays</h2>
                </div>
                <div className="h-px flex-1 bg-amber-500/10 ml-4" />
              </div>
              <div className="space-y-4">
                {PRODUCTION_CONFIG.PROGRAMS.map(track => (
                  <a key={track.id} href={track.link} target={track.link !== '#' ? "_blank" : undefined}
                    className={`flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-300 ${track.isActive ? 'glass-panel border-amber-500/40 shadow-2xl' : 'bg-emerald-900/10 border-transparent hover:bg-amber-500/5 hover:border-amber-500/10'}`}>
                    <span className="text-[11px] font-black text-amber-500 w-12 text-center bg-amber-500/5 py-1 rounded-lg">{track.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${track.isActive ? 'text-white' : 'text-emerald-100/60'}`}>{track.title}</p>
                    </div>
                    {track.link !== '#' && <ExternalLink className="w-4 h-4 text-amber-500/40" />}
                    {track.isActive && <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_#d4af37]" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COMPAGNON IA SIDEBAR */}
      <aside className={`fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[450px] bg-emerald-950/98 backdrop-blur-3xl border-l border-amber-500/10 shadow-2xl transition-transform duration-700 ease-out z-50 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-amber-500/10 flex items-center justify-between bg-emerald-900/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 border border-amber-200/50">
              <Sparkles className="w-8 h-8 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-black text-2xl leading-none text-amber-50 tracking-tighter">Compagnon</h3>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-1.5 opacity-80">Éclat Spirituel • Gemini IA</p>
            </div>
          </div>
          <button onClick={() => setShowChat(false)} className="p-3 hover:bg-amber-500 hover:text-emerald-950 rounded-full transition-all text-amber-500">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin">
          {chatMessages.length === 0 && (
            <div className="text-center py-24 space-y-8 opacity-40">
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                 <Sparkles className="w-20 h-20 text-amber-500 mx-auto animate-pulse relative z-10" />
              </div>
              <div className="space-y-3">
                <h4 className="font-black uppercase tracking-widest text-lg italic text-amber-100">Paix sur vous</h4>
                <p className="text-[11px] max-w-[250px] mx-auto font-semibold leading-relaxed text-amber-200/60 uppercase">Interrogez l'IA sur les enseignements, l'histoire d'Iqra ou demandez une traduction.</p>
              </div>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[88%] p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-xl ${msg.role === 'user' ? 'bg-amber-500 text-emerald-950 font-bold rounded-tr-none' : 'bg-emerald-900/60 border border-amber-500/20 text-amber-50 rounded-tl-none'}`}>
                {msg.text}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-amber-500/10 flex flex-col gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/70">Références Sources</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, idx) => s.web && (
                        <a key={idx} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-950/80 hover:bg-amber-500 hover:text-emerald-950 px-4 py-2 rounded-full text-[10px] font-black transition-all border border-amber-500/20 shadow-lg">
                          <ExternalLink className="w-3.5 h-3.5" /> {s.web.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-emerald-900/40 p-6 rounded-[2.5rem] rounded-tl-none border border-amber-500/10">
                <div className="flex gap-2.5">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-10 bg-emerald-900/40 border-t border-amber-500/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSendMessage} className="relative group">
            <input 
              type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              placeholder="Échangez avec le compagnon..."
              className="w-full bg-emerald-950/80 border-2 border-amber-900/50 group-focus-within:border-amber-500/50 rounded-[2rem] py-6 pl-8 pr-16 focus:outline-none transition-all placeholder:text-amber-900 font-bold text-sm text-amber-50"
            />
            <button 
              type="submit" disabled={!chatInput.trim() || isTyping}
              className="absolute right-3.5 top-3.5 bottom-3.5 w-14 bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-900/50 disabled:text-amber-900 rounded-2xl transition-all flex items-center justify-center text-emerald-950 shadow-2xl hover:scale-105 active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <p className="text-[9px] text-center text-amber-800 font-black uppercase mt-6 tracking-[0.4em] opacity-60">IA Spirituelle • Radio Iqra BF</p>
        </div>
      </aside>

      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="md:hidden fixed bottom-8 right-8 w-18 h-18 bg-amber-500 text-emerald-950 rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(212,175,55,0.4)] z-40 transform hover:scale-110 active:scale-90 transition-all border-4 border-emerald-950"
        >
          <Sparkles className="w-9 h-9" />
        </button>
      )}
    </div>
  );
};

export default App;
