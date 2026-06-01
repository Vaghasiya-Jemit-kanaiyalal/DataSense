const fs = require('fs');
const path = require('path');
const multer = require('multer');
const datasetService = require('../services/dataset.service');
const datasetCache = require('../services/dataset.cache');
const mlService = require('../services/ml.service');
const { buildStep } = require('../utils/stepBuilder');
const { attachPipelineMeta, formatStepHistory } = require('../utils/pipelineMeta');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function saveFileToDisk(userId, datasetId, file) {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const safeName = (file.originalname || 'data.csv').replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}_${datasetId}_${safeName}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, storagePath), file.buffer);
  return storagePath;
}

async function loadRawBuffer(userId, datasetId, meta) {
  let buffer = await datasetCache.get(userId, datasetId);
  if (buffer) return buffer;

  const storagePath = meta.storage_path;
  if (storagePath) {
    const candidates = [
      path.join(UPLOAD_DIR, storagePath),
      storagePath,
      path.isAbsolute(storagePath) ? storagePath : null,
    ].filter(Boolean);
    for (const fullPath of candidates) {
      if (fs.existsSync(fullPath)) {
        buffer = fs.readFileSync(fullPath);
        await datasetCache.set(userId, datasetId, buffer);
        return buffer;
      }
    }
  }
  return null;
}

const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = (req, res, next) => upload.single('file')(req, res, next);

let tablesReady = false;
async function init() {
  if (!tablesReady) {
    await datasetService.ensureTables();
    tablesReady = true;
  }
}

async function ensureMlLoaded(userId, datasetId, meta) {
  try {
    await mlService.preprocessDataset({ userId, datasetId, steps: [], previewRows: 1, offset: 0 });
    return;
  } catch (err) {
    if (err.status !== 404 && !String(err.message).includes('not in memory')) throw err;
  }
  const buffer = await loadRawBuffer(userId, datasetId, meta);
  if (!buffer) {
    const e = new Error('Dataset file not found; please upload again');
    e.status = 404;
    throw e;
  }
  await mlService.uploadDataset({
    userId,
    datasetId,
    file: { buffer, originalname: meta.original_filename },
    previewRows: 1,
  });
}

async function buildResumeMeta(userId, active) {
  const pipeline = await datasetService.getPipelineByDataset(active.id);
  const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
  return {
    dataset_id: active.id,
    original_filename: active.original_filename,
    rows: active.total_rows ?? 0,
    columns: active.total_columns ?? 0,
    total_steps: steps.length,
    pipeline_steps: formatStepHistory(steps),
  };
}

async function runPipeline(userId, datasetId, steps, previewRows = 20, offset = 0) {
  const meta = await datasetService.getDataset(userId, datasetId);
  if (!meta) {
    const e = new Error('Dataset not found');
    e.status = 404;
    throw e;
  }
  await ensureMlLoaded(userId, datasetId, meta);
  const ml = await mlService.preprocessDataset({
    userId,
    datasetId,
    steps,
    previewRows,
    offset,
  });
  const meta = await datasetService.getDataset(userId, datasetId);
  return attachPipelineMeta(datasetService, datasetId, ml, meta);
}

const uploadFile = [uploadMiddleware, async (req, res) => {
  try {
    await init();
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const { datasetId, pipelineId } = await datasetService.createDataset({
      userId: req.user.id,
      originalFilename: file.originalname,
      mime: file.mimetype,
      size: file.size,
    });

    await datasetCache.set(req.user.id, datasetId, file.buffer);
    const storagePath = saveFileToDisk(req.user.id, datasetId, file);
    await datasetService.updateStoragePath(datasetId, storagePath);

    try {
      const ml = await mlService.uploadDataset({
        userId: req.user.id,
        datasetId,
        file,
        previewRows: 20,
      });

      const columnNames = ml.data?.[0] ? Object.keys(ml.data[0]) : [];
      await datasetService.updateDatasetMeta(datasetId, {
        totalRows: ml.rows,
        totalColumns: ml.columns,
        columnNames,
      });

      const payload = await attachPipelineMeta(datasetService, datasetId, ml);
      return res.status(201).json({ ...payload, pipeline_id: pipelineId });
    } catch (mlErr) {
      await datasetCache.del(req.user.id, datasetId);
      return res.status(mlErr.status || 502).json({
        message: 'ML service error',
        error: mlErr.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
}];

const listUserFiles = async (req, res) => {
  try {
    await init();
    const datasets = await datasetService.listDatasets(req.user.id);
    return res.status(200).json({ datasets });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list files', error: error.message });
  }
};

const activateDataset = async (req, res) => {
  try {
    await init();
    const datasetId = Number(req.params.id);
    const meta = await datasetService.getDataset(req.user.id, datasetId);
    if (!meta) return res.status(404).json({ message: 'Dataset not found' });
    await datasetService.activateDataset(req.user.id, datasetId);
    const ml = await runPipeline(req.user.id, datasetId, [], 20, 0);
    return res.status(200).json(ml);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: 'Activate failed',
      error: error.message,
    });
  }
};

const previewFile = async (req, res) => {
  try {
    await init();
    const id = Number(req.params.id);
    const pageSize = Number(req.query.rows) || 20;
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = Number(req.query.offset);
    const resolvedOffset = Number.isFinite(offset) ? offset : (page - 1) * pageSize;

    const pipeline = await datasetService.getPipelineByDataset(id);
    const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
    const ml = await runPipeline(req.user.id, id, steps, pageSize, resolvedOffset);
    return res.status(200).json(ml);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: 'Preview failed',
      error: error.message,
    });
  }
};

