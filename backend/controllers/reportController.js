const UserReport = require('../models/UserReport');

const submitReport = async (req, res) => {
  try {
    const { location, description, category, severity } = req.body;
    const file = req.file;

    if (!location || !description || !category || !severity) {
      return res.status(400).json({ error: 'Missing required fields: location, description, category, severity' });
    }

    const severityNum = parseInt(severity, 10);
    if (isNaN(severityNum) || severityNum < 1 || severityNum > 5) {
      return res.status(400).json({ error: 'Severity must be a number between 1 and 5' });
    }

    const validCategories = ['scam', 'theft', 'harassment', 'infrastructure', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${validCategories.join(', ')}` });
    }

    // Process image if present (store as base64 string for the demo, skipping S3 to keep it simple)
    let imageUrl = null;
    if (file) {
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const newReport = new UserReport({
      location,
      description,
      category,
      severity: severityNum,
      imageUrl,
      status: 'pending'
    });

    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully', report: newReport });
  } catch (error) {
    console.error('❌ Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const heatmapData = await UserReport.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          avgSeverity: { $avg: "$severity" }
        }
      },
      {
        $project: {
          location: "$_id",
          count: 1,
          avgSeverity: { $round: ["$avgSeverity", 1] },
          _id: 0
        }
      },
      {
        $sort: { count: -1 } // Sort locations by most reports first
      }
    ]);

    res.json(heatmapData);
  } catch (error) {
    console.error('❌ Error generating heatmap:', error);
    res.status(500).json({ error: 'Failed to generate heatmap data' });
  }
};

const getRawReports = async (req, res) => {
  try {
    const reports = await UserReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await UserReport.findByIdAndUpdate(id, { status: 'verified' }, { new: true });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    console.error('❌ Error verifying report:', error);
    res.status(500).json({ error: 'Failed to verify report' });
  }
};

module.exports = {
  submitReport,
  getHeatmap,
  getRawReports,
  verifyReport
};
