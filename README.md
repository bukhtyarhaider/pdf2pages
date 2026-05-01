# PDF to Images Converter (Web Interface)

A simple web application to convert PDF files into images (one image per page). Built with Python, Flask, and pdf2image.

---

## Features
- Upload a PDF and get each page as a PNG image
- User-friendly web interface
- Works on macOS and Windows

---

## Setup Instructions

### 1. Clone the Repository
```
git clone <your-repo-url>
cd pdf2image
```

### 2. Install Python (if not already installed)
- **macOS:**
  - Recommended: [Download Python from python.org](https://www.python.org/downloads/)
  - Or use Homebrew: `brew install python`
- **Windows:**
  - [Download Python from python.org](https://www.python.org/downloads/)

### 3. Create a Virtual Environment
```
python3 -m venv .venv
# On Windows:
# python -m venv .venv
```

### 4. Activate the Virtual Environment
- **macOS/Linux:**
  ```
  source .venv/bin/activate
  ```
- **Windows:**
  ```
  .venv\Scripts\activate
  ```

### 5. Install Dependencies
```
pip install -r requirements.txt
```
If you don't have a `requirements.txt`, install manually:
```
pip install flask pdf2image Pillow werkzeug
```

#### **macOS Only: Install Poppler**
`pdf2image` requires Poppler for PDF rendering.
- Install with Homebrew:
  ```
  brew install poppler
  ```

#### **Windows Only: Install Poppler**
- Download Poppler for Windows: [http://blog.alivate.com.au/poppler-windows/](http://blog.alivate.com.au/poppler-windows/)
- Extract the zip and add the `bin` folder to your system PATH.

---

## Running the App

1. Start the Flask server:
   ```
   python app.py
   # or
   .venv/bin/python app.py
   # or (Windows)
   .venv\Scripts\python.exe app.py
   ```
2. Open your browser and go to: [http://127.0.0.1:5000](http://127.0.0.1:5000)
3. Upload a PDF, click Convert, and download your images!

---

## Troubleshooting
- **Tkinter errors:** This app does NOT use Tkinter. If you see Tkinter errors, make sure you are running `app.py`, not any GUI script.
- **Poppler not found:** Ensure Poppler is installed and in your PATH (see above).
- **Permission errors:** Try running your terminal as administrator (Windows) or with correct permissions (macOS).

---

## License
MIT
