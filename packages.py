import subprocess

def main():
    commands = [
        "sudo apt install python3-pandas"
        "sudo apt install python3-selenium",
        "pip install chromium-chromedriver",
        "sudo pip3 install pyautogui --break-system-packages",
    ]

    for command in commands:
        try:
            result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            print(f"Command '{command}' ran successfully.\nOutput:\n{result.stdout}")
        except subprocess.CalledProcessError as e:
            print(f"Error running command '{command}': {e.stderr}")
    print("Package Installation Success")

if __name__ == "__main__":
    main()
