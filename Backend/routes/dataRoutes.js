const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  uploadFile,
  listUserFiles,
  activateDataset,
  previewFile,
  getActive,
  cleanDataset,
  undoStep,
  reopenDataset,
  deleteDatasetHandler,
  finalizeDataset,
  analyzeDatasetHandler,
  predictDatasetHandler,
} = require('../controllers/dataController');

router.post('/upload', verifyToken, ...uploadFile);
router.get('/mine', verifyToken, listUserFiles);
router.post('/:datasetId/reopen', verifyToken, ...reopenDataset);
router.delete('/:datasetId', verifyToken, deleteDatasetHandler);
router.post('/:id/activate', verifyToken, activateDataset);
router.get('/active', verifyToken, getActive);
router.get('/preview/:id', verifyToken, previewFile);
router.post('/clean', verifyToken, cleanDataset);
router.get('/:datasetId/analyze', verifyToken, analyzeDatasetHandler);
router.post('/:datasetId/predict', verifyToken, predictDatasetHandler);
router.post('/:datasetId/undo', verifyToken, undoStep);
router.post('/:datasetId/finalize', verifyToken, finalizeDataset);

module.exports = router;
