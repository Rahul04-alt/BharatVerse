// src/components/GlobalMusicPlayer.jsx
import React, { useRef, useState, useEffect } from "react";

const GlobalMusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15); // 30%

  // keep audio volume in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.muted = false;
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio play error:", err);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <>
      {/* keep this mounted once (e.g. in App.jsx) so music is global */}
      <audio
        ref={audioRef}
        src="/music-player.mp3"
        loop
        preload="auto"
      />

      {/* fixed circular button at bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 group select-none">
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl flex items-center justify-center hover:from-red-700 hover:to-orange-700 transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
        >
          {isPlaying ? "🔊" : "🔈"}
        </button>
        
      </div>
    </>
  );
};

export default GlobalMusicPlayer;
