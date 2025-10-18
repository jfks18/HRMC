# HRMS System Maintenance Guide

## Overview
This document provides comprehensive maintenance procedures for all HRMS modules including Staff, HR, Dean, Evaluation, and Faculty management systems.

## Database Maintenance

### Daily Tasks
1. **Monitor System Health**
   - Check system monitor dashboard at `/it/system-monitor`
   - Review error logs and resolve critical issues
   - Monitor database connection counts
   - Check API response times

2. **User Activity Review**
   - Review user login patterns
   - Check for suspicious activities
   - Verify authentication logs

### Weekly Tasks
1. **Database Cleanup**
   ```sql
   -- Clear old activity logs (older than 30 days)
   DELETE FROM system_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
   
   -- Clear old performance metrics (older than 7 days)
   DELETE FROM performance_metrics WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
   
   -- Update user activity status
   UPDATE users SET is_online = FALSE WHERE last_activity < DATE_SUB(NOW(), INTERVAL 1 HOUR);
   ```

2. **Performance Optimization**
   ```sql
   -- Analyze and optimize tables
   ANALYZE TABLE users, leave_request, certificate_requests, system_logs;
   
   -- Check for missing indexes
   EXPLAIN SELECT * FROM user_activity WHERE user_id = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY);
   ```

### Monthly Tasks
1. **Database Backup**
   ```bash
   # Create full database backup
   mysqldump -u username -p database_name > hrms_backup_$(date +%Y%m%d).sql
   
   # Compress backup
   gzip hrms_backup_$(date +%Y%m%d).sql
   ```

2. **Archive Old Data**
   ```sql
   -- Archive leave requests older than 1 year
   CREATE TABLE leave_request_archive AS 
   SELECT * FROM leave_request WHERE request_date < DATE_SUB(NOW(), INTERVAL 1 YEAR);
   
   DELETE FROM leave_request WHERE request_date < DATE_SUB(NOW(), INTERVAL 1 YEAR);
   ```

## Module-Specific Maintenance

### Staff Module (/staff/)
**Purpose**: Staff attendance, leave management, and certificate requests

**Daily Checks**:
- Verify attendance submission functionality
- Check leave request processing
- Monitor certificate request queue

**Weekly Maintenance**:
```sql
-- Check staff activity patterns
SELECT 
    u.name,
    COUNT(ua.id) as activities,
    MAX(ua.created_at) as last_activity
FROM users u 
LEFT JOIN user_activity ua ON u.id = ua.user_id 
WHERE u.role = 'staff' 
    AND ua.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY u.id, u.name
ORDER BY activities DESC;

-- Review pending requests
SELECT 
    status,
    COUNT(*) as count 
FROM certificate_requests cr
JOIN users u ON cr.user_id = u.id 
WHERE u.role = 'staff'
GROUP BY status;
```

**Files to Monitor**:
- `/staff/attendance/attendancetable.tsx` - Attendance submission issues
- `/staff/leave-management/leavetable.tsx` - Leave request functionality
- `/staff/certificate-management/certificatestable.tsx` - Certificate downloads

### HR/Admin Module (/admin/)
**Purpose**: System administration, user management, approvals

**Daily Checks**:
- Review pending approvals (leaves, certificates)
- Check user registration requests
- Monitor system alerts

**Weekly Maintenance**:
```sql
-- Admin activity summary
SELECT 
    DATE(ua.created_at) as activity_date,
    ua.action,
    COUNT(*) as count
FROM user_activity ua
JOIN users u ON ua.user_id = u.id
WHERE u.role = 'admin' 
    AND ua.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(ua.created_at), ua.action
ORDER BY activity_date DESC;

-- Pending items requiring admin attention
SELECT 
    'leave_requests' as type, 
    COUNT(*) as pending_count 
FROM leave_request 
WHERE is_approve IS NULL
UNION ALL
SELECT 
    'certificate_requests' as type, 
    COUNT(*) as pending_count 
FROM certificate_requests 
WHERE status = 'Pending';
```

**Files to Monitor**:
- `/admin/users/userstable.tsx` - User management functionality
- `/admin/leave/page.tsx` - Leave approval system
- `/admin/certificates/page.tsx` - Certificate approval workflow

