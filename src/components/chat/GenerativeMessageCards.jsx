import React, { useState } from "react";
import { CloudSun, Navigation, Eye, Award, ExternalLink, Sparkles, CheckCircle2, XCircle } from "lucide-react";

/**
 * 1. Live Weather Card (rendered when Weather MCP responds)
 */
export const WeatherCard = ({ data }) => {
  if (!data) return null;
  return (
    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 flex items-center justify-between text-white shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400">
          <CloudSun size={24} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-300">Live Weather MCP</span>
          </div>
          <h4 className="text-sm font-semibold">{data.location || "Current Weather"}</h4>
          <p className="text-xs text-blue-200 capitalize">{data.condition || "Pleasant & Clear"}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold">{data.temperature}°C</span>
        <p className="text-[10px] text-blue-300">Humidity: {data.humidity}%</p>
      </div>
    </div>
  );
};

/**
 * 2. Google Maps Transit / Route Card (rendered when Maps MCP responds)
 */
export const RouteCard = ({ data, onNavigate }) => {
  if (!data) return null;
  return (
    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-white shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Navigation size={14} /> Transit Route & Distance
        </span>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
          {data.duration || "3h 45m"} ({data.distance || "215 km"})
        </span>
      </div>
      <p className="text-xs text-gray-300 mb-2.5">
        From <strong className="text-white">{data.origin}</strong> to <strong className="text-white">{data.destination}</strong>
      </p>
      <button
        onClick={() => onNavigate && onNavigate("map", data.destination)}
        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>Open in BharatVerse Heritage Map</span>
        <ExternalLink size={12} />
      </button>
    </div>
  );
};

/**
 * 3. 360° Virtual Tour Card (links to TourPage360)
 */
export const VirtualTourCard = ({ data, onNavigate }) => {
  if (!data) return null;
  return (
    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-orange-950/80 border border-amber-500/40 text-white shadow-lg flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/20 rounded-lg text-amber-400">
          <Eye size={22} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">360° VR Immersion</span>
          </div>
          <h4 className="text-sm font-semibold text-amber-100">{data.title || "Monument Tour"}</h4>
          <p className="text-xs text-amber-200/80">Interactive Panoramas & Hotspots</p>
        </div>
      </div>
      <button
        onClick={() => onNavigate && onNavigate("360tour", data.slug || data.title)}
        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-1"
      >
        <span>Explore 360°</span>
        <ExternalLink size={12} />
      </button>
    </div>
  );
};

/**
 * 4. Interactive Quiz Challenge Card (links into BharatVerse Gamification)
 */
export const InteractiveQuizCard = ({ data, onAnswerSelected, onNavigate }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered, setAnswered] = useState(false);

  if (!data) return null;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = idx === (data.correctIndex ?? 0);
    if (onAnswerSelected) {
      onAnswerSelected(isCorrect);
    }
  };

  return (
    <div className="mt-3 p-4 rounded-xl bg-gray-900/90 border border-purple-500/40 text-white shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
          <Award size={15} /> Cultural Challenge (+20 XP)
        </span>
        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
          {data.difficulty || "Medium"}
        </span>
      </div>

      <p className="text-sm font-medium mb-3 text-gray-100">{data.question}</p>

      <div className="space-y-1.5">
        {data.options && data.options.map((opt, idx) => {
          let btnClass = "w-full text-left text-xs p-2.5 rounded-lg border transition-all flex items-center justify-between ";
          if (!answered) {
            btnClass += "border-gray-700 bg-gray-800/70 hover:bg-purple-900/40 hover:border-purple-500 text-gray-200";
          } else if (idx === data.correctIndex) {
            btnClass += "border-green-500 bg-green-950/60 text-green-200 font-semibold";
          } else if (idx === selectedIdx) {
            btnClass += "border-red-500 bg-red-950/60 text-red-200";
          } else {
            btnClass += "border-gray-800 bg-gray-900/40 text-gray-500 opacity-60";
          }

          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={btnClass}
            >
              <span>{opt}</span>
              {answered && idx === data.correctIndex && <CheckCircle2 size={14} className="text-green-400" />}
              {answered && idx === selectedIdx && idx !== data.correctIndex && <XCircle size={14} className="text-red-400" />}
            </button>
          );
        })}
      </div>

      {answered && data.funFact && (
        <div className="mt-3 pt-2.5 border-t border-gray-800 text-xs text-gray-300 flex items-start gap-1.5">
          <Sparkles size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <span><strong>Did You Know?</strong> {data.funFact}</span>
        </div>
      )}
    </div>
  );
};

