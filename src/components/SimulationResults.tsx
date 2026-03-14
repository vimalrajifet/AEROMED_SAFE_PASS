import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Plane, Radio, TrafficCone, Zap } from 'lucide-react';
import type { SimulationResult } from '../api/simulationApi';

interface Props {
    results: SimulationResult | null;
    loading: boolean;
    onClose: () => void;
}

export const SimulationResults: React.FC<Props> = ({ results, loading, onClose }) => {
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/90 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/30 text-center shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                <div className="relative mx-auto w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-blue-400/50 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck size={28} className="text-blue-400" />
                    </div>
                </div>
                <h3 className="text-white font-bold text-lg">Running Simulation</h3>
                <p className="text-blue-300/70 text-sm mt-1">SUMO engine active — comparing scenarios…</p>
                <div className="mt-4 flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!results) return null;

    const normalEta = Math.ceil(results.normal.eta_seconds / 60);
    const safeEta = Math.ceil(results.safepass.eta_seconds / 60);
    const timeSaved = Math.ceil(results.comparison.time_saved_seconds / 60);
    const improvement = results.comparison.improvement_percentage;

    return (
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" size={20} />
                        Simulation Analysis
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">AeroMed SafePass vs Normal Traffic</p>
                </div>
                <button onClick={onClose} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-all border border-white/5">
                    ✕ CLOSE
                </button>
            </div>

            {/* ETA Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Normal */}
                <div className="relative bg-gradient-to-br from-red-950/40 to-red-900/20 p-4 rounded-xl border border-red-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full" />
                    <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={12} className="text-red-400" />
                        <span className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">Without System</span>
                    </div>
                    <div className="text-3xl font-black text-red-400 tabular-nums">
                        {normalEta}<span className="text-sm font-normal text-red-400/60 ml-1">min</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500">
                        Speed: {results.normal.avg_speed} · {results.normal.traffic_level}
                    </div>
                </div>

                {/* SafePass */}
                <div className="relative bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full" />
                    <div className="absolute top-2 right-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Zap size={12} className="text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">AeroMed SafePass</span>
                    </div>
                    <div className="text-3xl font-black text-white tabular-nums">
                        {safeEta}<span className="text-sm font-normal text-gray-400 ml-1">min</span>
                    </div>
                    <div className="mt-2 text-[10px] text-emerald-400/70">
                        Speed: {results.safepass.avg_speed} · Green Corridor
                    </div>
                </div>
            </div>

            {/* Time Saved Hero */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/20 mb-5 text-center">
                <div className="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Time Saved</div>
                <div className="text-4xl font-black text-white">
                    {timeSaved}<span className="text-lg text-blue-300 ml-1">min</span>
                </div>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="text-emerald-400 text-xs font-bold">▲ {improvement}% Faster Response</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                    <span>RESPONSE TIME COMPARISON</span>
                    <span className="text-emerald-400">{improvement}% improvement</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${100 - improvement}%` }} className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-1000" />
                    <div style={{ width: `${improvement}%` }} className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-1000" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>Normal ({normalEta} min)</span>
                    <span className="text-emerald-500">SafePass ({safeEta} min)</span>
                </div>
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-2 gap-2">
                <StatusBadge icon={<Plane size={14} />} label="Drone" value="Active — Scanning" color="blue" />
                <StatusBadge icon={<TrafficCone size={14} />} label="Traffic" value="Corridor Cleared" color="green" />
                <StatusBadge icon={<Radio size={14} />} label="Signal Priority" value="Enabled" color="amber" />
                <StatusBadge icon={<ShieldCheck size={14} />} label="Emergency Level" value="Critical" color="red" />
            </div>
        </div>
    );
};

// Tiny helper component
const StatusBadge: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
    const colors: Record<string, string> = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
    };
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${colors[color]}`}>
            {icon}
            <div>
                <div className="text-[9px] uppercase tracking-wider text-gray-500">{label}</div>
                <div className="text-[11px] font-medium">{value}</div>
            </div>
        </div>
    );
};
