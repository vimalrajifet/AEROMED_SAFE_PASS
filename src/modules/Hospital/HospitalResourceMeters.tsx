import React from 'react';
import { Bed, LayoutGrid, Wind, Activity, Shield, Droplets } from 'lucide-react';

export const HospitalResourceMeters: React.FC = () => {
  const resources = [
    { label: 'ICU Beds', avail: 4, total: 20, icon: Bed, color: 'bg-sky-500' },
    { label: 'ER Beds', avail: 2, total: 15, icon: LayoutGrid, color: 'bg-emerald-500' },
    { label: 'Ventilators', avail: 3, total: 10, icon: Wind, color: 'bg-indigo-500' },
    { label: 'Op. Theatres', avail: 1, total: 5, icon: Activity, color: 'bg-amber-500' },
    { label: 'Trauma Bays', avail: 1, total: 3, icon: Shield, color: 'bg-purple-500' },
    { label: 'Blood Units', avail: 8, total: 12, icon: Droplets, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs select-none">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
            <LayoutGrid size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none">
              Hospital Resources
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Capacity Meters</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          LIVE INVENTORY
        </span>
      </div>

      {/* 2-Column Compact Grid of Mini Resource Meters */}
      <div className="grid grid-cols-2 gap-2">
        {resources.map((res, idx) => {
          const percent = Math.round((res.avail / res.total) * 100);

          return (
            <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold mb-1">
                <span className="truncate">{res.label}</span>
                <span className="font-mono font-black text-slate-900">
                  {res.avail}/{res.total}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${res.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
