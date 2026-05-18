import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, SkipForward, Users, Globe, User } from 'lucide-react';

export default function RandomFanConnect({ socket, isJoined, onRequireLogin }) {
  const [status, setStatus] = useState('idle'); // idle, searching, connected
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    socket.on('match_found', async ({ initiator, partnerName }) => {
      setStatus('connected');
      setPartnerName(partnerName);
      setupPeerConnection(initiator);
    });

    socket.on('partner_left', () => {
      handleStop();
      // Optionally auto-search again
      // handleFindMatch();
    });

    socket.on('webrtc_offer', async (offer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('webrtc_answer', answer);
    });

    socket.on('webrtc_answer', async (answer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc_ice_candidate', async (candidate) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    return () => {
      socket.off('match_found');
      socket.off('partner_left');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
    };
  }, [socket]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert("Please allow camera and microphone access to use this feature.");
    }
  };

  const setupPeerConnection = (initiator) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ]
    };
    
    peerConnection.current = new RTCPeerConnection(configuration);
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    }

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', event.candidate);
      }
    };

    if (initiator) {
      peerConnection.current.createOffer()
        .then(offer => peerConnection.current.setLocalDescription(offer))
        .then(() => {
          socket.emit('webrtc_offer', peerConnection.current.localDescription);
        });
    }
  };

  const handleFindMatch = async () => {
    if (!isJoined) {
      onRequireLogin();
      return;
    }
    
    if (!localStream.current) {
      await startLocalVideo();
    }
    
    if (localStream.current) {
      setStatus('searching');
      socket.emit('find_match');
    }
  };

  const handleStop = () => {
    socket.emit('leave_match');
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setPartnerName('');
    setStatus('idle');
  };

  const handleNext = () => {
    handleStop();
    handleFindMatch();
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Live Fan Connect
        </h3>
        {status === 'searching' && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            Searching...
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Main View Area */}
        <div className="relative flex-1 bg-background rounded-xl overflow-hidden border border-border flex items-center justify-center">
          
          {/* Remote Video */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'connected' ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* IDLE UI - Highly Impressive */}
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-surface to-background p-6">
              {/* Background animated circles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-[300px] h-[300px] border border-primary/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
                <div className="absolute w-[200px] h-[200px] border border-primary/40 rounded-full animate-[ping_2s_linear_infinite]"></div>
              </div>
              
              <div className="z-10 text-center">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-surface border-2 border-primary/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(31,128,224,0.3)]">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                  <div className="w-16 h-16 bg-surface border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-500 font-bold">?</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Face-to-Face with Real Fans</h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto mb-8">
                  Argue about that last wicket, celebrate boundaries, and share the hype in real-time.
                </p>
                
                <button 
                  onClick={handleFindMatch}
                  className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(31,128,224,0.4)] flex items-center gap-2 mx-auto"
                >
                  <Video className="w-5 h-5" /> START VIDEO CHAT
                </button>
              </div>
            </div>
          )}
          
          {/* SEARCHING UI */}
          {status === 'searching' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 backdrop-blur">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white animate-pulse mb-1">Scanning the globe...</h3>
              <p className="text-sm text-text-muted">Looking for another fan to connect.</p>
            </div>
          )}

          {status === 'connected' && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-xs font-medium text-white border border-border flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-secondary animate-soft-pulse"></div>
              {partnerName || 'Fan'}
            </div>
          )}

          {/* Local Video Picture-in-Picture */}
          <div className={`absolute bottom-4 right-4 w-1/3 aspect-video bg-black rounded overflow-hidden border border-border shadow-2xl transition-all duration-300 ${status === 'idle' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover -scale-x-100"
            />
          </div>
        </div>

        {/* Controls (Only show when not idle) */}
        {status !== 'idle' && (
          <div className="flex justify-center gap-3 bg-surface p-2 rounded-lg border border-border">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-background hover:bg-surface-hover text-white'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-background hover:bg-surface-hover text-white'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-background hover:bg-surface-hover text-white border border-border rounded font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <SkipForward className="w-4 h-4" /> Skip
            </button>
            <button 
              onClick={handleStop}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors text-sm"
            >
              End
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
