import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useHospitalStore } from '../../store/useHospitalStore';

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
const hospitalIcon = createNeonIcon('#10b981', 'H', 28);  // Green

// ── MAP CONTROLLER ───────────────────────────────────────────────
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
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

// ── HOSPITAL MAP ─────────────────────────────────────────────────
export const HospitalMap: React.FC = () => {
  const { fleet, emergencies, selectedRequestId } = useHospitalStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]);

  const [legAmbToPatient, setLegAmbToPatient] = useState<RouteResult | null>(null);
  const [legPatientToHosp, setLegPatientToHosp] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (!selectedRequestId) {
      setLegAmbToPatient(null);
      setLegPatientToHosp(null);
      return;
    }

    const req = emergencies.find((r) => r.id === selectedRequestId);
    if (!req) return;

    setMapCenter([req.location.lat, req.location.lng]);

    const assignedAmb = fleet.find((a) => a.assignedEmergencyId === req.id);
    const ambLoc = assignedAmb ? assignedAmb.location : AMBULANCE_BASE;

    const loadRoutes = async () => {
      const [leg1, leg2] = await Promise.all([
        fetchOSRMRoute(ambLoc, req.location),
        fetchOSRMRoute(req.location, HOSPITAL_LOC),
      ]);
      setLegAmbToPatient(leg1);
      setLegPatientToHosp(leg2);
    };

    loadRoutes();
  }, [selectedRequestId, emergencies, fleet]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0 bg-gray-900"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} />

        {/* Hospital Marker */}
        <Marker position={[HOSPITAL_LOC.lat, HOSPITAL_LOC.lng]} icon={hospitalIcon}>
          <Popup>Hospital (You)</Popup>
        </Marker>

        {/* Ambulances */}
        {fleet.map((amb) => (
          <Marker key={amb.id} position={[amb.location.lat, amb.location.lng]} icon={ambulanceIcon}>
            <Popup>
              <strong>{amb.id}</strong><br />
              Status: {amb.status}
            </Popup>
          </Marker>
        ))}

        {/* Emergencies */}
        {emergencies.map((req) => (
          <Marker key={req.id} position={[req.location.lat, req.location.lng]} icon={patientIcon}>
            <Popup>
              <strong>{req.type}</strong><br />
              Status: {req.status}
            </Popup>
          </Marker>
        ))}

        {/* Route Leg 1 */}
        {legAmbToPatient && (
          <Polyline
            positions={legAmbToPatient.coords}
            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
          />
        )}

        {/* Route Leg 2 */}
        {legPatientToHosp && (
          <Polyline
            positions={legPatientToHosp.coords}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {selectedRequestId && (legAmbToPatient || legPatientToHosp) && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 z-[500] text-xs">
          <div className="flex gap-4">
            {legAmbToPatient && (
              <div>
                <p className="text-blue-400 font-bold uppercase text-[9px]">To Patient</p>
                <p className="text-white text-sm">{legAmbToPatient.durMin} ({legAmbToPatient.distKm})</p>
              </div>
            )}
            {legPatientToHosp && (
              <div className="border-l border-white/20 pl-4">
                <p className="text-emerald-400 font-bold uppercase text-[9px]">To Hospital</p>
                <p className="text-white text-sm">{legPatientToHosp.durMin} ({legPatientToHosp.distKm})</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
