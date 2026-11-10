// src/components/GlobalMusicPlayer.jsx
import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ASSETS } from "../constants/assets";

const GlobalMusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(0.25);

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

  return (
    <>
      <audio
        ref={audioRef}
        src={ASSETS.GLOBAL_MUSIC || "/music-player.mp3"}
        loop
        preload="auto"
      />

      {/* Music button on the top right, below header (matches reference UI) */}
      <div className="fixed top-24 right-6 z-50 select-none">
        <button
          onClick={togglePlay}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-2xl flex items-center justify-center hover:from-red-700 hover:via-orange-600 hover:to-amber-600 transition-all duration-300 hover:scale-110 border-2 border-white/30 backdrop-blur-md group"
          aria-label={
            isPlaying ? "Pause background music" : "Play background music"
          }
          title={isPlaying ? "Mute Music" : "Play Ambient Music"}
        >
          {isPlaying ? (
            <Volume2 size={22} className="text-white drop-shadow animate-pulse" />
          ) : (
            <VolumeX size={22} className="text-white drop-shadow opacity-90" />
          )}
        </button>
      </div>
    </>
  );
};

export default GlobalMusicPlayer;
