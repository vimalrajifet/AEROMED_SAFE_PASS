



import pybullet as p
import pybullet_data
import serial
import serial.tools.list_ports
import time
import math
import os

BAUD = 115200
PORT = "COM14"

def connect_serial():
    ports = list(serial.tools.list_ports.comports())
    print("\nAvailable Ports:")
    for port in ports:
        print(f"  {port.device} - {port.description}")
    try:
        s = serial.Serial(PORT, BAUD, timeout=0.05)
        print(f"\nConnected to {PORT}\n")
        return s
    except Exception as e:
        print(f"\nFailed to connect to {PORT}: {e}\n")
        return None

ser = connect_serial()
time.sleep(2)

# =============================================
# PYBULLET SETUP
# =============================================
physicsClient = p.connect(p.GUI)
p.configureDebugVisualizer(p.COV_ENABLE_GUI, 0)      # Hide sidebars
p.configureDebugVisualizer(p.COV_ENABLE_SHADOWS, 1)  # Enable shadows
p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.setGravity(0, 0, 0)  # No gravity, we control everything

# Load Floor
p.loadURDF("plane.urdf")

# Add a grid for better depth perception
grid_size = 30
grid_spacing = 2.0
for i in range(-grid_size, grid_size + 1):
    p.addUserDebugLine([i * grid_spacing, -grid_size * grid_spacing, 0.01], 
                       [i * grid_spacing, grid_size * grid_spacing, 0.01], [0.3, 0.3, 0.3])
    p.addUserDebugLine([-grid_size * grid_spacing, i * grid_spacing, 0.01], 
                       [grid_size * grid_spacing, i * grid_spacing, 0.01], [0.3, 0.3, 0.3])

# Add a Large Landing Pad (Visual only)
pad_id = p.createVisualShape(p.GEOM_BOX, halfExtents=[1.5, 1.5, 0.01], rgbaColor=[0.1, 0.1, 0.1, 1])
p.createMultiBody(baseVisualShapeIndex=pad_id, basePosition=[0, 0, 0.01])
# Add yellow border for industrial look
border_id = p.createVisualShape(p.GEOM_BOX, halfExtents=[1.6, 1.6, 0.005], rgbaColor=[1, 0.8, 0, 1])
p.createMultiBody(baseVisualShapeIndex=border_id, basePosition=[0, 0, 0.005])

# Load Drone Model
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
drone_urdf = os.path.join(SCRIPT_DIR, "quadrotor.urdf")

if os.path.exists(drone_urdf):
    drone = p.loadURDF(drone_urdf, [0, 0, 1])
else:
    print("Using cube (quadrotor.urdf not found)")
    drone = p.loadURDF("cube.urdf", [0, 0, 1])
    p.changeDynamics(drone, -1, mass=0.5)

# =============================================
# STATE
# =============================================
# Position
x, y, z = 0, 0, 1.0

# Velocity
vx, vy, vz = 0, 0, 0.0

# Heading (Yaw angle in radians)
yaw = 0.0

# Filter state (Python-side additional smoothing)
s_roll, s_pitch, s_yaw, s_thr = 0, 0, 0, 0
PY_ALPHA = 0.15  # Python-side secondary filter

# =============================================
# TUNING
# =============================================
MOVE_SPEED    = 0.008   # How fast pitch/roll translates to velocity
DRAG          = 0.92    # Velocity decay per frame (air resistance)
YAW_SPEED     = 0.005   # Yaw rotation rate (increased)
THR_SPEED     = 0.04    # Throttle vertical speed multiplier
THR_CENTER    = 40.0    # Resting throttle % (from debug: ~38-41)
THR_DEADBAND  = 8.0     # +/- around center = hover
PITCH_DEAD    = 3.0     # Deadband for pitch/roll
YAW_DEAD      = 5.0     # Deadband for yaw

print("Simulator Ready. Waiting for data...")

# =============================================
# MAIN LOOP
# =============================================
frame = 0

