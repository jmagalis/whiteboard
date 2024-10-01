from flask import Flask, render_template, request, jsonify, send_from_directory
import pandas as pd
from datetime import datetime
from flask_cors import CORS
import os
import shutil
import schedule
import time
import threading

app = Flask(__name__)
CORS(app)
log_path = 'log.xlsx'
database_path = 'MAYO.xlsx'
backup_path = os.path.join(os.path.dirname(__file__), "backupLog")
log_changed_today = False

@app.route('/')
def job_board():
    return render_template('job_board.html')

@app.route('/routes', methods=['GET'])
def list_routes():
    output = []
    for rule in app.url_map.iter_rules():
        output.append(f"{rule} -> {rule.endpoint}")
    return jsonify(output)

def log_action(action, job_id, location=None, task=None, client_name=None, database=None, balDate=None, comDate=None, installTask=None, techTask=None, designTask=None, lssTask=None):
    global log_changed_today
    log_changed_today = True
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S') # Get timestamp

    try:
        log_df = pd.read_excel(log_path)
    except FileNotFoundError:
        log_df = pd.DataFrame(columns=['Timestamp', 'Action', 'Job#', 'Loc.', 'Tasks', 'Database', 'User', 'Bal Date', 'Com Date', 'Install', 'Tech', 'Design', 'Lead'])
        log_df.to_excel(log_path, index=False)
    except Exception as e:
        print(f"Error reading log file: {e}")
        return {"status": "error", "message": "Error reading log file."}, 500

    new_entry = {
        'Timestamp': timestamp,
        'Action': action,
        'Job#': job_id,
        'Loc.': location,
        'Tasks': task,
        'Database': database,
        'User': client_name,
        'Bal Date': balDate,
        'Com Date': comDate,
        'Install': installTask,
        'Tech': techTask,
        'Design': designTask,
        'Lead': lssTask
    }

    log_df = pd.concat([log_df, pd.DataFrame([new_entry])], ignore_index=True)
    log_df.to_excel(log_path, index=False)

def backup_and_clear_log():
    global log_changed_today
    if log_changed_today:
        if not os.path.exists(backup_path):
            os.makedirs(backup_path)
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        backup_file_path = os.path.join(backup_path, f"log_backup_{timestamp}.xlsx")
        shutil.copy(log_path, backup_file_path)
        print(f"Backup created: {backup_file_path}")
        columns = ['Timestamp', 'Action', 'Job#', 'Loc.', 'Tasks', 'Database', 'User', 'Bal Date', 'Com Date', 'Install', 'Tech', 'Design', 'Lead']
        empty_df = pd.DataFrame(columns=columns)
        empty_df.to_excel(log_path, index=False)
        print(f"Log file cleared: {log_path}")
        log_changed_today = False
    else:
        print("No changes made today, no backup needed.")

# API endpoint - Add Job
@app.route('/add_job_<database_id>', methods=['POST'])
def add_job(database_id):
    job_data = request.json
    new_job = {key: value for key, value in job_data.items() if key != 'Database'}
    df = pd.read_excel(database_path, sheet_name=database_id)
    job_id = new_job['Job#']
    if job_id in df['Job#'].values:
        return jsonify({'status': 'error', 'message': f'Duplicate Job - Job {job_id} already created'}), 404
    df = df.append(new_job, ignore_index=True)
    with pd.ExcelWriter(database_path, mode='a', if_sheet_exists='replace', engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=database_id, index=False)
    log_action('Add', new_job['Job#'], new_job['Loc.'], new_job['Tasks'], new_job['Last Modified'], job_data['Database'], new_job['Bal Date'], new_job['Com Date'], new_job['Install'], new_job['Tech'], new_job['Design'], new_job['Lead'])
    return jsonify({'message': 'Job added successfully'})

# API endpoint - Delete Job
@app.route('/delete_job_<database_id>/<job_id>', methods=['DELETE'])
def delete_job(database_id, job_id):
    df = pd.read_excel(database_path, sheet_name=database_id, dtype={'Job#': str})
    if job_id not in df['Job#'].values:
        return jsonify({'status': 'error', 'message': f'Job {job_id} not found'}), 404
    df = df[df['Job#'] != job_id]
    with pd.ExcelWriter(database_path, mode='a', if_sheet_exists='replace', engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=database_id, index=False)
    log_action('Delete', job_id, client_name=request.json.get('Client'), database=database_id)
    return jsonify({'status': 'success', 'message': f'Job {job_id} deleted successfully'})

