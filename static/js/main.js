document.addEventListener('DOMContentLoaded', () => {
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const downloadSelectedBtn = document.getElementById('download-selected');
    const downloadAllBtn = document.getElementById('download-all');
    const checkboxes = document.querySelectorAll('.selection-checkbox');
    const selectedCount = document.getElementById('selected-count');

    // Update selection count
    const updateCount = () => {
        const checked = document.querySelectorAll('.selection-checkbox:checked').length;
        selectedCount.textContent = checked;
        downloadSelectedBtn.disabled = checked === 0;
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateCount);
    });

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = true);
            updateCount();
        });
    }

    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
            updateCount();
        });
    }

    const createZipAndDownload = async (filenames, zipName) => {
        const folder = document.body.dataset.folder;
        
        const btn = filenames.length === checkboxes.length ? downloadAllBtn : downloadSelectedBtn;
        const btnOriginalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        btn.disabled = true;

        try {
            const response = await fetch('/zip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folder: folder,
                    filenames: filenames
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = zipName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Failed to create ZIP. Please try again.');
        } finally {
            btn.innerHTML = btnOriginalText;
            btn.disabled = btn === downloadSelectedBtn && document.querySelectorAll('.selection-checkbox:checked').length === 0;
        }
    };

    if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', () => {
            const selectedFilenames = Array.from(document.querySelectorAll('.selection-checkbox:checked'))
                .map(cb => {
                    const card = cb.closest('.image-card');
                    return card.querySelector('img').dataset.filename;
                });
            
            if (selectedFilenames.length > 0) {
                createZipAndDownload(selectedFilenames, 'selected_images.zip');
            }
        });
    }

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', () => {
            const allFilenames = Array.from(document.querySelectorAll('.image-card img'))
                .map(img => img.dataset.filename);
            
            createZipAndDownload(allFilenames, 'all_images.zip');
        });
    }

    // Drag and drop logic for index page
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('pdf_file');

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                // Optional: trigger form submit or show filename
                const label = uploadZone.querySelector('p');
                label.textContent = `Selected: ${e.dataTransfer.files[0].name}`;
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                const label = uploadZone.querySelector('p');
                label.textContent = `Selected: ${fileInput.files[0].name}`;
            }
        });
    }
});
