import pandas as pd
import tkinter as tk
from tkinter import font
import requests
from datetime import datetime

url = "https://akita-healthy-suitably.ngrok-free.app"

root = tk.Tk()
root.title("JCI Job Board - Mayo Clinic") 
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
root.geometry(f"{screen_width}x{screen_height}")
root.attributes("-fullscreen", True)
root.bind("<Escape>", lambda e: root.destroy())

root.attributes("-type", "splash")

frame_smh = tk.Frame(root)
frame_smh.grid(row=0, column=0, sticky="nsew")

separator_frame = tk.Frame(root, width=2, bg="black")
separator_frame.grid(row=0, column=1, sticky="ns")

frame_rmh = tk.Frame(root)
frame_rmh.grid(row=0, column=2, sticky="nsew")

root.grid_columnconfigure(0, weight=1)
root.grid_columnconfigure(1, weight=0)
root.grid_columnconfigure(2, weight=1)
root.grid_rowconfigure(0, weight=1)

status_bar = tk.Frame(root, height=30)
status_bar.grid(row=1, column=0, columnspan=3, sticky="ew")

internet_status_label = tk.Label(
    status_bar,
    text="Disconnected ᯤ",
    anchor="w",
    font=("Arial", 16),
    padx=10,
    pady=5,
    fg="red"
)
internet_status_label.pack(side="left")

status_label = tk.Label(
    status_bar, 
    text="No actions yet",
    anchor="e", 
    font=("Arial", 16),
    padx=10,
    pady=5
)
status_label.pack(side="right", fill="both")

def update_status_bar(database):
    current_time = datetime.now().strftime("%m/%d/%Y %I:%M %p")
    status_label.config(text=f"Last Updated: {database} - {current_time}")

def init_internetStatus():
    try:
        response = requests.get("https://www.google.com", timeout=5)
        if response.status_code == 200:
            internet_status_label.config(text="Connected ᯤ", fg="green")
        else:
            internet_status_label.config(text="Disconnected 🔴 Restart Monitor", fg="red")
    except requests.RequestException:
        internet_status_label.config(text="Disconnected 🔴 Restart Monitor", fg="red")

def update_internetStatus():
    try:
        response = requests.get("https://www.google.com", timeout=5)
        if response.status_code != 200:
            internet_status_label.config(text="Disconnected 🔴 Restart Monitor", fg="red")
    except requests.RequestException:
        internet_status_label.config(text="Disconnected 🔴 Restart Monitor", fg="red")

    root.after(5000, update_internetStatus)
    

def scroll_text(label, text, column_index, scroll_delay=150, restart_delay=3000):
    gap_sizes = {
        0: 10,  # 'Job#' column (smaller gap)
        1: 15,  # 'Loc.' column (medium gap)
        2: 35   # 'Tasks' column (larger gap)
    }
    gap = " " * gap_sizes.get(column_index, 40)
    original_text = text
    text = text + gap
    def scroll():
        nonlocal text
        text = text[1:] + text[0]
        label.config(text=text)
        if text[:len(original_text)] == original_text:
            label.after(restart_delay, start_scrolling)
        else:
            label.after(scroll_delay, scroll)
    def start_scrolling():
        nonlocal text
        text = original_text + gap
        scroll()
    start_scrolling()

def smooth_scroll_text(label, text, delay=100, scroll_step=1):
    full_text = text + " " * 20
    text_length = len(full_text)
    def scroll(current_index):
        new_text = full_text[current_index:current_index + 50]
        label.config(text=new_text)
        next_index = (current_index + scroll_step) % text_length
        label.after(delay, lambda: scroll(next_index))
    scroll(0)

def update_table(data, frame, headers):
    filtered_data = data[['Job#', 'Loc.', 'Tasks']] if 'Job#' in data.columns else pd.DataFrame()
    for widget in frame.winfo_children():
        widget.destroy()

    column_widths = [
        int(screen_width * 0.06),  # Width for 'Job#' (6% of screen width)
        int(screen_width * 0.09), # Width for 'Loc.' (9% of screen width)
        int(screen_width * 0.35)    # Width for 'Tasks' (35% of screen width)
    ]
    for i, width in enumerate(column_widths):
        frame.grid_columnconfigure(i, minsize=width)

    for i, header in enumerate(headers):
        label = tk.Label(
            frame,
            text=header,
            font=('Arial', 24),
            bg="red",
            fg="black",
            borderwidth=2,
            relief="solid",
            padx=5,
            pady=5,
            anchor="center"
        )
        label.grid(row=0, column=i, sticky="nsew")

    for row_idx, row in filtered_data.iterrows():
        for col_idx, value in enumerate(row):
            label = tk.Label(
                frame,
                text=value,
                font=('Arial', 18),
                borderwidth=2, 
                relief="solid",
                padx=5,
                pady=5,
                width=1,
                anchor="center" if col_idx < 2 else "w"
            )
            label.grid(row=row_idx + 1, column=col_idx, sticky="nsew")

            text_font = font.Font(family="Arial", size=18)
            text_width = text_font.measure(value)
            if col_idx == 2:
                max_width = column_widths[col_idx] - 50
            else:
                max_width = column_widths[col_idx] - 20
            if text_width > max_width:
                label.config(anchor="w")
                scroll_text(label, value, col_idx)
            else:
                label.config(text=value)

def get_sheet_data(sheet_name):
    response = requests.get(f"{url}/get_sheet_data/{sheet_name}")
    if response.status_code == 200:
        data = response.json().get('data', [])
        return pd.DataFrame(data)
    else:
        print(f"Failed to fetch sheet data: {response.json().get('message', 'Unknown error')}")
        return pd.DataFrame()

previous_data_smh = None
previous_data_rmh = None

def refresh_data():
    global previous_data_smh, previous_data_rmh
    data_smh = get_sheet_data('SMH')
    data_rmh = get_sheet_data('RMH')

    if not data_smh.empty and not data_smh.equals(previous_data_smh):
        update_table(data_smh, frame_smh, ['Job#', 'Loc.', 'SMH'])
        previous_data_smh = data_smh
        update_status_bar('SMH')

    if not data_rmh.empty and not data_rmh.equals(previous_data_rmh):
        update_table(data_rmh, frame_rmh, ['Job#', 'Loc.', 'RMH'])
        previous_data_rmh = data_rmh
        update_status_bar('RMH')

    root.after(5000, refresh_data)  # Refresh every 5 seconds

init_internetStatus()
update_internetStatus()

refresh_data()
root.mainloop()
