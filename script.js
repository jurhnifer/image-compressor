const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('previewSection');
const loading = document.getElementById('loading');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const maxWidthInput = document.getElementById('maxWidth');
const maxHeightInput = document.getElementById('maxHeight');
const compressBtn = document.getElementById('compressBtn');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const compressionRatio = document.getElementById('compressionRatio');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

let originalFile = null;
let compressedFile = null;

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Update quality display
qualitySlider.addEventListener('input', (e) => {
    const value = Math.round(e.target.value * 100);
    qualityValue.textContent = value + '%';
});

// Upload area click
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file selection
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    originalFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = `Size: ${formatFileSize(file.size)}`;
        controls.style.display = 'grid';
        previewSection.style.display = 'none';
    };

    reader.readAsDataURL(file);
}

// Compress image
compressBtn.addEventListener('click', async () => {
    if (!originalFile) return;

    loading.style.display = 'block';
    controls.style.display = 'none';
    previewSection.style.display = 'none';

    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: Math.max(parseInt(maxWidthInput.value), parseInt(maxHeightInput.value)),
            useWebWorker: true,
            quality: parseFloat(qualitySlider.value)
        };

        const compressedFileBlob = await imageCompression(originalFile, options);
        compressedFile = compressedFileBlob;

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedPreview.src = e.target.result;
            compressedSize.textContent = `Size: ${formatFileSize(compressedFile.size)}`;
            
            const ratio = ((1 - compressedFile.size / originalFile.size) * 100).toFixed(1);
            compressionRatio.textContent = `Reduced by: ${ratio}%`;
            compressionRatio.style.color = ratio > 0 ? '#11998e' : '#dc3545';

            loading.style.display = 'none';
            previewSection.style.display = 'block';
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('Compression error:', error);
        alert('An error occurred while compressing the image. Please try again.');
        loading.style.display = 'none';
        controls.style.display = 'grid';
    }
});

// Download compressed image
downloadBtn.addEventListener('click', () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_' + originalFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Reset
resetBtn.addEventListener('click', () => {
    originalFile = null;
    compressedFile = null;
    fileInput.value = '';
    originalPreview.src = '';
    compressedPreview.src = '';
    controls.style.display = 'none';
    previewSection.style.display = 'none';
    uploadArea.style.display = 'block';
});
