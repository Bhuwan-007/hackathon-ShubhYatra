const express = require('express');
const router = express.Router();
const multer = require('multer');
const { submitReport, getHeatmap } = require('../controllers/reportController');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/reports
router.post('/', upload.single('image'), submitReport);

// GET /api/reports/heatmap
router.get('/heatmap', getHeatmap);

module.exports = router;
