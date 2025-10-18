# Certificate Module Implementation Guide
## For Separate API Backend

### 🎯 Overview
This guide shows how to implement the certificate module with your existing separate API backend (`https://buck-leading-pipefish.ngrok-free.app`).

### 📋 Step 1: Database Setup
Add these tables to your existing database:

```sql
-- Certificate requests table
CREATE TABLE certificate_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    additional_details TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected', 'Processing') DEFAULT 'Pending',
    approved_by INT NULL,
    approved_date TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    certificate_file_path VARCHAR(500) NULL,
    certificate_file_name VARCHAR(255) NULL,
    file_size INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Certificate types lookup table (optional)
CREATE TABLE certificate_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default certificate types
INSERT INTO certificate_types (type_name, description) VALUES
('Certificate of Employment', 'Official employment verification document'),
('Service Record', 'Record of service period and performance'),
('Performance Certificate', 'Certificate acknowledging good performance'),
('Salary Certificate', 'Official salary verification document'),
('Training Certificate', 'Certificate for completed training programs'),
('Good Standing Certificate', 'Certificate of good standing in organization');
```

### 🚀 Step 2: API Endpoints Implementation
Add these endpoints to your existing API server:

#### Required Dependencies:
```bash
npm install multer
```

#### API Routes:
```javascript
// In your existing API server app.js file

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assuming you already have your app instance
// const app = express();

// Configure multer for certificate uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

// 1. Get all certificate requests (admin/dean view)
app.get('/certificates', (req, res) => {
  const query = `
    SELECT cr.*, u.name as user_name 
    FROM certificate_requests cr
    LEFT JOIN users u ON cr.user_id = u.id
    ORDER BY cr.request_date DESC
  `;
  
  // Use your existing database connection method
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 2. Get user's certificate requests
app.get('/certificates/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  const query = `
    SELECT * FROM certificate_requests 
    WHERE user_id = ?
    ORDER BY request_date DESC
  `;
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 3. Submit new certificate request
app.post('/certificates/request', (req, res) => {
  const { user_id, certificate_type, purpose, additional_details } = req.body;
  
  const query = `
    INSERT INTO certificate_requests (user_id, certificate_type, purpose, additional_details)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [user_id, certificate_type, purpose, additional_details], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId, message: 'Certificate request submitted successfully' });
  });
});

// 4. Upload certificate and approve request
app.post('/certificates/:id/upload', upload.single('certificate_file'), (req, res) => {
  const { id } = req.params;
  const { notes, approved_by } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const query = `
    UPDATE certificate_requests 
    SET status = 'Approved',
        certificate_file_path = ?,
        certificate_file_name = ?,
        file_size = ?,
        approved_by = ?,
        approved_date = NOW()
    WHERE id = ?
  `;
  
  db.query(query, [file.path, file.originalname, file.size, approved_by, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

// 5. Reject certificate request
app.put('/certificates/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejection_reason, rejected_by } = req.body;
  
  const query = `
    UPDATE certificate_requests 
    SET status = 'Rejected',
        rejection_reason = ?,
        approved_by = ?,
        approved_date = NOW()
    WHERE id = ?
  `;
  
  db.query(query, [rejection_reason, rejected_by, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Certificate request rejected' });
  });
});

// 6. Download certificate file
app.get('/certificates/:id/download', (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT certificate_file_path, certificate_file_name FROM certificate_requests WHERE id = ? AND status = 'Approved'`;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

// 7. Get certificate types (optional)
app.get('/certificate_types', (req, res) => {
  const query = `SELECT * FROM certificate_types WHERE is_active = TRUE ORDER BY type_name`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
```

### 📁 Step 3: File Structure
Create this folder structure in your API server:
```
your-api-server/
├── uploads/
│   └── certificates/          # Certificate files will be stored here
├── routes/
│   └── certificates.js       # Certificate routes
└── app.js                     # Main server file
```

### 🔧 Step 4: Frontend Integration
The frontend components are already created and ready to work with your API:

#### Components Created:
- ✅ `FileUpload.tsx` - File upload with drag-drop
- ✅ `FileDownload.tsx` - Secure file download
- ✅ `CertificateStatusBadge.tsx` - Status display
- ✅ `CertificateUploadModal.tsx` - Admin upload interface
- ✅ `CertificateRequestForm.tsx` - Employee request form
- ✅ `CertificatesTable.tsx` - Admin management table

#### API Integration Pattern:
All components follow your existing pattern:
```javascript
fetch('https://buck-leading-pipefish.ngrok-free.app/endpoint', {
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  }
})
```

### 🚦 Step 5: Testing Checklist
1. ✅ Create database tables
2. ✅ Add API endpoints to your server
3. ✅ Test file upload functionality
4. ✅ Test certificate request submission
5. ✅ Test approval/rejection workflow
6. ✅ Test file download functionality
7. ✅ Test role-based access (faculty vs admin)

### 🔒 Security Considerations
- File upload validation (type, size)
- Authenticated downloads only for approved certificates
- Role-based access control
- Secure file storage with proper permissions
- Input validation and sanitization

### 📊 Database Indexes (for performance)
```sql
-- Add these indexes for better performance
CREATE INDEX idx_certificate_user_id ON certificate_requests(user_id);
CREATE INDEX idx_certificate_status ON certificate_requests(status);
CREATE INDEX idx_certificate_date ON certificate_requests(request_date);
```

This implementation works seamlessly with your existing separate API structure and follows the same patterns you're already using for leave management and attendance systems.