# API endpoint - Edit Job
@app.route('/update_job_<database_id>', methods=['PUT'])
def update_job(database_id):
    job_data = request.json
    df = pd.read_excel(database_path, sheet_name=database_id)
    orig_job_id = job_data['OldJob#']
    job_id = job_data['Job#']
    if orig_job_id not in df['Job#'].values:
            return jsonify({'status': 'error', 'message': f'Job {orig_job_id} not found'}), 404
    if orig_job_id != job_id:
        """ job_id = job_data['OldJob#'] """
        if job_id in df['Job#'].values:
            return jsonify({'status': 'error', 'message': f'Duplicate Job - Job {job_id} already created'}), 404
        df.loc[df['Job#'] == orig_job_id, 'Job#'] = job_data['Job#']
    df.loc[df['Job#'] == orig_job_id, 'Loc.'] = job_data['Loc.']
    df.loc[df['Job#'] == orig_job_id, 'Tasks'] = job_data['Tasks']
    df.loc[df['Job#'] == orig_job_id, 'Bal Date'] = job_data['Bal Date']
    df.loc[df['Job#'] == orig_job_id, 'Com Date'] = job_data['Com Date']
    df.loc[df['Job#'] == orig_job_id, 'Install'] = job_data['Install']
    df.loc[df['Job#'] == orig_job_id, 'Tech'] = job_data['Tech']
    df.loc[df['Job#'] == orig_job_id, 'Design'] = job_data['Design']
    df.loc[df['Job#'] == orig_job_id, 'Lead'] = job_data['Lead']
    df.loc[df['Job#'] == orig_job_id, 'Last Modified'] = job_data['Last Modified']
    with pd.ExcelWriter(database_path, mode='a', if_sheet_exists='replace', engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=database_id, index=False)
    log_action('Update', job_data['Job#'], job_data['Loc.'], job_data['Tasks'], job_data['Last Modified'], job_data['Database'], job_data['Bal Date'], job_data['Com Date'], job_data['Install'], job_data['Tech'], job_data['Design'], job_data['Lead'])
    return jsonify({'status': 'success', 'message': f'Job {job_id} updated successfully'})

@app.route('/search_<category_id>_<database_id>/<search_id>', methods=['GET'])
def search(category_id, database_id, search_id):
    if category_id == "job":
        headerSearchID = 'Job#'
        errorTitle = 'Job'
    elif category_id == "location":
        headerSearchID = 'Loc.'
        errorTitle = 'Location'
    elif category_id == "task":
        headerSearchID = 'Tasks'
        errorTitle = 'Task'
    elif category_id == "bal-date":
        headerSearchID = 'Bal Date'
        errorTitle = 'Balancing Date'
    elif category_id == "com-date":
        headerSearchID = 'Com Date'
        errorTitle = 'Commissioning Date'
    elif category_id == "ins-task":
        headerSearchID = 'Install'
        errorTitle = 'Installer Task'
    elif category_id == "tec-task":
        headerSearchID = 'Tech'
        errorTitle = 'Technician Task'
    elif category_id == "des-task":
        headerSearchID = 'Design'
        errorTitle = 'Designer Task'
    elif category_id == "lss-task":
        headerSearchID = 'Lead'
        errorTitle = 'LSS Task'
    else:
        return jsonify({'error': 'Invalid category'}), 400
    df = pd.read_excel(database_path, sheet_name=database_id, dtype={headerSearchID: str})
    matching_rows = df[df[headerSearchID].str.contains(search_id, case=False, na=False)]
    if matching_rows.empty:
        return jsonify({'status': 'error', 'message': f'{errorTitle} {search_id} not found'}), 404
    data = matching_rows.to_dict(orient='records')

    if data:
        cleaned_data = []
        for record in data:
            cleaned_record = {key: (None if isinstance(value, float) and pd.isna(value) else value) for key, value in record.items()}
            cleaned_record.pop('Client', None)
            cleaned_data.append(cleaned_record)

        return jsonify(cleaned_data)
    else:
        return jsonify({'error': 'Not found'}), 404
    
@app.route('/viewAll_<category_id>_<database_id>', methods=['GET'])
def viewAll(category_id, database_id):
    if category_id == "job":
        headerSearchID = 'Job#'
    elif category_id == "location":
        headerSearchID = 'Loc.'
    elif category_id == "task":
        headerSearchID = 'Tasks'
    elif category_id == "bal-date":
        headerSearchID = 'Bal Date'
    elif category_id == "com-date":
        headerSearchID = 'Com Date'
    elif category_id == "ins-task":
        headerSearchID = 'Install'
    elif category_id == "tec-task":
        headerSearchID = 'Tech'
    elif category_id == "des-task":
        headerSearchID = 'Design'
    elif category_id == "lss-task":
        headerSearchID = 'Lead'
    else:
        return jsonify({'error': 'Invalid category'}), 400
    try:
        df = pd.read_excel(database_path, sheet_name=database_id, dtype={headerSearchID: str})
    except ValueError:
        return jsonify({'error': 'Invalid database'}), 400
    filtered_df = df[df[headerSearchID].notna() & (df[headerSearchID] != '')]
    data = filtered_df.to_dict(orient='records')
    cleaned_data = []
    for record in data:
        cleaned_record = {
            key: value for key, value in record.items()
            if pd.notna(value) and value != '' and key != 'Client'
        }
        if cleaned_record:
            cleaned_data.append(cleaned_record)
    if cleaned_data:
        return jsonify(cleaned_data)
    else:
        return jsonify({'error': 'No records found'}), 404

@app.route('/get_sheet_data/<sheet_name>', methods=['GET'])
def get_sheet_data(sheet_name):
    try:
        df = pd.read_excel(database_path, sheet_name=sheet_name)
        data = df.fillna('').to_dict(orient='records')
        return jsonify({'status': 'success', 'data': data})
    except ValueError:
        return jsonify({'status': 'error', 'message': f'Sheet {sheet_name} not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def run_scheduler():
    schedule.every().day.at("23:59").do(backup_and_clear_log)
    while True:
        schedule.run_pending()
        time.sleep(60)

def run_flask():
    app.run(debug=True, host='0.0.0.0', port=5021)

def run_parallel():
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    run_flask()

if __name__ == '__main__':
    run_parallel()
