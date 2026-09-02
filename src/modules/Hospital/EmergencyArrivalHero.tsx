import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, MapPin, Check, AlertTriangle } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';
import type { EmergencyRequest } from '../../types';

interface EmergencyArrivalHeroProps {
  emergency?: EmergencyRequest;
}

export const EmergencyArrivalHero: React.FC<EmergencyArrivalHeroProps> = ({ emergency }) => {
  const { acceptedIds, acceptEmergency } = useHospitalStore();

  // Live tick countdown simulation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(494); // 08:14 = 494 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 494));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const ambId = emergency?.assignedAmbulance || 'AMB-01';
  const emType = emergency?.type || 'Trauma Emergency (Level 1)';
  const distance = emergency?.distance || '2.4 km';
  const emId = emergency?.id || 'EM-01';
  const isAccepted = emergency?.hospitalAccepted || acceptedIds.has(emId);

  const stages = [
    { label: 'Incident Scene', status: 'completed' },
    { label: 'Unit Dispatched', status: 'completed' },
    { label: 'Drone Scouting', status: 'completed' },
    { label: 'Hospital Alerted', status: 'current' },
    { label: 'Hospital Arrival', status: 'upcoming' },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-700/80 relative overflow-hidden select-none">
      {/* Subtle background radar ring animation */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* TOP: Identification & Huge Countdown */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-sky-400 font-mono">
              Ambulance Approaching
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700 font-bold">
              BAY 1 RESERVED
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
              {ambId}
            </h2>
            <span className="text-sm sm:text-base font-semibold text-slate-300">
              {emType}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1 text-slate-200">
              <MapPin size={13} className="text-sky-400" />
              <strong>{distance}</strong> away
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={13} />
              Route Clear
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold">
              <Zap size={13} className="text-amber-400" />
              Green Corridor Active
            </span>
          </div>
        </div>

        {/* GIANT COUNTDOWN */}
        <div className="flex flex-col items-start md:items-end justify-center bg-slate-950/60 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-slate-800 w-full md:w-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
            Minutes to Arrival
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-amber-400 leading-none my-1 drop-shadow-xs">
            {timeFormatted}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY SYNC
          </span>
        </div>
      </div>

      {/* ACTION BANNER: PENDING CONFIRMATION ALERT OR READY BADGE */}
      {!isAccepted && (
        <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle size={16} className="animate-pulse text-amber-400 flex-shrink-0" />
            <span>Ambulance CAD is waiting for Hospital Reception Confirmation.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => acceptEmergency(emId)}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <Check size={14} />
              <span>ACCEPT & CONFIRM RECEPTION BAY</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM: 5-Stage Transit Milestone Progress Bar */}
      <div className="relative z-10 pt-3">
        <div className="grid grid-cols-5 gap-1 text-center">
          {stages.map((st, idx) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full flex items-center mb-1.5">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold tracking-tight uppercase truncate w-full ${
                    isCompleted
                      ? 'text-slate-300'
                      : isCurrent
                      ? 'text-amber-300 font-black'
                      : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
