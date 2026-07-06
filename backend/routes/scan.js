const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanImage } = require('../controllers/scanController');

// Store files in memory so we get a buffer to send directly to Gemini via base64
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/scan-image
// 'image' is the field name we expect in the multipart form-data
router.post('/', upload.single('image'), scanImage);

module.exports = router;
