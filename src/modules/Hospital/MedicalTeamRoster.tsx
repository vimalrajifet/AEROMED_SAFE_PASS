import React from 'react';
import { Users } from 'lucide-react';

export const MedicalTeamRoster: React.FC = () => {
  const teamMembers = [
    { role: 'Trauma Surgeon', doctor: 'Dr. R. Mehta', status: 'Ready', ready: true },
    { role: 'Emergency Physician', doctor: 'Dr. S. Priya', status: 'Ready', ready: true },
    { role: 'Triage Nurse Lead', doctor: 'RN K. Ananya', status: 'Ready', ready: true },
    { role: 'Radiologist', doctor: 'Dr. M. Karthik', status: 'Preparing', ready: true },
    { role: 'Orthopedic Specialist', doctor: 'Dr. V. Raman', status: 'In Transit', ready: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs select-none">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase leading-none">
              Medical Team
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Assigned Trauma Roster</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          Team Ready: <strong className="text-emerald-700">4/5</strong>
        </span>
      </div>

      {/* Team Rows */}
      <div className="space-y-1.5">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  member.ready
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {member.role.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-[11px] leading-none truncate">
                  {member.role}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                  {member.doctor}
                </p>
              </div>
            </div>

            <span
              className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${
                member.ready
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {member.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
