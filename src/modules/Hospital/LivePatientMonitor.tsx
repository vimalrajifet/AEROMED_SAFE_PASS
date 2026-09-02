import React from 'react';
import { Activity, Droplets, Zap, Thermometer, Wind } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface LivePatientMonitorProps {
  emergency?: EmergencyRequest;
}

export const LivePatientMonitor: React.FC<LivePatientMonitorProps> = ({ emergency }) => {
  const vitals = emergency?.vitals || {
    hr: 94,
    spo2: 96,
    bp: '120/80',
    temp: 37.5,
  };

  const respiration = 18; // 18 breaths/min

  // Abnormal checks
  const isHrAbnormal = vitals.hr > 115 || vitals.hr < 55;
  const isSpo2Abnormal = vitals.spo2 < 92;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs select-none">
      {/* Header with connection and live indicator */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
            <Activity size={14} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none">
              Live Patient Telemetry
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time Biometric Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE FROM {emergency?.assignedAmbulance || 'AMB-01'}</span>
        </div>
      </div>

      {/* Embedded Live SVG ECG Waveform Strip */}
      <div className="relative h-10 w-full bg-slate-950 rounded-xl overflow-hidden mb-3 border border-slate-800 flex items-center px-2">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:12px_12px]" />
        
        {/* Animated ECG SVG */}
        <svg className="w-full h-8 stroke-emerald-400 fill-none" viewBox="0 0 500 40" preserveAspectRatio="none">
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0,20 L80,20 L90,20 L100,5 L110,35 L120,15 L125,25 L130,20 L200,20 L210,20 L220,5 L230,35 L240,15 L245,25 L250,20 L320,20 L330,20 L340,5 L350,35 L360,15 L365,25 L370,20 L440,20 L450,20 L460,5 L470,35 L480,15 L485,25 L490,20 L500,20"
          />
        </svg>
        <span className="absolute right-2 text-[9px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
          LEAD II • ECG 60Hz
        </span>
      </div>

      {/* 5 Integrated Patient Vitals Instrument Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* 1. HEART RATE */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            isHrAbnormal
              ? 'bg-red-50/70 border-red-300 text-red-900'
              : 'bg-slate-50 border-slate-200/80 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-tight">Heart Rate</span>
            <Activity size={13} className={isHrAbnormal ? 'text-red-600 animate-ping' : 'text-red-500'} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
              {vitals.hr}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">BPM</span>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">Norm: 60-100</div>
        </div>

        {/* 2. SPO2 */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            isSpo2Abnormal
              ? 'bg-red-50/70 border-red-300 text-red-900'
              : 'bg-slate-50 border-slate-200/80 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-tight">SpO₂</span>
            <Droplets size={13} className="text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
              {vitals.spo2}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">%</span>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">Norm: 95-100</div>
        </div>

        {/* 3. BLOOD PRESSURE */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-tight">Blood Press.</span>
            <Zap size={13} className="text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
              {vitals.bp || '120/80'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">mmHg</span>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">MAP: 93 mmHg</div>
        </div>

        {/* 4. TEMPERATURE */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-tight">Temp</span>
            <Thermometer size={13} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
              {vitals.temp || 37.5}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">°C</span>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">Norm: 36.5-37.5</div>
        </div>

        {/* 5. RESPIRATION */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-tight">Respiration</span>
            <Wind size={13} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
              {respiration}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">/min</span>
          </div>
          <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">Norm: 12-20</div>
        </div>
      </div>
    </div>
  );
};
