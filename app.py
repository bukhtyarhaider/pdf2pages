import os
import time
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, Response, jsonify
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path, pdfinfo_from_path
import threading
import uuid

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Store progress: {job_id: {progress: 0, total: 0, status: 'starting', folder: ''}}
jobs = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_pdf_to_images_with_progress(pdf_path, output_dir, job_id):
    try:
        info = pdfinfo_from_path(pdf_path)
        total_pages = info['Pages']
        jobs[job_id]['total'] = total_pages
        jobs[job_id]['status'] = 'converting'
        
        os.makedirs(output_dir, exist_ok=True)
        start_time = time.time()
        
        for i in range(1, total_pages + 1):
            image = convert_from_path(pdf_path, first_page=i, last_page=i)[0]
            image_path = os.path.join(output_dir, f'page_{i}.png')
            image.save(image_path, 'PNG')
            jobs[job_id]['progress'] = i
        
        elapsed = time.time() - start_time
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['elapsed'] = elapsed
    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'pdf_file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files['pdf_file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(pdf_path)
            
            folder = os.path.splitext(filename)[0]
            output_dir = os.path.join(app.config['OUTPUT_FOLDER'], folder)
            
            job_id = str(uuid.uuid4())
            jobs[job_id] = {'progress': 0, 'total': 0, 'status': 'starting', 'folder': folder}
            
            # Start conversion in background
            thread = threading.Thread(target=convert_pdf_to_images_with_progress, args=(pdf_path, output_dir, job_id))
            thread.start()
            
            return jsonify({"job_id": job_id})
        else:
            return jsonify({"error": "Invalid file type"}), 400
    
    # List previous conversions
    conversions = []
    if os.path.exists(app.config['OUTPUT_FOLDER']):
        conversions = sorted([d for d in os.listdir(app.config['OUTPUT_FOLDER']) 
                             if os.path.isdir(os.path.join(app.config['OUTPUT_FOLDER'], d))],
                             key=lambda x: os.path.getmtime(os.path.join(app.config['OUTPUT_FOLDER'], x)),
                             reverse=True)
    
    return render_template('index.html', conversions=conversions)

@app.route('/progress/<job_id>')
def progress(job_id):
    def generate():
        while True:
            job = jobs.get(job_id)
            if not job:
                break
            
            data = f"data: {{\"progress\": {job['progress']}, \"total\": {job['total']}, \"status\": \"{job['status']}\", \"folder\": \"{job['folder']}\"}}\n\n"
            yield data
            
            if job['status'] in ['completed', 'failed']:
                break
            time.sleep(0.5)
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/output/<folder>')
def output(folder):
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], folder)
    if not os.path.exists(output_dir):
        flash('No images found for this PDF.')
        return redirect(url_for('index'))
    images = sorted([f for f in os.listdir(output_dir) if f.endswith('.png')])
    return render_template('output.html', folder=folder, images=images)

@app.route('/download/<folder>/<filename>')
def download_image(folder, filename):
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], folder)
    return send_from_directory(output_dir, filename, as_attachment=True)

import zipfile
import io
from flask import send_file

@app.route('/zip', methods=['POST'])
def zip_images():
    data = request.json
    folder = data.get('folder')
    filenames = data.get('filenames')
    
    if not folder or not filenames:
        return {"error": "Missing data"}, 400
        
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], folder)
    
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w') as zf:
        for filename in filenames:
            file_path = os.path.join(output_dir, filename)
            if os.path.exists(file_path):
                zf.write(file_path, filename)
    
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'{folder}.zip'
    )

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
