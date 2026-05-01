import os
import sys
import time
from pdf2image import convert_from_path

def convert_pdf_to_images(input_folder, output_folder):

    # Ensure input and output folders exist
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    total_start = time.time()
    for filename in os.listdir(input_folder):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(input_folder, filename)
            pdf_name = os.path.splitext(filename)[0]
            pdf_output_dir = os.path.join(output_folder, pdf_name)
            os.makedirs(pdf_output_dir, exist_ok=True)

            print(f'Converting {filename}...')
            start_time = time.time()
            try:
                images = convert_from_path(pdf_path)
                for i, image in enumerate(images):
                    image_path = os.path.join(pdf_output_dir, f'page_{i+1}.png')
                    image.save(image_path, 'PNG')
                elapsed = time.time() - start_time
                print(f'Saved images for {filename} in {pdf_output_dir} (Time taken: {elapsed:.2f} seconds)')
            except Exception as e:
                print(f'Error converting {filename}: {e}')
    total_elapsed = time.time() - total_start
    print(f'All PDFs processed. Total time: {total_elapsed:.2f} seconds')

def main():
    if len(sys.argv) != 3:
        print('Usage: python pdf2images.py <input_folder> <output_folder>')
        sys.exit(1)
    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    convert_pdf_to_images(input_folder, output_folder)

if __name__ == '__main__':
    main()
