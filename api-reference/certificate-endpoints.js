// Certificate Management API Endpoints
// Add these to your existing API server (following your existing pattern)

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/certificates/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
  }
});

// Get all certificate requests (admin/dean view)
app.get('/certificates', (req, res) => {
  const sql = `
    SELECT cr.*, u.name as user_name 
    FROM certificate_requests cr
    LEFT JOIN users u ON cr.user_id = u.id
    ORDER BY cr.request_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error', details: err });
    }
    res.json(results);
  });
});

// Get user's certificate requests
app.get('/certificates/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ error: 'Missing required parameter: user_id' });
  }
  
  const sql = `
    SELECT * FROM certificate_requests 
    WHERE user_id = ?
    ORDER BY request_date DESC
  `;
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error', details: err });
    }
    res.json(results);
  });
});

// Submit new certificate request
app.post('/certificates/request', (req, res) => {
  const { user_id, certificate_type, purpose, additional_details } = req.body;
  
  if (!user_id || !certificate_type || !purpose) {
    return res.status(400).json({ error: 'Missing required fields: user_id, certificate_type, and purpose are required' });
  }
  
  const sql = `INSERT INTO certificate_requests (user_id, certificate_type, purpose, additional_details) VALUES (?, ?, ?, ?)`;
  const values = [user_id, certificate_type, purpose, additional_details || null];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database insert error', details: err });
    }
    res.status(201).json({ 
      message: 'Certificate request submitted successfully', 
      id: result.insertId,
      success: true
    });
  });
});

// Upload certificate file and approve request
app.post('/certificates/:id/upload', upload.single('certificate_file'), (req, res) => {
  const { id } = req.params;
  const { notes, approved_by } = req.body;
  const file = req.file;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const sql = `
    UPDATE certificate_requests 
    SET status = 'Approved',
        certificate_file_path = ?,
        certificate_file_name = ?,
        file_size = ?,
        approved_by = ?,
        approved_date = NOW()
    WHERE id = ?
  `;
  const values = [file.path, file.originalname, file.size, approved_by || null, id];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database update error', details: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Certificate uploaded and request approved',
      file: {
        filename: file.originalname,
        path: file.path,
        size: file.size
      }
    });
  });
});

// Reject certificate request
app.put('/certificates/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejection_reason, rejected_by } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }
  
  if (!rejection_reason) {
    return res.status(400).json({ error: 'Missing required field: rejection_reason' });
  }
  
  const sql = `
    UPDATE certificate_requests 
    SET status = 'Rejected',
        rejection_reason = ?,
        approved_by = ?,
        approved_date = NOW()
    WHERE id = ?
  `;
  const values = [rejection_reason, rejected_by || null, id];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database update error', details: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Certificate request rejected successfully' 
    });
  });
});

// Download certificate file
app.get('/certificates/:id/download', (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }
  
  const sql = `SELECT certificate_file_path, certificate_file_name FROM certificate_requests WHERE id = ? AND status = 'Approved'`;
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error', details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Certificate not found or not approved' });
    }
    
    const filePath = results[0].certificate_file_path;
    const fileName = results[0].certificate_file_name;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Certificate file not found on server' });
    }
    
    res.download(filePath, fileName);
  });
});

// Get certificate types
app.get('/certificate_types', (req, res) => {
  const sql = `SELECT * FROM certificate_types WHERE is_active = TRUE ORDER BY type_name`;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error', details: err });
    }
    res.json(results);
  });
});



// Note: Add these endpoints to your existing server file alongside your other endpoints
// Make sure you have multer installed: npm install multer