while True:
    try:
        # ---- READ SERIAL ----
        raw_r, raw_p, raw_y, raw_t = 0, 0, 0, THR_CENTER

        if ser and ser.in_waiting:
            # Flush old data, keep latest
            if ser.in_waiting > 200:
                ser.reset_input_buffer()
            try:
                line = ser.readline().decode().strip()
                parts = line.split(",")
                if len(parts) == 4:
                    raw_r = float(parts[0])
                    raw_p = float(parts[1])
                    raw_y = float(parts[2])
                    raw_t = float(parts[3])
            except:
                pass

        # ---- PYTHON-SIDE SMOOTHING ----
        s_roll  = s_roll  * (1 - PY_ALPHA) + raw_r * PY_ALPHA
        s_pitch = s_pitch * (1 - PY_ALPHA) + raw_p * PY_ALPHA
        s_yaw   = s_yaw   * (1 - PY_ALPHA) + raw_y * PY_ALPHA
        s_thr   = s_thr   * (1 - PY_ALPHA) + raw_t * PY_ALPHA

        # Clamp to sane range
        s_roll  = max(-50, min(50, s_roll))
        s_pitch = max(-50, min(50, s_pitch))
        s_yaw   = max(-50, min(50, s_yaw))
        s_thr   = max(0,   min(100, s_thr))

        # ---- CONTROL LOGIC ----

        # YAW (Rotate model + camera)
        # Deadband 28: idle noise ~15-25, need strong push to rotate
        if abs(s_yaw) > 28.0:
            yaw -= s_yaw * YAW_SPEED
            yaw = (yaw + math.pi) % (2 * math.pi) - math.pi

        # PITCH -> Forward/Back (in drone's heading direction)
        ax_local, ay_local = 0, 0
        if abs(s_pitch) > PITCH_DEAD:
            ax_local = -s_pitch * MOVE_SPEED  # Push forward = negative pitch = move +X

        # ROLL -> Left/Right (in drone's heading direction)
        if abs(s_roll) > PITCH_DEAD:
            ay_local = s_roll * MOVE_SPEED

        # Rotate local acceleration to world frame
        ax_world = ax_local * math.cos(yaw) - ay_local * math.sin(yaw)
        ay_world = ax_local * math.sin(yaw) + ay_local * math.cos(yaw)

        # Integrate velocity
        vx = (vx + ax_world) * DRAG
        vy = (vy + ay_world) * DRAG

        # THROTTLE -> Up/Down
        thr_offset = s_thr - THR_CENTER
        if abs(thr_offset) > THR_DEADBAND:
            vz = thr_offset * THR_SPEED
        else:
            vz *= 0.9  # Gentle stop when in deadband

        # Integrate position
        x += vx
        y += vy
        z += vz * 0.01  # Scale Z movement

        # Floor clamp
        if z < 0.05:
            z = 0.05
            vz = 0

        # ---- UPDATE VISUAL ----
        # Tilt drone based on input (visual only)
        vis_roll  = s_roll  * (math.pi / 180.0) * 0.5  # Half-scale tilt
        vis_pitch = -s_pitch * (math.pi / 180.0) * 0.5

        orn = p.getQuaternionFromEuler([vis_roll, vis_pitch, yaw])
        p.resetBasePositionAndOrientation(drone, [x, y, z], orn)

        # ---- CAMERA ----
        p.resetDebugVisualizerCamera(
            cameraDistance=3.0,
            cameraYaw=math.degrees(yaw) - 90,
            cameraPitch=-25,
            cameraTargetPosition=[x, y, z]
        )

        # ---- DEBUG PRINT (every 0.5s) ----
        frame += 1
        if frame % 50 == 0:
            print(f"R:{s_roll:+6.1f}  P:{s_pitch:+6.1f}  Y:{s_yaw:+6.1f}  T:{s_thr:5.1f}  |  Pos: {x:+.1f} {y:+.1f} {z:.2f}")

        p.stepSimulation()
        time.sleep(0.01)

    except KeyboardInterrupt:
        print("\nStopped by user.")
        break
    except Exception as e:
        print(f"Simulation ended: {e}")
        break

# Cleanup
if ser:
    ser.close()
try:
    p.disconnect()
except:
    pass
