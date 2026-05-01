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

    // Home Page Elements
    const openArchiveBtn = document.getElementById('open-archive');
    const closeArchiveBtn = document.getElementById('close-archive');
    const archiveModal = document.getElementById('archive-modal');
    const archiveSearch = document.getElementById('archive-search');
    const archiveItems = document.querySelectorAll('.archive-item');

    // Lightbox Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.getElementById('close-lightbox');
    const previewTriggers = document.querySelectorAll('.preview-trigger');
    const searchInput = document.getElementById('search-input');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const shareButtons = document.querySelectorAll('.share-page');

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

    // Archive Modal Logic
    if (openArchiveBtn) {
        openArchiveBtn.addEventListener('click', () => {
            archiveModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (archiveSearch) archiveSearch.focus();
        });
    }

    if (closeArchiveBtn) {
        closeArchiveBtn.addEventListener('click', () => {
            archiveModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }

    if (archiveModal) {
        archiveModal.addEventListener('click', (e) => {
            if (e.target === archiveModal) {
                archiveModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Archive Search Logic
    if (archiveSearch) {
        archiveSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            archiveItems.forEach(item => {
                const name = item.dataset.name;
                if (name.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Lightbox Logic
    if (previewTriggers.length > 0) {
        previewTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                // Don't trigger if clicking the checkbox
                if (e.target.classList.contains('selection-checkbox')) return;
                
                const img = trigger.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // Prevent scroll
                }
            });
        });

        const closeLightboxFn = () => {
            lightbox.style.display = 'none';
            lightboxImg.src = '';
            document.body.style.overflow = 'auto';
        };

        if (closeLightbox) {
            closeLightbox.addEventListener('click', closeLightboxFn);
        }

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightboxFn();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightboxFn();
        });
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            galleryItems.forEach(item => {
                const label = item.querySelector('.page-label').textContent.toLowerCase();
                if (label.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Share Logic
    if (shareButtons.length > 0) {
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = window.location.origin + btn.dataset.url;
                navigator.clipboard.writeText(url).then(() => {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                    }, 2000);
                });
            });
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
                if (submitBtn) submitBtn.disabled = false;
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateFileLabel(fileInput.files[0].name);
                if (submitBtn) submitBtn.disabled = false;
            } else {
                if (submitBtn) submitBtn.disabled = true;
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
