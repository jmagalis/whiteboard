from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import pyautogui
import time
import subprocess
import os
import requests

def check_internet(attempts=3, delay=3):
    for attempt in range(attempts):
        try:
            response = requests.get("https://www.google.com", timeout=5)
            if response.status_code == 200:
                return True
        except (requests.ConnectionError, requests.Timeout):
            time.sleep(5)
    return False

def connect_to_wifi():
    os.system(f"nmcli d wifi connect 'mayoguest'")

def close_pop_up():
    try:
        print("Attempting to press 'Esc' to close the pop-up...")
        pyautogui.press('esc')
        time.sleep(2)
        print("Pressed 'Esc' to close the pop-up window.")
        return True
    except Exception as e:
        print(f"An error occurred while trying to close the pop-up window: {e}")
    return False

def authenticate():
    options = Options()
    options.add_argument("--headless")  # Optional: Run in headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver_path = "/usr/bin/chromedriver"  # Update this path accordingly
    driver = webdriver.Chrome(service=Service(driver_path), options=options)
    
    try:
        portal_url = "http://mayo.edu"
        driver.get(portal_url)
        time.sleep(5)
        accept_button = driver.find_element(By.ID, "ui_aup_accept_button")
        accept_button.click()
        print("Clicked 'Accept' button via Selenium.")
        time.sleep(5)
        
    except Exception as e:
        print(f"An error occurred during Selenium authentication: {e}")
    
    finally:
        driver.quit()

def main():
    while True:
        if not check_internet():
            print("No internet connection. Connecting to WiFi...")
            connect_to_wifi()
            time.sleep(10)  # Wait for WiFi connection to establish

            if not check_internet():
                print("Captive portal detected. Closing pop-up window...")
                success = close_pop_up()
                
                if success:
                    print("Authenticating via Selenium...")
                    authenticate()
                else:
                    print("Failed to close the pop-up window.")
        
        print("Internet is available. Sleeping for 60 seconds...")
        time.sleep(60)

if __name__ == "__main__":
    main()
