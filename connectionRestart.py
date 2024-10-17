import os
import time
import requests
import subprocess

MONITOR_SCRIPT_PATH = 'monitor.py'
monitor_process = None

def check_internet_connection():
    try:
        response = requests.get('https://www.google.com', timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False

def start_monitor():
    global monitor_process
    monitor_process = subprocess.Popen(['python3', MONITOR_SCRIPT_PATH])
    print("Start successful")

def stop_monitor():
    global monitor_process
    if monitor_process:
        monitor_process.terminate()
        monitor_process.wait()
        monitor_process = None
        print("Stop successful")

def check_display_change():
    try:
        result = subprocess.run(['xrandr', '--current'], stdout=subprocess.PIPE)
        return result.stdout.decode('utf-8')
    except Exception as e:
        print(f"Error checking display: {e}")
        return None

def main():
    internet_connected = check_internet_connection()
    current_display_state = check_display_change()

    if internet_connected:
        print("Internet connected. Running monitor.py...")
        start_monitor()

    while True:
        time.sleep(5)

        # Check for internet reconnection
        new_connection_status = check_internet_connection()
        if new_connection_status and not internet_connected:
            print("Internet reconnected. Running monitor.py...")
            start_monitor()

        elif not new_connection_status and internet_connected:
            print("Internet disconnected. Stopping monitor.py...")
            stop_monitor()

        internet_connected = new_connection_status

        # Check for display change
        new_display_state = check_display_change()
        if new_display_state and new_display_state != current_display_state:
            print("Display changed. Restarting monitor.py...")
            stop_monitor()
            start_monitor()
            current_display_state = new_display_state

if __name__ == "__main__":
    main()
