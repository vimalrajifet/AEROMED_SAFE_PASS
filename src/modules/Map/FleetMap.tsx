import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';

// ── COORDINATES ──────────────────────────────────────────────────
const AMBULANCE_BASE = { lat: 13.168736, lng: 80.068330 };
const HOSPITAL_LOC = { lat: 13.182033, lng: 80.118029 };

// ── ICONS ────────────────────────────────────────────────────────
const createNeonIcon = (color: string, iconChar: string, size = 24) => divIcon({
  className: 'custom-icon',
  html: `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 15px ${color}, 0 0 5px ${color} inset;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-family: sans-serif;
      font-size: ${Math.round(size * 0.5)}px;
    ">
      ${iconChar}
    </div>
  `,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
  popupAnchor: [0, -size / 2]
});

const ambulanceIcon = createNeonIcon('#3b82f6', 'A');      // Blue
const patientIcon = createNeonIcon('#ef4444', 'P');      // Red
const droneIcon = createNeonIcon('#f97316', 'D');      // Orange
const hospitalIcon = createNeonIcon('#10b981', 'H', 28);  // Green

// ── MAP CONTROLLER ───────────────────────────────────────────────
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 2 });
    }
  }, [center, map]);
  return null;
};

// ── ROUTE FETCHER ────────────────────────────────────────────────
interface RouteResult {
  coords: [number, number][];
  distKm: string;
  durMin: string;
}

const fetchOSRMRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coords: route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]),
        distKm: (route.distance / 1000).toFixed(1) + ' km',
        durMin: Math.ceil(route.duration / 60) + ' min',
      };
    }
  } catch (e) {
    console.error('OSRM fetch failed:', e);
  }
  return null;
};

// ── FLEET MAP ────────────────────────────────────────────────────
export const FleetMap: React.FC = () => {
  const { fleet, requests, drone, selectedRequestId } = useAppStore();
  const { t } = useLanguageStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([AMBULANCE_BASE.lat, AMBULANCE_BASE.lng]);

  // Route state: two legs
  const [legAmbToPatient, setLegAmbToPatient] = useState<RouteResult | null>(null);
  const [legPatientToHosp, setLegPatientToHosp] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (!selectedRequestId) {
      setLegAmbToPatient(null);
      setLegPatientToHosp(null);
      return;
    }

    const req = requests.find((r) => r.id === selectedRequestId);
    if (!req) return;

    setMapCenter([req.location.lat, req.location.lng]);

    // Find assigned ambulance (or use base location)
    const assignedAmb = fleet.find((a) => a.assignedEmergencyId === req.id);
    const ambLoc = assignedAmb ? assignedAmb.location : AMBULANCE_BASE;

    // Fetch both legs in parallel
    const loadRoutes = async () => {
      const [leg1, leg2] = await Promise.all([
        fetchOSRMRoute(ambLoc, req.location),
        fetchOSRMRoute(req.location, HOSPITAL_LOC),
      ]);
      setLegAmbToPatient(leg1);
      setLegPatientToHosp(leg2);
    };

    loadRoutes();
  }, [selectedRequestId, requests, fleet]);

  // Combined route info
  const totalDist =
    legAmbToPatient && legPatientToHosp
      ? (parseFloat(legAmbToPatient.distKm) + parseFloat(legPatientToHosp.distKm)).toFixed(1) + ' km'
      : legAmbToPatient?.distKm || null;

  const totalDur =
    legAmbToPatient && legPatientToHosp
      ? parseInt(legAmbToPatient.durMin) + parseInt(legPatientToHosp.durMin) + ' min'
      : legAmbToPatient?.durMin || null;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[AMBULANCE_BASE.lat, AMBULANCE_BASE.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0 bg-gray-900"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} />

        {/* ── Hospital Marker (always visible) ── */}
        <Marker 
          position={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]} 
          icon={requests.some(r => r.hospitalAccepted) 
            ? createNeonIcon('#10b981', 'H', 32) 
            : hospitalIcon
          }
        >
          <Popup>
            <div className="font-sans text-sm">
              <strong className="text-emerald-600">HOSPITAL</strong><br />
              {requests.some(r => r.hospitalAccepted) ? (
                <span className="text-teal-400 font-bold animate-pulse">RECEIVING PATIENT</span>
              ) : (
                '13.1820, 80.1180'
              )}
            </div>
          </Popup>
        </Marker>

        {/* ── Ambulances ── */}
        {fleet.map((amb) => (
          <Marker key={amb.id} position={[amb.location.lat, amb.location.lng]} icon={ambulanceIcon}>
            <Popup className="custom-popup">
              <div className="font-sans text-sm">
                <strong className="text-blue-600">{amb.id}</strong><br />
                {t('map.driver')} {amb.driverName}<br />
                {t('map.status')} {amb.status}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Emergency Requests (Patients) ── */}
        {requests.map((req) => (
          <Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={patientIcon}>
            <Popup>
              <div className="font-sans text-sm">
                <strong className="text-red-600">{t('map.emergency')}</strong><br />
                {req.type}<br />
                {t('map.priority')} {req.priority}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Drone ── */}
        <Marker position={[drone.location.lat, drone.location.lng]} icon={droneIcon}>
          <Popup>{t('map.droneScout')}</Popup>
        </Marker>

        {/* ── LEG 1: Ambulance → Patient (Blue dashed) ── */}
        {legAmbToPatient && legAmbToPatient.coords.length > 0 && (
          <Polyline
            positions={legAmbToPatient.coords}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 0.9,
              dashArray: '12, 8',
            }}
          />
        )}

        {/* ── LEG 2: Patient → Hospital (Green solid) ── */}
        {legPatientToHosp && legPatientToHosp.coords.length > 0 && (
          <Polyline
            positions={legPatientToHosp.coords}
            pathOptions={{
              color: '#10b981',
              weight: 5,
              opacity: 0.9,
              dashArray: '6, 6',
            }}
          />
        )}
      </MapContainer>

      {/* ── Route Info Overlay ── */}
      {selectedRequestId && (legAmbToPatient || legPatientToHosp) && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur border border-white/10 p-3 rounded-lg z-[500]">
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-between text-sm">
            {/* Leg 1 Info */}
            {legAmbToPatient && (
              <div>
                <span className="block text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                  {t('map.leg1')}
                </span>
                <span className="text-lg font-bold text-white">
                  {legAmbToPatient.durMin}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  ({legAmbToPatient.distKm})
                </span>
              </div>
            )}

            {/* Leg 2 Info */}
            {legPatientToHosp && (
              <div>
                <span className="block text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  {t('map.leg2')}
                </span>
                <span className="text-lg font-bold text-white">
                  {legPatientToHosp.durMin}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  ({legPatientToHosp.distKm})
                </span>
              </div>
            )}

            {/* Total */}
            {totalDist && totalDur && (
              <div className="border-l border-white/10 pl-4">
                <span className="block text-gray-400 text-[10px] uppercase tracking-wider">
                  {t('map.total')}
                </span>
                <span className="text-xl font-black text-white">{totalDur}</span>
                <span className="text-xs text-gray-400 ml-1">({totalDist})</span>
              </div>
            )}

            {/* Route Status */}
            <div className="ml-auto">
              <span className="text-green-400 font-bold flex items-center text-xs">
                {t('map.optimized')}
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};