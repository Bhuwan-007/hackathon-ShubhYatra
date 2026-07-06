const express = require('express');
const router = express.Router();
const multer = require('multer');
const { submitReport, getHeatmap, getRawReports, verifyReport } = require('../controllers/reportController');
const { optionalAuth } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/reports
router.post('/', optionalAuth, upload.single('image'), submitReport);

// GET /api/reports/heatmap
router.get('/heatmap', getHeatmap);

// GET /api/reports (Admin: list all raw reports)
router.get('/', getRawReports);

// PATCH /api/reports/:id/verify (Admin: verify a report)
router.patch('/:id/verify', verifyReport);

module.exports = router;
