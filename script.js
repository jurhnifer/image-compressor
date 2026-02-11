import imageCompression from 'browser-image-compression';

const $ = (sel) => document.querySelector(sel);

let originalFile = null;
let compressedFile = null;

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function setStatus(text, kind = 'default') {
  const el = $('#statusLine');
  el.textContent = text;
  el.classList.remove('error', 'ok');
  if (kind === 'error') el.classList.add('error');
  if (kind === 'ok') el.classList.add('ok');
}

function setProgress(pct, visible) {
  const wrap = $('#progressWrap');
  const bar = $('#progressBar');
  if (visible) {
    wrap.hidden = false;
    bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  } else {
    wrap.hidden = true;
    bar.style.width = '0%';
  }
}

function updateUiEnabled() {
  const hasFile = Boolean(originalFile);
  $('#compressBtn').disabled = !hasFile;
  $('#resetBtn').disabled = !hasFile;
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('Please select an image file.', 'error');
    return;
  }

  originalFile = file;
  $('#fileMeta').hidden = false;
  $('#fileName').textContent = file.name;
  $('#originalSize').textContent = formatFileSize(file.size);

  const reader = new FileReader();
  reader.onload = (e) => {
    $('#originalPreview').src = e.target.result;
    $('#originalSizePreview').textContent = formatFileSize(file.size);
  };
  reader.readAsDataURL(file);

  $('#previewSection').hidden = true;
  $('#loading').hidden = true;
  setProgress(0, false);
  setStatus('Ready. Adjust settings and compress.', 'ok');
  updateUiEnabled();
}

function resetAll() {
  originalFile = null;
  compressedFile = null;
  $('#fileInput').value = '';
  $('#fileMeta').hidden = true;
  $('#fileName').textContent = '—';
  $('#originalSize').textContent = '—';
  $('#originalPreview').src = '';
  $('#compressedPreview').src = '';
  $('#originalSizePreview').textContent = '—';
  $('#compressedSizePreview').textContent = '—';
  $('#compressionRatio').textContent = '—';
  $('#previewSection').hidden = true;
  $('#loading').hidden = true;
  setProgress(0, false);
  setStatus('Choose an image to begin.');
  updateUiEnabled();
}

// Quality slider
$('#quality').addEventListener('input', (e) => {
  const value = Math.round(Number(e.target.value) * 100);
  $('#qualityValue').textContent = value + '%';
});

// Dropzone (label's for="fileInput" already opens the picker on click)
$('#dropZone').addEventListener('dragover', (e) => {
  e.preventDefault();
  $('#dropZone').classList.add('dragover');
});
$('#dropZone').addEventListener('dragleave', () => $('#dropZone').classList.remove('dragover'));
$('#dropZone').addEventListener('drop', (e) => {
  e.preventDefault();
  $('#dropZone').classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  handleFile(file);
});
$('#dropZone').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    $('#fileInput').click();
  }
});

$('#fileInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  handleFile(file);
});

// Compress
$('#compressBtn').addEventListener('click', async () => {
  if (!originalFile) return;

  $('#previewSection').hidden = true;
  $('#loading').hidden = false;
  setProgress(20, true);
  setStatus('Compressing…');

  try {
    const maxDim = Math.max(
      Number($('#maxWidth').value) || 1920,
      Number($('#maxHeight').value) || 1920
    );
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: maxDim,
      useWebWorker: true,
      quality: Number($('#quality').value) || 0.8,
    };

    setProgress(50, true);
    const compressedBlob = await imageCompression(originalFile, options);
    compressedFile = compressedBlob;

    setProgress(80, true);
    setStatus('Preparing preview…');

    const reader = new FileReader();
    reader.onload = (e) => {
      $('#compressedPreview').src = e.target.result;
      $('#compressedSizePreview').textContent = formatFileSize(compressedFile.size);
      const ratio = ((1 - compressedFile.size / originalFile.size) * 100).toFixed(1);
      $('#compressionRatio').textContent = 'Reduced by ' + ratio + '%';

      setProgress(0, false);
      $('#loading').hidden = true;
      $('#previewSection').hidden = false;
      setStatus('Done. Download or compress another.', 'ok');
    };
    reader.readAsDataURL(compressedFile);
  } catch (err) {
    console.error('Compression error:', err);
    setProgress(0, false);
    $('#loading').hidden = true;
    setStatus(err?.message || 'Compression failed. Try again.', 'error');
  }
});

// Download
$('#downloadBtn').addEventListener('click', () => {
  if (!compressedFile) return;
  const url = URL.createObjectURL(compressedFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compressed_' + (originalFile?.name || 'image');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Reset
$('#resetBtn').addEventListener('click', resetAll);

// Init
document.addEventListener('DOMContentLoaded', () => {
  resetAll();
});
