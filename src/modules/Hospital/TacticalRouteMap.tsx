import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Navigation, Radio, ShieldCheck, Zap } from 'lucide-react';
import { useHospitalStore } from '../../store/useHospitalStore';

// ── COORDINATES ──────────────────────────────────────────────────
const AMBULANCE_BASE = { lat: 13.0827, lng: 80.2707 };
const HOSPITAL_LOC = { lat: 13.0700, lng: 80.2600 };
const PATIENT_LOC = { lat: 13.0600, lng: 80.2500 };

// ── MODERN ENTERPRISE MARKER ICONS ──────────────────────────────
const createCustomIcon = (bgColor: string, fgColor: string, label: string, size = 28) => divIcon({
  className: 'tactical-map-icon',
  html: `
    <div style="
      background-color: ${bgColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 8px;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: ${fgColor};
      font-family: monospace;
      font-size: ${Math.round(size * 0.42)}px;
    ">
      ${label}
    </div>
  `,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
  popupAnchor: [0, -size / 2]
});

const ambulanceIcon = createCustomIcon('#2563EB', '#ffffff', 'AMB', 30);
const droneIcon = createCustomIcon('#4F46E5', '#ffffff', 'DRN', 26);
const patientIcon = createCustomIcon('#DC2626', '#ffffff', 'PAT', 28);
const hospitalIcon = createCustomIcon('#059669', '#ffffff', 'HOSP', 32);

// Map Auto Controller
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

// Route Fetcher
interface RouteResult {
  coords: [number, number][];
  distKm: string;
  durMin: string;
}

const fetchDrivingRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coords: route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]),
        distKm: (route.distance / 1000).toFixed(1) + ' km',
        durMin: Math.ceil(route.duration / 60) + ' min',
      };
    }
  } catch {
    // Fallback: direct line interpolation
  }
  return {
    coords: [[start.lat, start.lng], [end.lat, end.lng]],
    distKm: '2.4 km',
    durMin: '8 min',
  };
};

export const TacticalRouteMap: React.FC = () => {
  const { fleet, emergencies, selectedRequestId } = useHospitalStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);

  const selectedReq = emergencies.find((r) => r.id === selectedRequestId) || emergencies[0];
  const patientPos = selectedReq?.location || PATIENT_LOC;
  const ambPos = fleet[0]?.location || AMBULANCE_BASE;

  // Drone is 320m ahead of ambulance
  const dronePos = {
    lat: ambPos.lat - 0.003,
    lng: ambPos.lng - 0.003,
  };

  useEffect(() => {
    fetchDrivingRoute(ambPos, HOSPITAL_LOC).then(setRoute);
  }, [ambPos.lat, ambPos.lng]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-900 transition-all ${
        isFullscreen ? 'fixed inset-4 z-[9999]' : 'h-64 sm:h-72'
      }`}
    >
      <MapContainer
        center={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 bg-slate-900"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController center={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]} />

        {/* Hospital Marker */}
        <Marker position={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]} icon={hospitalIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="font-black text-slate-900">Apollo Trauma Center</strong>
              <div className="text-emerald-700 font-bold">Bay 1 Ready for Reception</div>
            </div>
          </Popup>
        </Marker>

        {/* Ambulance Marker */}
        <Marker position={[ambPos.lat, ambPos.lng]} icon={ambulanceIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="font-black text-blue-700">AMB-01 (In Transit)</strong>
              <div className="text-slate-600 font-mono">Speed: 48 km/h • Heading: 215°</div>
            </div>
          </Popup>
        </Marker>

        {/* Drone Scout Marker */}
        <Marker position={[dronePos.lat, dronePos.lng]} icon={droneIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="font-black text-indigo-700">AeroMed Drone Scout</strong>
              <div className="text-slate-600">320m Corridor Lead Active</div>
            </div>
          </Popup>
        </Marker>

        {/* Patient Incident Marker */}
        <Marker position={[patientPos.lat, patientPos.lng]} icon={patientIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="font-black text-red-700">Incident Scene</strong>
              <div className="text-slate-600">Patient Secured in Unit</div>
            </div>
          </Popup>
        </Marker>

        {/* Green Wave Corridor Route Line */}
        {route && (
          <Polyline
            positions={route.coords}
            pathOptions={{ color: '#059669', weight: 5, opacity: 0.85 }}
          />
        )}
      </MapContainer>

      {/* TOP FLOATING TACTICAL HUD CHIPS */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-[500] pointer-events-none select-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-mono font-bold shadow-md border border-slate-700/80 backdrop-blur-sm">
            <Navigation size={12} className="text-sky-400" />
            <span>ETA: 08:14</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-mono font-bold shadow-md border border-slate-700/80 backdrop-blur-sm">
            <Radio size={12} className="text-indigo-400" />
            <span>DRONE LEAD: 320m</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 text-[11px] font-mono font-bold shadow-md border border-emerald-700/80 backdrop-blur-sm">
            <ShieldCheck size={12} />
            <span>CORRIDOR: 100% CLEAR</span>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-md backdrop-blur-sm pointer-events-auto cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* BOTTOM FLOATING SPEED & TELEMETRY FOOTER */}
      <div className="absolute bottom-2.5 left-3 z-[500] pointer-events-none select-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/90 text-white text-[10px] font-mono font-bold border border-slate-700/80 shadow-md backdrop-blur-sm">
          <Zap size={11} className="text-amber-400" />
          <span>SPEED: 48 KM/H • GREEN SIGNAL OVERRIDE ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
