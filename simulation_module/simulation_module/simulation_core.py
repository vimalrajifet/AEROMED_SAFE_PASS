"""
AeroMed SafePass — Traffic Simulation Core
===========================================
Launches SUMO-GUI, spawns an AMBULANCE and a DRONE.
The drone flies ahead, clears traffic (vehicles move left / slow down),
forces upcoming traffic lights green, and the camera tracks them.
"""
import os
import sys
import math
import time
import random

from utils import ensure_sumo_home
ensure_sumo_home()

if 'SUMO_HOME' in os.environ:
    sys.path.append(os.path.join(os.environ['SUMO_HOME'], 'tools'))
else:
    sys.exit("Set SUMO_HOME first")

import traci
import sumolib

# ── Config ──────────────────────────────────────────────────────────
MAP_DIR     = "C:/Users/vimal/Documents/vimal/2026-03-11-14-25-49"
CONFIG      = os.path.join(MAP_DIR, "osm.sumocfg")
STEP_LEN    = 0.5          # seconds per simulation step
DRONE_LEAD  = 80            # metres the drone flies ahead
SCAN_RADIUS = 180           # metres — drone scanning zone
WARMUP      = 300           # steps to let traffic build before injection


class TrafficSimulation:

    def __init__(self):
        try:
            self.sumo_bin = sumolib.checkBinary('sumo-gui')
        except Exception:
            self.sumo_bin = sumolib.checkBinary('sumo')

    # ── run ─────────────────────────────────────────────────────────
    def run_visual_simulation(self):
        sumo_cmd = [
            self.sumo_bin,
            "-c", CONFIG,
            "--step-length", str(STEP_LEN),
            "--start",
        ]
        print("[SIM] Starting SUMO-GUI …")
        traci.start(sumo_cmd)

        try:
            # ── PHASE 1: Warm-up — let traffic fill the map ────────
            print(f"[SIM] Warming up for {WARMUP} steps …")
            for _ in range(WARMUP):
                traci.simulationStep()
            veh_count = len(traci.vehicle.getIDList())
            print(f"[SIM] Warm-up done.  {veh_count} vehicles on map.")

            # ── PHASE 2: Inject ambulance (retry up to 20 donors) ──
            ambulance_ok = False
            donors = list(traci.vehicle.getIDList())
            random.shuffle(donors)

            for donor in donors[:20]:
                edge = traci.vehicle.getRoadID(donor)
                if not edge or edge.startswith(":"):
                    continue

                # Pick a FAR destination for longer travel
                dest = self._farthest_dest(edge)
                if not dest:
                    continue

                # Build route
                route_id = "amb_route"
                try:
                    stage = traci.simulation.findRoute(edge, dest)
                    if stage and stage.edges and len(stage.edges) >= 5:
                        traci.route.add(route_id, stage.edges)
                        print(f"[SIM] Route has {len(stage.edges)} edges")
                    else:
                        continue
                except Exception:
                    continue

                # Try adding ambulance on this route
                try:
                    traci.vehicle.add(
                        "AMBULANCE_1", route_id,
                        typeID="DEFAULT_VEHTYPE",
                        departLane="best",
                        departSpeed="max",
                    )
                    ambulance_ok = True
                    print(f"[SIM] ✓ Ambulance added on edge '{edge}'")
                    break
                except Exception as e:
                    print(f"[SIM] edge '{edge}' failed: {e}")
                    # Remove the route so name can be reused
                    try:
                        traci.route.remove(route_id)
                    except Exception:
                        route_id = f"amb_route_{random.randint(0,9999)}"
                    continue

            if not ambulance_ok:
                print("[SIM] ✗ Could not inject ambulance on any edge.")
                return

            # Style the ambulance
            traci.vehicle.setColor("AMBULANCE_1", (255, 0, 0, 255))
            traci.vehicle.setSpeedFactor("AMBULANCE_1", 2.0)
            traci.vehicle.setMaxSpeed("AMBULANCE_1", 30)
            # CRITICAL: bits 0-2 ON (safe speed, accel, decel)
            #           bits 3-4 OFF (ignore right-of-way, ignore red lights)
            traci.vehicle.setSpeedMode("AMBULANCE_1", 7)

            # ── PHASE 3: Create drone POI ──────────────────────────
            ax, ay = traci.vehicle.getPosition("AMBULANCE_1")
            traci.poi.add(
                "DRONE_1", ax, ay + DRONE_LEAD,
                color=(0, 200, 255, 255), layer=200,
                width=14, height=14,
            )

            # Camera
            traci.gui.trackVehicle("View #0", "AMBULANCE_1")
            traci.gui.setZoom("View #0", 1500)

            print("[SIM] Drone deployed. Running SafePass corridor …")

            # ── PHASE 4: Main simulation loop ──────────────────────
            for step in range(10000):
                traci.simulationStep()
                time.sleep(0.03)

                # Check if ambulance still exists
                if "AMBULANCE_1" not in traci.vehicle.getIDList():
                    print("[SIM] ✓ Ambulance reached destination!")
                    time.sleep(2)
                    break

                try:
                    self._tick(step)
                except Exception as e:
                    # Non-fatal per-tick error — just continue
                    if step % 100 == 0:
                        print(f"[SIM] tick warn: {e}")

            print("[SIM] Simulation complete.")

        except Exception as e:
            print(f"[SIM ERROR] {e}")
            import traceback; traceback.print_exc()
        finally:
            traci.close()

    # ── per-tick logic (called every step) ─────────────────────────
    def _tick(self, step):
        ax, ay = traci.vehicle.getPosition("AMBULANCE_1")

        # Drone position — follow the actual road geometry ahead
        drone_pos = self._get_position_ahead("AMBULANCE_1", DRONE_LEAD)
        if drone_pos:
            dx, dy = drone_pos
        else:
            # Fallback: simple heading-based projection
            angle = traci.vehicle.getAngle("AMBULANCE_1")
            rad = math.radians(angle)
            dx = ax + DRONE_LEAD * math.sin(rad)
            dy = ay + DRONE_LEAD * math.cos(rad)

        # ── Move drone ────────────────────────────────────────────
        try:
            traci.poi.setPosition("DRONE_1", dx, dy)
        except Exception:
            pass

        # ── Get ambulance lane so we clear TO A DIFFERENT lane ─────
        try:
            amb_lane = traci.vehicle.getLaneIndex("AMBULANCE_1")
        except Exception:
            amb_lane = 0
        # Target lane = anything except the ambulance's lane
        clear_lane = 0 if amb_lane != 0 else 1

        # ── CLEAR THE ENTIRE CORRIDOR between ambulance and drone ──
        # Any vehicle within DRONE_LEAD + buffer of the ambulance that
        # sits between the ambulance and drone must change lanes.
        corridor_range = DRONE_LEAD + 30  # extra buffer behind drone
        drone_dist_sq = (dx - ax) ** 2 + (dy - ay) ** 2

        for vid in traci.vehicle.getIDList():
            if vid == "AMBULANCE_1":
                continue
            try:
                vx, vy = traci.vehicle.getPosition(vid)
                dist_to_amb = math.hypot(vx - ax, vy - ay)

                # Only consider vehicles within the corridor range
                if dist_to_amb > corridor_range:
                    continue

                # Check if the vehicle is AHEAD of the ambulance
                # (between ambulance and drone) using dot product
                # Vector from ambulance to drone
                adx, ady = dx - ax, dy - ay
                # Vector from ambulance to vehicle
                avx, avy = vx - ax, vy - ay

                # Dot product: positive = vehicle is ahead of ambulance
                dot = adx * avx + ady * avy
                if dot < -10:  # Behind the ambulance by more than 10m — skip
                    continue

                # Vehicle is in the corridor zone — force lane change
                traci.vehicle.setLaneChangeMode(vid, 0)
                traci.vehicle.changeLane(vid, clear_lane, 30)
                traci.vehicle.setColor(vid, (255, 255, 0, 200))
            except Exception:
                pass

        # ── Force ambulance to maintain speed ─────────────────────
        try:
            traci.vehicle.setSpeed("AMBULANCE_1", 20)  # force 20 m/s
        except Exception:
            pass

        # ── Green Wave — ambulance lane GREEN, all others RED ─────
        try:
            for tls_info in traci.vehicle.getNextTLS("AMBULANCE_1"):
                tls_id    = tls_info[0]   # traffic light id
                link_idx  = tls_info[1]   # which link the ambulance uses
                # Build custom state: ambulance link = Green, rest = red
                current_state = traci.trafficlight.getRedYellowGreenState(tls_id)
                new_state = list('r' * len(current_state))  # all red
                if 0 <= link_idx < len(new_state):
                    new_state[link_idx] = 'G'               # ambulance lane green
                traci.trafficlight.setRedYellowGreenState(tls_id, ''.join(new_state))

                # Highlight the signal with a green POI
                try:
                    poi_name = f"tls_{tls_id}"
                    jx, jy = traci.junction.getPosition(tls_id)
                    if poi_name not in traci.poi.getIDList():
                        traci.poi.add(poi_name, jx, jy,
                                      color=(0, 255, 0, 200),
                                      layer=150, width=25, height=25)
                except Exception:
                    pass
        except Exception:
            pass

        # ── Re-lock camera periodically ───────────────────────────
        if step % 50 == 0:
            try:
                traci.gui.trackVehicle("View #0", "AMBULANCE_1")
            except Exception:
                pass

    # ── helpers ─────────────────────────────────────────────────────
    @staticmethod
    def _get_position_ahead(veh_id, lead_dist):
        """
        Walk along the vehicle's remaining route edges to find the
        on-road (x, y) position `lead_dist` metres ahead.
        Returns (x, y) or None if it cannot be computed.
        """
        try:
            route_edges = traci.vehicle.getRoute(veh_id)
            route_idx   = traci.vehicle.getRouteIndex(veh_id)
            lane_idx    = traci.vehicle.getLaneIndex(veh_id)
            lane_pos    = traci.vehicle.getLanePosition(veh_id)

            remaining = lead_dist

            # Walk forward through the route edges starting from the current one
            for i in range(route_idx, len(route_edges)):
                edge_id  = route_edges[i]
                lane_id  = f"{edge_id}_{lane_idx}"

                try:
                    shape = traci.lane.getShape(lane_id)
                except Exception:
                    # Lane index might not exist on this edge, try lane 0
                    try:
                        shape = traci.lane.getShape(f"{edge_id}_0")
                    except Exception:
                        continue

                if not shape or len(shape) < 2:
                    continue

                # On the first (current) edge, skip to the ambulance position
                if i == route_idx:
                    # Build cumulative distances along the shape
                    seg_dists = []
                    cum = 0.0
                    for j in range(1, len(shape)):
                        seg_len = math.hypot(shape[j][0] - shape[j-1][0],
                                             shape[j][1] - shape[j-1][1])
                        cum += seg_len
                        seg_dists.append(cum)

                    total_edge_len = cum if cum > 0 else 1.0

                    # Distance remaining on this edge from the vehicle
                    dist_on_edge = total_edge_len - lane_pos
                    if dist_on_edge < 0:
                        dist_on_edge = 0

                    if remaining <= dist_on_edge:
                        # The target point is on this edge
                        target_pos = lane_pos + remaining
                        return TrafficSimulation._interpolate_shape(shape, seg_dists, target_pos)
                    else:
                        remaining -= dist_on_edge
                else:
                    # Full edge — measure its length
                    cum = 0.0
                    seg_dists = []
                    for j in range(1, len(shape)):
                        seg_len = math.hypot(shape[j][0] - shape[j-1][0],
                                             shape[j][1] - shape[j-1][1])
                        cum += seg_len
                        seg_dists.append(cum)

                    edge_len = cum if cum > 0 else 1.0

                    if remaining <= edge_len:
                        return TrafficSimulation._interpolate_shape(shape, seg_dists, remaining)
                    else:
                        remaining -= edge_len

        except Exception:
            pass
        return None

    @staticmethod
    def _interpolate_shape(shape, seg_dists, target_dist):
        """
        Given a lane shape (list of (x,y) points) and cumulative segment
        distances, return the (x,y) at `target_dist` along the shape.
        """
        if target_dist <= 0:
            return shape[0]

        prev_cum = 0.0
        for j, cum in enumerate(seg_dists):
            if target_dist <= cum:
                seg_len = cum - prev_cum
                if seg_len <= 0:
                    return shape[j + 1]
                frac = (target_dist - prev_cum) / seg_len
                x = shape[j][0] + frac * (shape[j + 1][0] - shape[j][0])
                y = shape[j][1] + frac * (shape[j + 1][1] - shape[j][1])
                return (x, y)
            prev_cum = cum

        # Past the end — return last point
        return shape[-1]

    @staticmethod
    def _random_dest(exclude):
        edges = [e for e in traci.edge.getIDList()
                 if not e.startswith(":") and e != exclude]
        return random.choice(edges) if edges else None

    @staticmethod
    def _farthest_dest(start_edge):
        """Pick a destination that produces a LONG route."""
        edges = [e for e in traci.edge.getIDList()
                 if not e.startswith(":") and e != start_edge]
        random.shuffle(edges)
        best_edge = None
        best_cost = 0
        # Sample 30 random edges, keep the one with the longest route
        for e in edges[:30]:
            try:
                stage = traci.simulation.findRoute(start_edge, e)
                if stage and stage.edges and len(stage.edges) > best_cost:
                    best_cost = len(stage.edges)
                    best_edge = e
            except Exception:
                continue
        return best_edge

    # ── ETA math model ─────────────────────────────────────────────
    @staticmethod
    def compute_comparison(dist_km: float) -> dict:
        t_n = (dist_km / 30) * 1.5 * 3600 + dist_km * 20
        t_s = (dist_km / 50) * 1.05 * 3600
        return {
            "normal_eta": int(math.ceil(t_n)),
            "safepass_eta": int(math.ceil(t_s)),
            "distance": dist_km,
        }

    # ── Public API ─────────────────────────────────────────────────
    def run_full_demo(self, dist_km: float) -> dict:
        try:
            self.run_visual_simulation()
        except Exception as e:
            print(f"[WARN] Visual sim skipped: {e}")
        return self.compute_comparison(dist_km)

if __name__ == "__main__":
    sim = TrafficSimulation()
    sim.run_visual_simulation()
