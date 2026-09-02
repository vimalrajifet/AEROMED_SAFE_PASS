import React from 'react';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const HospitalReadinessMeter: React.FC = () => {
  const readinessPercent = 87;

  const readinessItems = [
    { label: 'Trauma Bay 1', status: 'Ready', isReady: true },
    { label: 'Emergency Team', status: 'Ready', isReady: true },
    { label: 'Diagnostic Equipment', status: 'Ready', isReady: true },
    { label: 'Orthopedic Lead', status: 'Arriving', isReady: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs select-none">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none">
              Hospital Readiness
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Reception Clearance</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
          STANDBY READY
        </span>
      </div>

      {/* Circular Gauge & Readiness Summary */}
      <div className="flex items-center gap-4 py-1">
        {/* SVG Circular Ring */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100 stroke-current"
              strokeWidth="3.5"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 stroke-current transition-all duration-1000"
              strokeDasharray={`${readinessPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black font-mono text-slate-900 leading-none">
              {readinessPercent}%
            </span>
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">
              READY
            </span>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="flex-1 space-y-1.5 text-xs">
          {readinessItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">{item.label}</span>
              <span
                className={`font-bold flex items-center gap-1 font-mono text-[10px] ${
                  item.isReady ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {item.isReady ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Readiness Statement */}
      <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        <p className="leading-tight">
          <strong className="text-slate-900 font-bold">AI Status:</strong> Hospital trauma team is fully prepared to receive the patient.
        </p>
      </div>
    </div>
  );
};
