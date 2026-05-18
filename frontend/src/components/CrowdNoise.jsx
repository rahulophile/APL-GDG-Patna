import React, { useState, useEffect } from 'react';
import { Mic2, MapPin, Activity } from 'lucide-react';

export default function CrowdNoise() {
  const [isRecording, setIsRecording] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [userCity, setUserCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setNoiseLevel(Math.random() * 100);
      }, 500);
    } else {
      setNoiseLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.state || 'Your City';
              setUserCity(city);
            } catch (error) {
              console.error("Error fetching city:", error);
              setUserCity('Unknown Location');
            } finally {
              setIsLocating(false);
              setIsRecording(true);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setUserCity('Location Denied');
            setIsLocating(false);
            setIsRecording(true); // Allow recording anyway
          }
        );
      } else {
        setIsRecording(true);
      }
    } else {
      setIsRecording(false);
      setUserCity('');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-surface rounded-lg p-6 text-center border border-border flex-1 flex flex-col justify-center">
        <h3 className="font-semibold text-lg text-white mb-2 flex items-center justify-center gap-2">
          <Mic2 className="w-5 h-5 text-primary" />
          Crowd Energy Map
        </h3>
        <p className="text-sm text-text-muted mb-8">Contribute your cheers to the live global energy map!</p>
        
        <button 
          onClick={toggleRecording}
          disabled={isLocating}
          className={`relative group mx-auto flex items-center justify-center w-24 h-24 rounded-full border-4 transition-all ${isRecording ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'} ${isLocating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping"></div>
          )}
          {isLocating ? (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Mic2 className={`w-10 h-10 ${isRecording ? 'text-primary animate-soft-pulse' : 'text-text-muted group-hover:text-white'}`} />
          )}
        </button>
        
        {isRecording && (
          <div className="mt-8 space-y-2 w-full max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-text-muted mb-1 font-medium">
              <span>{userCity || 'Your Location'}</span>
              <span>{Math.round(noiseLevel)}%</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden border border-border">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${noiseLevel}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-lg p-4 border border-border">
        <h4 className="font-medium text-white mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Loudest Cities
        </h4>
        <div className="space-y-3">
          {[
            { city: 'Mumbai', level: 98 },
            { city: 'Delhi', level: 92 },
            { city: 'Bangalore', level: 85 }
          ].map((loc, i) => (
            <div key={loc.city} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{i + 1}. {loc.city}</span>
              <div className="flex items-center gap-3 w-32">
                <div className="h-1 flex-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${loc.level}%` }}></div>
                </div>
                <span className="text-white font-mono text-xs w-8 text-right">{loc.level}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
