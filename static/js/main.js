document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const uploadForm = document.getElementById('upload-form');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('pdf_file');
    const submitBtn = document.getElementById('submit-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const pageCountText = document.getElementById('page-count');
    const statusText = document.getElementById('status-text');

    // Output Page Elements
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const downloadSelectedBtn = document.getElementById('download-selected');
    const downloadAllBtn = document.getElementById('download-all');
    const checkboxes = document.querySelectorAll('.selection-checkbox');
    const selectedCount = document.getElementById('selected-count');

    // Selection Logic
    const updateCount = () => {
        if (!selectedCount) return;
        const checked = document.querySelectorAll('.selection-checkbox:checked').length;
        selectedCount.textContent = checked;
        if (downloadSelectedBtn) {
            downloadSelectedBtn.disabled = checked === 0;
        }
    };

    if (checkboxes) {
        checkboxes.forEach(cb => cb.addEventListener('change', updateCount));
    }

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

    // ZIP Logic (Server-side)
    const createZipAndDownload = async (filenames, zipName, btn) => {
        const folder = document.body.dataset.folder;
        const btnOriginalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span> Processing...';
        btn.disabled = true;

        try {
            const response = await fetch('/zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder, filenames })
            });

            if (!response.ok) throw new Error('Zip generation failed');

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
            console.error('Error:', error);
            alert('Failed to generate ZIP. Please try again.');
        } finally {
            btn.innerHTML = btnOriginalText;
            btn.disabled = btn === downloadSelectedBtn && document.querySelectorAll('.selection-checkbox:checked').length === 0;
        }
    };

    if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', () => {
            const filenames = Array.from(document.querySelectorAll('.selection-checkbox:checked'))
                .map(cb => cb.closest('.group').querySelector('img').dataset.filename);
            createZipAndDownload(filenames, 'selected_pages.zip', downloadSelectedBtn);
        });
    }

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', () => {
            const filenames = Array.from(document.querySelectorAll('img[data-filename]'))
                .map(img => img.dataset.filename);
            createZipAndDownload(filenames, 'all_pages.zip', downloadAllBtn);
        });
    }

    // Upload & Realtime Progress
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);

            submitBtn.disabled = true;
            uploadZone.classList.add('hidden');
            progressContainer.classList.remove('hidden');

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.job_id) {
                    const eventSource = new EventSource(`/progress/${data.job_id}`);
                    eventSource.onmessage = (event) => {
                        const progressData = JSON.parse(event.data);
                        const { progress, total, status, folder } = progressData;

                        if (total > 0) {
                            const percent = Math.round((progress / total) * 100);
                            progressBar.style.width = `${percent}%`;
                            progressPercent.textContent = `${percent}%`;
                            pageCountText.textContent = `${progress} of ${total} pages`;
                        }

                        if (status === 'completed') {
                            eventSource.close();
                            statusText.textContent = 'Success!';
                            setTimeout(() => {
                                window.location.href = `/output/${folder}`;
                            }, 1000);
                        } else if (status === 'failed') {
                            eventSource.close();
                            alert('Conversion failed. Please try again.');
                            location.reload();
                        }
                    };
                } else {
                    alert(data.error || 'Upload failed');
                    location.reload();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong. Please try again.');
                location.reload();
            }
        });

        // Drag and Drop
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-accent/50', 'bg-accent/5');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-accent/50', 'bg-accent/5');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-accent/50', 'bg-accent/5');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileLabel(e.dataTransfer.files[0].name);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateFileLabel(fileInput.files[0].name);
            }
        });

        const updateFileLabel = (name) => {
            const primaryLabel = uploadZone.querySelector('p.text-white');
            const secondaryLabel = uploadZone.querySelector('p.text-neutral-500');
            if (primaryLabel) primaryLabel.textContent = name;
            if (secondaryLabel) secondaryLabel.textContent = 'File selected';
        };

        // Keyboard accessibility
        uploadZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });
    }
});
