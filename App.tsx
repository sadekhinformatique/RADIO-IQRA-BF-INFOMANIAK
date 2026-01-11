
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Share2, 
  Users, 
  MessageSquare, 
  History, 
  Info,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Facebook,
  Globe,
  Youtube
} from 'lucide-react';
import { Track, ChatMessage, PlayerState, GroundingSource } from './types';
import { askSpiritualCompanion } from './services/geminiService';
import Visualizer from './components/Visualizer';

/** 
 * CONFIGURATION DE PRODUCTION 
 * Modifiez ces constantes pour rendre l'application productive.
 */
const PRODUCTION_CONFIG = {
  // 1. Lien direct du flux audio (Icecast/Infomaniak)
  STREAM_URL: "https://radioiqra.ice.infomaniak.ch/radioiqra-128.mp3",
  
  // 2. Liens vers les réseaux sociaux et site officiel
  QUICK_LINKS: [
    { name: 'Site Web', icon: Globe, url: 'https://radioiqra.bf' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/radioiqrabf' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/user/radioiqrabf' },
  ],

  // 3. Programmation et Playlists (Remplacez par vos données réelles ou API)
  // Le champ 'link' peut pointer vers un replay YouTube ou un podcast.
  PLAYLIST_DATA: [
    { id: '1', time: '11:53', title: 'Quand on doit reprendre...', duration: '20:00', isActive: true, link: '#' },
    { id: '2', time: '11:28', title: 'Être content de ce qu\'on a', duration: '25:00', link: 'https://www.youtube.com/watch?v=REEL_ID' },
    { id: '3', time: '07:49', title: 'Le partage de monde', duration: '15:00', link: 'https://radioiqra.bf/podcasts/3' },
    { id: '4', time: '07:32', title: 'Ne déshonorez pas les parents', duration: '10:00', link: '#' },
    { id: '5', time: '06:15', title: 'Lecture du Saint Coran', duration: '60:00', link: 'https://archive.org/details/coran-iqra' },
  ]
};

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.PAUSED);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const togglePlay = () => {
    if (playerState === PlayerState.PLAYING) {
      audioRef.current?.pause();
      setPlayerState(PlayerState.PAUSED);
    } else {
      audioRef.current?.play().catch(e => console.error("Playback failed", e));
      setPlayerState(PlayerState.PLAYING);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume / 100;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
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
      
      const aiMsg: ChatMessage = { 
        role: 'model', 
        text: response.text, 
        timestamp: new Date(),
        sources: response.sources as GroundingSource[]
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "Désolé, je rencontre une difficulté technique. Réessayez dans un instant.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-white flex flex-col md:flex-row overflow-hidden">
      <audio 
        ref={audioRef} 
        src={PRODUCTION_CONFIG.STREAM_URL} 
        onPlay={() => setPlayerState(PlayerState.PLAYING)}
        onPause={() => setPlayerState(PlayerState.PAUSED)}
      />

      {/* Section Lecteur Principal */}
      <main className={`flex-1 flex flex-col items-center justify-start md:justify-center p-6 transition-all duration-500 overflow-y-auto ${showChat ? 'md:w-1/2 lg:w-2/3' : 'w-full'}`}>
        <div className="max-w-md w-full bg-emerald-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 text-center mb-8">
            <div className="inline-block relative group">
              <div className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-xl transition-all duration-700 ${playerState === PlayerState.PLAYING ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`} />
              <div className="w-56 h-56 rounded-full border-4 border-emerald-500/30 p-2 overflow-hidden bg-emerald-800 shadow-inner group-hover:scale-105 transition-transform">
                <img 
                  src="https://i.postimg.cc/WzDp64wr/iqra-logo-ok.png" 
                  alt="Radio Iqra Logo" 
                  className="w-full h-full object-cover rounded-full"
                />
                <button 
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors"
                >
                  {playerState === PlayerState.PLAYING ? (
                    <Pause className="w-16 h-16 text-emerald-400 fill-emerald-400 drop-shadow-lg" />
                  ) : (
                    <Play className="w-16 h-16 text-emerald-400 fill-emerald-400 ml-2 drop-shadow-lg" />
                  )}
                </button>
              </div>
            </div>
            
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-emerald-50">RADIO IQRA BF</h1>
            <p className="text-emerald-400 font-medium flex items-center justify-center gap-2 mt-1">
              96.1 MHZ <span className="text-emerald-600">|</span> LA VOIX DU SAINT CORAN
            </p>
          </div>

          <div className="mb-8 px-4">
            <Visualizer isPlaying={playerState === PlayerState.PLAYING} />
          </div>

          <div className="flex flex-col gap-6 z-10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 px-4">
                <button onClick={toggleMute} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-all ${showChat ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-400 hover:bg-emerald-800'}`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-0.5">En Direct</p>
                  <p className="font-semibold truncate">Sermon de Vendredi</p>
                  <p className="text-sm text-emerald-400/70 truncate">Direct de Ouagadougou</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liens et Programmation (Production) */}
        {!showChat && (
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Boutons Liens Directs */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                <Info className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-emerald-50 text-sm uppercase tracking-wider">Liens Officiels</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PRODUCTION_CONFIG.QUICK_LINKS.map((link) => (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/10 hover:bg-emerald-500/20 transition-all group shadow-sm"
                  >
                    <link.icon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100/60">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Liste Programmation / Playlists */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-2">
                <History className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-emerald-50 text-sm uppercase tracking-wider">Programmes & Replays</h2>
              </div>
              <div className="space-y-3">
                {PRODUCTION_CONFIG.PLAYLIST_DATA.map(track => (
                  <a 
                    key={track.id} 
                    href={track.link}
                    target={track.link !== '#' ? "_blank" : undefined}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${track.isActive ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg' : 'bg-emerald-900/10 border-transparent hover:bg-emerald-900/30 hover:border-emerald-500/10'}`}
                  >
                    <span className="text-sm font-mono text-emerald-500 w-12">{track.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${track.isActive ? 'text-white' : 'text-emerald-100/60'}`}>{track.title}</p>
                    </div>
                    {track.link !== '#' && <ExternalLink className="w-4 h-4 text-emerald-500/50" />}
                    {track.isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar IA */}
      <aside className={`fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[450px] bg-emerald-900/95 backdrop-blur-2xl border-l border-emerald-500/20 transform transition-transform duration-500 ease-out z-50 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Compagnon Spirituel</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">IA Gemini Intelligente <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /></p>
            </div>
          </div>
          <button onClick={() => setShowChat(false)} className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-700">
          {chatMessages.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="font-semibold text-emerald-50">Posez vos questions</h4>
              <p className="text-sm text-emerald-400/70 max-w-[250px] mx-auto">
                L'IA peut vous aider à comprendre les thèmes abordés à l'antenne ou vous fournir des références religieuses.
              </p>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/40' : 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-50 rounded-tl-none'}`}>
                {msg.text}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Sources :</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        source.web && (
                          <a 
                            key={idx} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-emerald-900/40 hover:bg-emerald-800 px-2 py-1 rounded text-[10px] text-emerald-300 transition-colors border border-emerald-500/10"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{source.web.title}</span>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-emerald-950/60 border border-emerald-500/20 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-emerald-950/40 border-t border-emerald-500/10">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Échangez avec le compagnon..."
              className="w-full bg-emerald-900/60 border border-emerald-500/20 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>

      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl z-40 animate-bounce"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default App;
