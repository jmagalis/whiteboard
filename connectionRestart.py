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

def main():
    internet_connected = check_internet_connection()

    if internet_connected:
        print("Internet connected. Running monitor.py...")
        start_monitor()

    while True:
        time.sleep(5)
        new_connection_status = check_internet_connection()

        if new_connection_status and not internet_connected:
            print("Internet reconnected. Running monitor.py...")
            start_monitor()

        elif not new_connection_status and internet_connected:
            print("Internet disconnected. Stopping monitor.py...")
            stop_monitor()

        internet_connected = new_connection_status

if __name__ == "__main__":
    main()
