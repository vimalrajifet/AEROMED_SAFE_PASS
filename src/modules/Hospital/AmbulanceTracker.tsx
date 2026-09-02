import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import type { EmergencyRequest } from '../../types';

interface AmbulanceTrackerProps {
    emergency: EmergencyRequest;
}

export const AmbulanceTracker: React.FC<AmbulanceTrackerProps> = ({ emergency }) => {
    const { eta, distance, assignedAmbulance } = emergency;

    return (
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm text-black space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                    <Navigation size={15} className="text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">Ambulance Telemetry</h3>
                </div>
                {assignedAmbulance && (
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black rounded font-mono uppercase tracking-wider">
                        UNIT: {assignedAmbulance}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                        <MapPin size={13} className="text-black" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Distance</span>
                    </div>
                    <p className="text-xl font-black text-black font-mono">{distance || '--'}</p>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                        <Clock size={13} className="text-black" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Estimated ETA</span>
                    </div>
                    <p className="text-xl font-black text-black font-mono">{eta || '--'}</p>
                </div>
            </div>
        </div>
    );
};