const getActive = async (req, res) => {
  try {
    await init();
    const active = await datasetService.getActiveDataset(req.user.id);
    if (!active) return res.status(404).json({ message: 'No active dataset' });

    const resumeMeta = await buildResumeMeta(req.user.id, active);

    try {
      const pipeline = await datasetService.getPipelineByDataset(active.id);
      const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
      const ml = await runPipeline(req.user.id, active.id, steps, 20, 0);
      return res.status(200).json({ ...ml, ...resumeMeta, ml_ready: true });
    } catch (mlErr) {
      return res.status(200).json({
        ...resumeMeta,
        data: [],
        statistics: {},
        numerical_columns: [],
        categorical_columns: [],
        ml_ready: false,
        message: mlErr.message,
      });
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      message: 'Failed to load active dataset',
      error: error.message,
    });
  }
};

const cleanDataset = async (req, res) => {
  try {
    await init();
    const datasetId = Number(req.body.dataset_id);
    if (!datasetId) return res.status(400).json({ message: 'dataset_id required' });

    const meta = await datasetService.getDataset(req.user.id, datasetId);
    if (!meta) return res.status(404).json({ message: 'Dataset not found' });
    if (datasetService.isFinalized(meta)) {
      return res.status(403).json({ message: 'Dataset is finalized; cleaning is locked.' });
    }

    const pipeline = await datasetService.getPipelineByDataset(datasetId);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });

    const existing = await datasetService.getSteps(pipeline.id);
    const nextIndex = existing.length;
    const newStep = buildStep(req.body, nextIndex);
    const allSteps = [...existing, newStep];

    const pageSize = req.body.preview_rows || 20;
    const offset = req.body.offset || 0;
    const ml = await runPipeline(req.user.id, datasetId, allSteps, pageSize, offset);
    await datasetService.saveStep(pipeline.id, newStep);

    return res.status(200).json({
      ...ml,
      total_steps: allSteps.length,
      pipeline_steps: formatStepHistory(allSteps),
      step_index: newStep.step_index,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      message: 'Clean failed',
      error: error.message,
    });
  }
};

const undoStep = async (req, res) => {
  try {
    await init();
    const datasetId = Number(req.params.datasetId);
    const meta = await datasetService.getDataset(req.user.id, datasetId);
    if (!meta) return res.status(404).json({ message: 'Dataset not found' });
    if (datasetService.isFinalized(meta)) {
      return res.status(403).json({ message: 'Dataset is finalized; undo is locked.' });
    }

    const pipeline = await datasetService.getPipelineByDataset(datasetId);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });

    const removed = await datasetService.deleteLastStep(pipeline.id);
    if (removed == null) return res.status(400).json({ message: 'No steps to undo' });

    const steps = await datasetService.getSteps(pipeline.id);
    const pageSize = Number(req.query.rows) || 20;
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = (page - 1) * pageSize;
    const ml = await runPipeline(req.user.id, datasetId, steps, pageSize, offset);
    return res.status(200).json({ ...ml, undone_step_index: removed });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: 'Undo failed',
      error: error.message,
    });
  }
};

const finalizeDataset = async (req, res) => {
  try {
    await init();
    const datasetId = Number(req.params.datasetId);
    const meta = await datasetService.getDataset(req.user.id, datasetId);
    if (!meta) return res.status(404).json({ message: 'Dataset not found' });

    if (datasetService.isFinalized(meta)) {
      const pipeline = await datasetService.getPipelineByDataset(datasetId);
      const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
      const ml = await runPipeline(req.user.id, datasetId, steps, 20, 0);
      return res.status(200).json({ ...ml, already_finalized: true });
    }

    await datasetService.finalizeDatasetRecord(datasetId);
    const pipeline = await datasetService.getPipelineByDataset(datasetId);
    const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
    const ml = await runPipeline(req.user.id, datasetId, steps, 20, 0);
    const updatedMeta = await datasetService.getDataset(req.user.id, datasetId);
    return res.status(200).json({
      ...ml,
      status: updatedMeta?.status || 'finalized',
      finalized: true,
      pipeline_locked: true,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: 'Finalize failed',
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  listUserFiles,
  activateDataset,
  previewFile,
  getActive,
  cleanDataset,
  undoStep,
  finalizeDataset,
};
