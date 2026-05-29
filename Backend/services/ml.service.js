const { Blob } = require('buffer');

const ML_BASE = process.env.ML_SERVICE_URL || 'http://localhost:8000';

function formatMlError(data) {
  if (!data) return null;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
  }
  return data.message || null;
}

async function uploadDataset({ userId, datasetId, file, previewRows = 20 }) {
  const form = new FormData();
  form.append('file', new Blob([file.buffer]), file.originalname);
  form.append('user_id', String(userId));
  form.append('dataset_id', String(datasetId));
  form.append('preview_rows', String(previewRows));

  const res = await fetch(`${ML_BASE}/data/upload`, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(formatMlError(data) || 'ML upload failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

async function preprocessDataset({
  userId,
  datasetId,
  steps = [],
  previewRows = 20,
  offset = 0,
}) {
  const res = await fetch(`${ML_BASE}/data/preprocess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      dataset_id: datasetId,
      preview_rows: previewRows,
      offset,
      steps,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(formatMlError(data) || 'ML preprocess failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

module.exports = { uploadDataset, preprocessDataset };
