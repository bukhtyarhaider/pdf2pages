<div align="center">

# PDF2Pages

**Convert a PDF into one high-quality PNG image per page from a simple Flask web interface.**

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Web_App-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PDF](https://img.shields.io/badge/PDF-to_PNG-EC1C24?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](#features)

</div>

PDF2Pages is a local-first PDF-to-image converter built with Python, Flask, `pdf2image`, Pillow, and Poppler. Upload a PDF, follow conversion progress in the browser, and download or revisit the generated PNG pages.

## Features

- Convert every PDF page into an individual PNG file
- Process pages in a background thread
- Track conversion progress with a job ID
- Preserve previous conversion folders for quick access
- Sanitize uploaded filenames before processing
- Run locally on macOS, Windows, or Linux
- Use a lightweight browser interface instead of a desktop GUI

## How it works

```text
PDF upload → secure filename → background conversion
           → page_1.png, page_2.png, ... → browser download
```

The application reads the PDF page count with Poppler, converts one page at a time, stores job progress in memory, and writes results into a named output directory.

## Requirements

- Python 3.9+
- Poppler
- Flask
- pdf2image
- Pillow
- Werkzeug

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/bukhtyarhaider/pdf2pages.git
cd pdf2pages
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

If a requirements file is unavailable:

```bash
pip install flask pdf2image Pillow werkzeug
```

### 4. Install Poppler

macOS:

```bash
brew install poppler
```

Ubuntu/Debian:

```bash
sudo apt-get install poppler-utils
```

Windows users can install a maintained Poppler build and add its `bin` directory to `PATH`.

## Run the application

```bash
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000), upload a PDF, and follow the progress indicator.

## Storage and production notes

- Uploaded PDFs and generated images are written to local folders.
- Job state is held in application memory and is not shared across multiple server processes.
- Add file-size limits, scheduled cleanup, a production secret key, and authenticated storage before exposing the app publicly.
- Avoid uploading confidential documents to deployments you do not control.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `PDFInfoNotInstalledError` | Poppler is installed and available on `PATH` |
| No pages are generated | The PDF opens normally and is not encrypted or corrupted |
| Permission errors | The application can write to `uploads/` and `outputs/` |
| Slow conversion | Large or high-resolution PDFs take more CPU and memory |

## Contributing

Contributions are welcome for queued job storage, ZIP downloads, automatic cleanup, tests, Docker support, and production deployment documentation.

---

Built by [Bukhtyar Haider](https://github.com/bukhtyarhaider).
