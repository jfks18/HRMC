-- HRMS System Monitoring Database Schema
-- Run these SQL commands to create the monitoring infrastructure

-- 1. System Logs Table
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    message TEXT NOT NULL,
    module VARCHAR(50) NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45) NULL,
    details JSON NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_type (type),
    INDEX idx_module (module)
);

-- 2. System Status Table
CREATE TABLE system_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    component VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('operational', 'issues', 'down', 'maintenance') NOT NULL DEFAULT 'operational',
    last_check DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INT NULL,
    error_message TEXT NULL,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial system components
INSERT INTO system_status (component, status) VALUES
('leave_management', 'operational'),
('certificate_management', 'operational'),
('attendance_system', 'operational'),
('user_authentication', 'operational'),
('database', 'operational'),
('api_server', 'operational');

-- 3. Performance Metrics Table
CREATE TABLE performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
);

-- 4. User Activity Tracking
CREATE TABLE user_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    session_id VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
);

-- 5. System Maintenance Schedule
CREATE TABLE maintenance_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    component VARCHAR(50) NOT NULL,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    actual_start DATETIME NULL,
    actual_end DATETIME NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    performed_by INT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    INDEX idx_scheduled_start (scheduled_start),
    INDEX idx_component (component),
    INDEX idx_status (status)
);

-- 6. Add missing columns to existing tables if they don't exist
-- Users table additions for tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL,
ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity DATETIME NULL;

-- Leave requests table additions for better tracking
ALTER TABLE leave_request 
ADD COLUMN IF NOT EXISTS processed_by INT NULL,
ADD COLUMN IF NOT EXISTS processed_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Certificate requests table (create if doesn't exist)
CREATE TABLE IF NOT EXISTS certificate_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    additional_details TEXT NULL,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected', 'Processing') DEFAULT 'Pending',
    approved_by INT NULL,
    approved_date DATETIME NULL,
    rejection_reason TEXT NULL,
    certificate_file_path VARCHAR(500) NULL,
    certificate_file_name VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date)
);

-- 7. Create views for common monitoring queries
CREATE VIEW v_system_health AS
SELECT 
    component,
    status,
    response_time_ms,
    uptime_percentage,
    last_check,
    CASE 
        WHEN last_check < DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'stale'
        ELSE 'current'
    END as data_freshness
FROM system_status;

CREATE VIEW v_daily_activity AS
SELECT 
    DATE(created_at) as activity_date,
    module,
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as unique_users
FROM user_activity 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), module
ORDER BY activity_date DESC;

CREATE VIEW v_error_summary AS
SELECT 
    DATE(timestamp) as error_date,
    module,
    type,
    COUNT(*) as error_count,
    COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_count
FROM system_logs 
WHERE type IN ('error', 'critical')
    AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp), module, type
ORDER BY error_date DESC;
