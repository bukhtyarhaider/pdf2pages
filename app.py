import os
import time
from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_pdf_to_images(pdf_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    start_time = time.time()
    images = convert_from_path(pdf_path)
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f'page_{i+1}.png')
        image.save(image_path, 'PNG')
    elapsed = time.time() - start_time
    return len(images), elapsed

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'pdf_file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['pdf_file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(pdf_path)
            output_dir = os.path.join(app.config['OUTPUT_FOLDER'], os.path.splitext(filename)[0])
            num_pages, elapsed = convert_pdf_to_images(pdf_path, output_dir)
            flash(f'Converted {num_pages} pages in {elapsed:.2f} seconds. Download images below.')
            return redirect(url_for('output', folder=os.path.splitext(filename)[0]))
        else:
            flash('Invalid file type. Please upload a PDF.')
            return redirect(request.url)
    return render_template('index.html')

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

if __name__ == '__main__':
    app.run(debug=True)
