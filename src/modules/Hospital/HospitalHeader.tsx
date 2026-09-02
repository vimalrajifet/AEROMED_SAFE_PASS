import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Cpu, Wifi, Radio } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface HospitalHeaderProps {
  selectedEmergency?: EmergencyRequest;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({ selectedEmergency }) => {
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const ambId = selectedEmergency?.assignedAmbulance || 'AMB-01';
  const emType = selectedEmergency?.type?.toUpperCase() || 'TRAUMA EMERGENCY';
  const eta = selectedEmergency?.eta || '08:14';

  return (
    <header className="h-14 bg-white/95 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-sm backdrop-blur-md flex-shrink-0 select-none">
      {/* LEFT: Hospital Info & Back Button */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-300/80 cursor-pointer shadow-2xs"
          title="Return to Ambulance CAD Dashboard"
        >
          <ArrowLeft size={13} />
          <span className="hidden md:inline">Ambulance CAD</span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Shield size={16} className="text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight leading-none">
                AEROMED SAFEPASS
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wider">
                COMMAND CENTER
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              Apollo Trauma & Emergency Center • Bay 1
            </p>
          </div>
        </div>
      </div>

      {/* CENTER: Emergency Status Pill */}
      <div className="hidden lg:flex items-center">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-xs border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-black tracking-wide font-mono text-sky-300">{ambId}</span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs font-bold tracking-tight text-slate-100">{emType}</span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs font-mono font-black text-amber-400">ETA {eta}</span>
        </div>
      </div>

      {/* RIGHT: Live Telemetry & System Clock */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <Cpu size={12} />
            <span>AI Active</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Wifi size={12} className="text-sky-600" />
            <span>5G Hyper</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Radio size={12} className="text-indigo-600" />
            <span>Drone Escort</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-3 sm:border-l sm:border-slate-200">
          <div className="text-right">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">
              Live UTC+5:30
            </p>
            <p className="text-sm font-black font-mono tracking-widest text-slate-900 leading-tight">
              {timeStr}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
