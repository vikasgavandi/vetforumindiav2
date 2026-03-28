import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Paperclip, Send, MoreHorizontal, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';

export const VideoRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([
      {sender: 'System', text: 'Welcome to the consultation room! Video encrypted end-to-end.', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
  ]);
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchAppointmentInfo = async () => {
          try {
              const token = localStorage.getItem('auth_token');
              const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (data.success) {
                  setConsultation(data.data);
              }
          } catch(error) {
              console.error('Failed to load consultation room context', error);
          } finally {
              setLoading(false);
          }
      };
      if (id) {
         fetchAppointmentInfo();
      }
  }, [id]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate getting media stream
    if (isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Media error:", err));
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isVideoOn]);

  const handleEndCall = () => {
    if (window.confirm("End this consultation?")) {
        navigate('/consultations');
    }
  };

  const handleSendMessage = () => {
      if(!chatMessage.trim()) return;
      setMessages([...messages, {sender: 'You', text: chatMessage, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]);
      setChatMessage('');
  };

  if (loading) return <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center text-white"><span className="animate-pulse">Connecting to secure room...</span></div>;
  if (!consultation) return <div className="p-8 text-center bg-[#0f172a] text-white min-h-screen">Consultation not found or access denied.</div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 text-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div>
              <h2 className="font-bold text-lg">
                  {user?.role === 'veterinarian' || user?.role === 'admin'
                      ? `Patient: ${consultation.patient?.firstName} ${consultation.patient?.lastName}` 
                      : `Dr. ${consultation.doctor?.name}`}
              </h2>
              <p className="text-xs text-slate-400">Consultation ID: {id}</p>
          </div>
          <div className="flex gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-mono">00:14:23</span>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
          {/* Main Video Stage */}
          <div className="flex-1 p-4 relative flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              {/* Remote Stream Placeholder */}
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-2xl">
                  <img 
                      src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2532&auto=format&fit=crop" 
                      alt="Doctor" 
                      className="w-full h-full object-cover"
                  />
                  
                  {/* Floating Controls */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl flex items-center gap-4 border border-white/10 shadow-xl">
                        <button 
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-slate-600/50 hover:bg-slate-500' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button 
                            onClick={() => setIsVideoOn(!isVideoOn)}
                            className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-slate-600/50 hover:bg-slate-500' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                        <button 
                            onClick={handleEndCall}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/30"
                        >
                            <PhoneOff size={24} />
                            <span>End</span>
                        </button>
                        <button className="p-4 rounded-full bg-slate-600/50 hover:bg-slate-500 transition-all">
                             <MoreHorizontal size={24} />
                        </button>
                  </div>
              </div>

              {/* Local PiP */}
              <div className="absolute bottom-8 right-8 w-64 h-48 bg-black rounded-xl overflow-hidden border-2 border-slate-700/50 shadow-2xl">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">Camera Off</div>}
              </div>
          </div>

          {/* Right Chat Panel */}
          <div className="w-96 bg-slate-800/50 backdrop-blur-xl border-l border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10">
                  <h3 className="font-bold text-white">Messages</h3>
                  <p className="text-xs text-slate-400">Messages are securely encrypted</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-center text-xs text-slate-500 my-4">Today</div>
                  
                  {messages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                          {msg.sender !== 'You' && (
                              <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px]">{msg.sender[0]}</div>
                                  <span className="text-[10px] text-slate-400">{msg.sender}</span>
                              </div>
                          )}
                          <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                              msg.sender === 'You' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                : 'bg-slate-700 text-slate-200 rounded-tl-sm'
                          }`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10">
                  <div className="bg-slate-700/50 rounded-full flex items-center px-4 py-2 border border-white/5">
                      <button className="text-slate-400 hover:text-white mr-2">
                          <Paperclip size={18} />
                      </button>
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type something..."
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-400"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="text-indigo-400 hover:text-indigo-300 ml-2"
                      >
                          <Send size={18} />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};