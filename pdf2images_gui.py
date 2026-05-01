import os
import time
import tkinter as tk
from tkinter import filedialog, messagebox
from pdf2image import convert_from_path

def convert_pdf_to_images(input_folder, output_folder, log_callback=None):
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    total_start = time.time()
    pdfs_found = False
    for filename in os.listdir(input_folder):
        if filename.lower().endswith('.pdf'):
            pdfs_found = True
            pdf_path = os.path.join(input_folder, filename)
            pdf_name = os.path.splitext(filename)[0]
            pdf_output_dir = os.path.join(output_folder, pdf_name)
            os.makedirs(pdf_output_dir, exist_ok=True)

            msg = f'Converting {filename}...'
            if log_callback:
                log_callback(msg)
            else:
                print(msg)
            start_time = time.time()
            try:
                images = convert_from_path(pdf_path)
                for i, image in enumerate(images):
                    image_path = os.path.join(pdf_output_dir, f'page_{i+1}.png')
                    image.save(image_path, 'PNG')
                elapsed = time.time() - start_time
                msg = f'Saved images for {filename} in {pdf_output_dir} (Time taken: {elapsed:.2f} seconds)'
                if log_callback:
                    log_callback(msg)
                else:
                    print(msg)
            except Exception as e:
                msg = f'Error converting {filename}: {e}'
                if log_callback:
                    log_callback(msg)
                else:
                    print(msg)
    total_elapsed = time.time() - total_start
    if pdfs_found:
        msg = f'All PDFs processed. Total time: {total_elapsed:.2f} seconds'
    else:
        msg = 'No PDF files found in the input folder.'
    if log_callback:
        log_callback(msg)
    else:
        print(msg)

def run_gui():
    def select_input():
        folder = filedialog.askdirectory(title='Select Input Folder (PDFs)')
        if folder:
            input_var.set(folder)

    def select_output():
        folder = filedialog.askdirectory(title='Select Output Folder (Images)')
        if folder:
            output_var.set(folder)

    def log_message(msg):
        log_text.config(state='normal')
        log_text.insert(tk.END, msg + '\n')
        log_text.see(tk.END)
        log_text.config(state='disabled')
        root.update()

    def start_conversion():
        input_folder = input_var.get()
        output_folder = output_var.get()
        log_text.config(state='normal')
        log_text.delete(1.0, tk.END)
        log_text.config(state='disabled')
        if not input_folder or not output_folder:
            messagebox.showerror('Error', 'Please select both input and output folders.')
            return
        try:
            convert_pdf_to_images(input_folder, output_folder, log_callback=log_message)
            messagebox.showinfo('Done', 'PDF conversion completed!')
        except Exception as e:
            messagebox.showerror('Error', str(e))

    root = tk.Tk()
    root.title('PDF to Images Converter')
    root.geometry('500x400')
    root.resizable(False, False)

    input_var = tk.StringVar()
    output_var = tk.StringVar()

    tk.Label(root, text='Input Folder (PDFs):').pack(pady=(20, 0))
    input_frame = tk.Frame(root)
    input_frame.pack(pady=5)
    tk.Entry(input_frame, textvariable=input_var, width=40).pack(side=tk.LEFT, padx=5)
    tk.Button(input_frame, text='Browse', command=select_input).pack(side=tk.LEFT)

    tk.Label(root, text='Output Folder (Images):').pack(pady=(20, 0))
    output_frame = tk.Frame(root)
    output_frame.pack(pady=5)
    tk.Entry(output_frame, textvariable=output_var, width=40).pack(side=tk.LEFT, padx=5)
    tk.Button(output_frame, text='Browse', command=select_output).pack(side=tk.LEFT)

    tk.Button(root, text='Convert PDFs to Images', command=start_conversion, bg='#4CAF50', fg='white', font=('Arial', 12, 'bold')).pack(pady=20)

    log_text = tk.Text(root, height=10, width=60, state='disabled', bg='#f4f4f4')
    log_text.pack(pady=10)

    root.mainloop()

if __name__ == '__main__':
    run_gui()
