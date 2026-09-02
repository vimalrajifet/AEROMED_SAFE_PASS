import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Clock, Circle } from 'lucide-react';

export const ArrivalChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Trauma Bay Prepared', status: 'done' },
    { id: 2, label: 'Emergency Physician Assigned', status: 'done' },
    { id: 3, label: 'Oxygen & Suction Ready', status: 'done' },
    { id: 4, label: 'X-Ray & Imaging Notified', status: 'done' },
    { id: 5, label: 'Patient Record Created', status: 'done' },
    { id: 6, label: 'Orthopedic Specialist Arriving', status: 'in-progress' },
    { id: 7, label: 'Blood Bank Confirmation', status: 'pending' },
  ]);

  const toggleItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'done' ? 'pending' : 'done';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const doneCount = checklist.filter((c) => c.status === 'done').length;
  const progressPercent = Math.round((doneCount / checklist.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs select-none">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none">
              Arrival Checklist
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Patient Reception Protocol</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1.5 text-xs">
        {checklist.map((item) => {
          const isDone = item.status === 'done';
          const isInProgress = item.status === 'in-progress';

          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {isDone ? (
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                ) : isInProgress ? (
                  <Clock size={13} className="text-amber-500 flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle size={13} className="text-slate-300 flex-shrink-0" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    isDone
                      ? 'text-slate-700 font-semibold'
                      : isInProgress
                      ? 'text-amber-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                {isDone ? 'READY' : isInProgress ? 'IN TRANSIT' : 'PENDING'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
