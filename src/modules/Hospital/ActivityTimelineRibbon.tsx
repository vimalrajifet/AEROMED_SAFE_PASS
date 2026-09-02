import React, { useState } from 'react';
import { Clock, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ActivityTimelineRibbon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const timelineEvents = [
    { time: '11:57', label: 'Emergency Call Received', status: 'completed' },
    { time: '12:00', label: 'Ambulance Dispatched', status: 'completed' },
    { time: '12:02', label: 'Drone Scout Launched', status: 'completed' },
    { time: '12:04', label: 'Telemetry Stream Connected', status: 'completed' },
    { time: '12:10', label: 'Hospital Command Alerted', status: 'completed' },
    { time: '12:11', label: 'Medical Team Confirmed', status: 'completed' },
    { time: 'NOW', label: 'Ambulance Approaching (08:14)', status: 'current' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs select-none transition-all overflow-hidden">
      {/* Ribbon Bar Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-slate-600" />
          <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
            Emergency Activity Timeline
          </span>
          <span className="text-[10px] text-slate-400 font-mono font-bold hidden sm:inline">
            • Incident ID: EM-2026-0922
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[10px] font-bold font-mono text-slate-600 hidden sm:inline">
            {isOpen ? 'Collapse Timeline' : 'Expand Timeline'}
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Collapsible Timeline Content */}
      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-100 overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {timelineEvents.map((evt, idx) => {
              const isCurrent = evt.status === 'current';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center text-center relative group">
                  {/* Connecting Line */}
                  {idx < timelineEvents.length - 1 && (
                    <div className="absolute top-2 left-1/2 w-full h-0.5 bg-slate-200 z-0" />
                  )}

                  {/* Marker Node */}
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center relative z-10 mb-1 border-2 ${
                      isCurrent
                        ? 'bg-amber-400 border-white ring-2 ring-amber-400 animate-pulse'
                        : 'bg-emerald-500 border-white'
                    }`}
                  >
                    {!isCurrent && <CheckCircle2 size={10} className="text-white" />}
                  </div>

                  <span className="text-[9px] font-mono font-bold text-slate-500 block leading-none">
                    {evt.time}
                  </span>
                  <span
                    className={`text-[10px] font-bold tracking-tight block leading-tight mt-0.5 truncate max-w-[120px] ${
                      isCurrent ? 'text-amber-700 font-black' : 'text-slate-700'
                    }`}
                  >
                    {evt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