### Dean Module (/dean/)
**Purpose**: Faculty oversight, evaluations, administrative decisions

**Daily Checks**:
- Review faculty evaluation submissions
- Check leave approvals for faculty
- Monitor certificate requests from faculty

**Weekly Maintenance**:
```sql
-- Dean oversight metrics
SELECT 
    u.name as faculty_name,
    COUNT(DISTINCT lr.id) as leave_requests,
    COUNT(DISTINCT cr.id) as cert_requests,
    AVG(CASE WHEN lr.is_approve = 1 THEN 1 WHEN lr.is_approve = 0 THEN 0 END) as approval_rate
FROM users u
LEFT JOIN leave_request lr ON u.id = lr.user_id AND lr.request_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
LEFT JOIN certificate_requests cr ON u.id = cr.user_id AND cr.request_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
WHERE u.role = 'faculty'
GROUP BY u.id, u.name;
```

**Files to Monitor**:
- `/dean/faculty-evaluation/facultyevaluationtable.tsx` - Faculty evaluation system
- `/dean/leave-management/leavemanagementtable.tsx` - Leave approval decisions
- `/dean/dean-certificate/deancertificatetable.tsx` - Certificate oversight

### Faculty Module (/faculty/)
**Purpose**: Faculty-specific attendance, leave, and certificate management

**Daily Checks**:
- Verify attendance tracking
- Check leave request submissions
- Monitor certificate generation

**Weekly Maintenance**:
```sql
-- Faculty engagement metrics
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_faculty,
    COUNT(*) as total_activities
FROM user_activity ua
JOIN users u ON ua.user_id = u.id
WHERE u.role = 'faculty' 
    AND ua.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Files to Monitor**:
- `/faculty/attendance/attendancetable.tsx` - Faculty attendance tracking
- `/faculty/leave-management/leavetable.tsx` - Faculty leave requests
- `/faculty/certificate-management/certificatestable.tsx` - Faculty certificates

### Evaluation Module (/evaluation/)
**Purpose**: Performance evaluation system

**Daily Checks**:
- Verify evaluation form submissions
- Check evaluation processing
- Monitor evaluation deadlines

**Weekly Maintenance**:
```sql
-- Evaluation system health check (if evaluation table exists)
-- Note: Add this table if not existing
CREATE TABLE IF NOT EXISTS evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evaluator_id INT NOT NULL,
    evaluated_id INT NOT NULL,
    evaluation_data JSON NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (evaluated_id) REFERENCES users(id)
);

-- Evaluation completion rates
SELECT 
    u.role,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT e.evaluated_id) as evaluated_users,
    ROUND(COUNT(DISTINCT e.evaluated_id) * 100.0 / COUNT(DISTINCT u.id), 2) as completion_rate
FROM users u
LEFT JOIN evaluations e ON u.id = e.evaluated_id 
    AND e.submission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.role;
```

**Files to Monitor**:
- `/evaluation/form.tsx` - Evaluation form functionality
- `/evaluation/auth.tsx` - Evaluation authentication
- `/evaluation/page.tsx` - Main evaluation interface

## System Monitoring & Alerts

### Critical Alerts (Immediate Action Required)
1. **Database Connection Failures**
   - Check database server status
   - Review connection pool settings
   - Verify network connectivity

2. **API Response Time > 5 seconds**
   - Check server resource utilization
   - Review database query performance
   - Analyze network latency

3. **Authentication Failures > 10 in 5 minutes**
   - Check for brute force attempts
   - Review authentication logs
   - Consider IP blocking

### Warning Alerts (Review within 24 hours)
1. **High number of pending requests**
2. **Unusual user activity patterns**
3. **Slow database queries**

### Performance Optimization

#### Database Indexes (Add if missing)
```sql
-- User activity optimization
CREATE INDEX idx_user_activity_user_date ON user_activity(user_id, created_at);

-- Leave request optimization  
CREATE INDEX idx_leave_request_status_date ON leave_request(is_approve, request_date);

-- Certificate request optimization
CREATE INDEX idx_certificate_status_date ON certificate_requests(status, request_date);

