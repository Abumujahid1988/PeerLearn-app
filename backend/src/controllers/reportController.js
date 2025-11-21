const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId) return res.status(400).json({ error: 'Missing targetType or targetId' });
    const report = await Report.create({ reporter: req.user._id, targetType, targetId, reason });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter','name email');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const report = await Report.findById(id);
    if(!report) return res.status(404).json({ error: 'Not found' });
    if(status) report.status = status;
    if(notes) report.notes = notes;
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if(!report) return res.status(404).json({ error: 'Not found' });
    await report.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
