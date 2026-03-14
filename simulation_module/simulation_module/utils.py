import os
import math
import subprocess
import tempfile

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def generate_sumo_config(route_file, net_file="osm.net.xml"):
    """
    Generates a generic sumocfg file.
    """
    config_content = f"""<configuration>
    <input>
        <net-file value="{net_file}"/>
        <route-files value="{route_file}"/>
    </input>
    <time>
        <begin value="0"/>
        <end value="1000"/>
    </time>
</configuration>"""
    return config_content

def ensure_sumo_home():
    if 'SUMO_HOME' not in os.environ:
        # List of potential SUMO installation paths to check
        potential_paths = [
            "d:/tools",  # Original path
            "C:/Program Files (x86)/Eclipse/Sumo",
            "C:/Program Files/Eclipse/Sumo",
        ]
        for path in potential_paths:
            # A good way to verify a SUMO installation is to check for the 'tools' directory
            if os.path.isdir(os.path.join(path, 'tools')):
                os.environ['SUMO_HOME'] = path
                print(f"[INFO] Found and set SUMO_HOME to '{path}'")
                break # Stop after finding the first valid path
    return os.environ.get('SUMO_HOME')