-- System logs optimization
CREATE INDEX idx_system_logs_module_timestamp ON system_logs(module, timestamp);
```

#### API Performance Monitoring
```javascript
// Add to your Express.js routes
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', async () => {
        const duration = Date.now() - start;
        if (duration > 1000) { // Log slow requests
            await db.execute(
                'INSERT INTO system_logs (type, message, module, details) VALUES (?, ?, ?, ?)',
                ['warning', `Slow API request: ${req.method} ${req.path}`, 'api', 
                 JSON.stringify({ duration, method: req.method, path: req.path })]
            );
        }
    });
    next();
});
```

## Backup & Recovery

### Daily Backups
```bash
#!/bin/bash
# Add to crontab: 0 2 * * * /path/to/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hrms"
DB_NAME="your_database_name"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u username -p$password $DB_NAME > $BACKUP_DIR/hrms_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/hrms_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "hrms_db_*.sql.gz" -mtime +7 -delete

# Log backup completion
echo "$(date): Database backup completed: hrms_db_$DATE.sql.gz" >> /var/log/hrms_backup.log
```

### Recovery Procedures
```bash
# Database restoration
gunzip /backups/hrms/hrms_db_YYYYMMDD_HHMMSS.sql.gz
mysql -u username -p your_database_name < /backups/hrms/hrms_db_YYYYMMDD_HHMMSS.sql
```

## Security Maintenance

### Weekly Security Checks
1. **Review User Permissions**
   ```sql
   -- Check for inactive users with admin privileges
   SELECT u.*, u.last_activity
   FROM users u 
   WHERE u.role IN ('admin', 'dean') 
     AND (u.last_activity IS NULL OR u.last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY));
   ```

2. **Audit Failed Login Attempts**
   ```sql
   SELECT 
       DATE(timestamp) as date,
       COUNT(*) as failed_attempts,
       COUNT(DISTINCT JSON_EXTRACT(details, '$.ip_address')) as unique_ips
   FROM system_logs 
   WHERE message LIKE '%authentication failed%' 
     AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
   GROUP BY DATE(timestamp)
   ORDER BY date DESC;
   ```

### Monthly Security Tasks
1. **Update Dependencies**
   ```bash
   # Update Node.js dependencies
   npm audit
   npm update
   
   # Update database if applicable
   # Follow your database update procedures
   ```

2. **Review Access Logs**
3. **Update SSL certificates if needed**

## Troubleshooting Common Issues

### Issue: Certificate Downloads Not Working
**Symptoms**: Users report downloads fail or produce empty files
**Solution**:
1. Check API endpoint responses
2. Verify blob creation in browser console
3. Test with different file types
4. Check server file permissions

### Issue: Leave Approval Status Not Persisting  
**Symptoms**: Approved/rejected status resets after page refresh
**Solution**:
1. Verify database is_approve field updates
2. Check API response status codes
3. Ensure proper state refresh after API calls
4. Test with different browsers

### Issue: High Database Connection Count
**Symptoms**: Connection pool exhaustion, slow responses
**Solution**:
1. Review connection pooling settings
2. Check for connection leaks in code
3. Monitor long-running queries
4. Consider connection timeout adjustments

## Emergency Procedures

### Database Corruption
1. Stop application immediately
2. Create emergency backup of current state
3. Run database integrity checks
4. Restore from most recent clean backup
5. Analyze corruption cause

### Security Breach
1. Change all administrative passwords
2. Review system logs for intrusion evidence
3. Check for unauthorized data access
4. Update security measures
5. Notify relevant stakeholders

## Maintenance Schedule Template

### Daily (Automated where possible)
- [ ] System health check
- [ ] Error log review  
- [ ] Performance metrics review
- [ ] Backup verification

### Weekly
- [ ] Database cleanup
- [ ] User activity analysis
- [ ] Security audit
- [ ] Performance optimization

### Monthly  
- [ ] Full system backup
- [ ] Data archival
- [ ] Security updates
- [ ] Comprehensive performance review

### Quarterly
- [ ] Disaster recovery testing
- [ ] Security penetration testing
- [ ] System capacity planning
- [ ] User access review
