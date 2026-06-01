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
  finalizeDataset,
} = require('../controllers/dataController');

router.post('/upload', verifyToken, ...uploadFile);
router.get('/mine', verifyToken, listUserFiles);
router.post('/:id/activate', verifyToken, activateDataset);
router.get('/active', verifyToken, getActive);
router.get('/preview/:id', verifyToken, previewFile);
router.post('/clean', verifyToken, cleanDataset);
router.post('/:datasetId/undo', verifyToken, undoStep);
router.post('/:datasetId/finalize', verifyToken, finalizeDataset);

module.exports = router;
