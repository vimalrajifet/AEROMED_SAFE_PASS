import React, { useEffect } from 'react';
import { FleetMap } from './Map/FleetMap';
import { RequestPanel } from './Emergency/RequestPanel';
import { StatusPanel } from './Fleet/StatusPanel';
import { ActivityLog } from './System/ActivityLog';
import { TrafficControl } from './Traffic/TrafficControl';
import { DispatchPanel } from './Fleet/DispatchPanel';
import { DronePanel } from './System/DronePanel';
import { useAppStore } from '../store/useAppStore';

export const Dashboard: React.FC = () => {
  const { subscribeToRequests, currentView } = useAppStore();

  useEffect(() => {
    const unsubscribe = subscribeToRequests();
    return () => unsubscribe();
  }, [subscribeToRequests]);

  // --- VIEW: FULL MAP ---
  if (currentView === 'map') {
    return (
      <div className="h-full w-full relative bg-dashboard-card rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <FleetMap />
        <div className="absolute top-4 left-4 z-[400] w-72 sm:w-80 max-h-[calc(100%-2rem)] overflow-auto bg-black/80 backdrop-blur rounded-xl border border-white/10 p-2">
          <RequestPanel />
        </div>
      </div>
    );
  }

  // --- VIEW: DISPATCH CENTER ---
  if (currentView === 'dispatch') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-y-auto lg:overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <RequestPanel />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-4">
          <DispatchPanel />
          <div className="flex-1 min-h-[200px]">
            <StatusPanel />
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: DEFAULT DASHBOARD ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 h-full overflow-y-auto xl:overflow-hidden">
      {/* LEFT: REQUESTS & STATUS */}
      <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-h-[200px]">
          <RequestPanel />
        </div>
        <div className="min-h-[180px]">
          <StatusPanel />
        </div>
      </div>

      {/* CENTER: MAP & DRONE */}
      <div className="xl:col-span-6 flex flex-col gap-4 min-h-0">
        <div className="flex-1 bg-dashboard-card rounded-xl border border-white/10 overflow-hidden relative shadow-2xl z-0 min-h-[300px]">
          <FleetMap />
        </div>
        <div className="flex-shrink-0">
          <DronePanel />
        </div>
      </div>

      {/* RIGHT: DISPATCH, TRAFFIC, LOGS */}
      <div className="xl:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
        <DispatchPanel />
        <TrafficControl />
        <div className="flex-1 min-h-[200px]">
          <ActivityLog />
        </div>
      </div>
    </div>
  );
};
