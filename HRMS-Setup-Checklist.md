# HRMS System Setup & Operational Checklist

## ✅ Database Setup

### Step 1: Create Monitoring Infrastructure
```bash
# Run the database schema file
mysql -u your_username -p your_database < database-schema-monitoring.sql
```

### Step 2: Verify Tables Created
```sql
-- Check that all tables exist
SHOW TABLES;

-- Verify system_logs table structure
DESCRIBE system_logs;

-- Verify system_status table structure  
DESCRIBE system_status;

-- Check initial system components
SELECT * FROM system_status;
```

### Step 3: Add Missing Columns to Existing Tables
```sql
-- Add tracking columns to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL,
ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity DATETIME NULL;

-- Add tracking columns to leave_request table  
ALTER TABLE leave_request 
ADD COLUMN IF NOT EXISTS processed_by INT NULL,
ADD COLUMN IF NOT EXISTS processed_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verify changes
DESCRIBE users;
DESCRIBE leave_request;
```

## ✅ Backend API Integration

### Step 1: Add Routes to Your ngrok Server
1. Copy code from `ngrok-server-integration.js`
2. Add to your existing Express.js server
3. Update database connection details:
   ```javascript
   const db = mysql.createPool({
       host: 'localhost',
       user: 'YOUR_USERNAME',     // ← Update this
       password: 'YOUR_PASSWORD', // ← Update this  
       database: 'YOUR_DATABASE', // ← Update this
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   });
   ```

### Step 2: Test API Endpoints
```bash
# Test system stats
curl -H "ngrok-skip-browser-warning: true" \
     https://buck-leading-pipefish.ngrok-free.app/it/system-stats

# Test activity logs
curl -H "ngrok-skip-browser-warning: true" \
     https://buck-leading-pipefish.ngrok-free.app/it/activity-logs

# Test database query (POST request)
curl -X POST \
     -H "Content-Type: application/json" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{"query":"SELECT COUNT(*) as user_count FROM users","description":"Get total user count"}' \
     https://buck-leading-pipefish.ngrok-free.app/it/query
```

## ✅ Frontend Integration

### Step 1: Verify IT Module Structure
Check that these files exist:
- `src/app/it/layout.tsx` ✅
- `src/app/it/page.tsx` ✅  
- `src/app/it/database-query/page.tsx` ✅
- `src/app/it/system-monitor/page.tsx` ✅
- `src/app/it/components/SideNav.tsx` ✅

### Step 2: Test IT Dashboard Access
1. Navigate to `/it/` in your application
2. Verify IT navigation menu appears
3. Test database query tool at `/it/database-query`
4. Test system monitor at `/it/system-monitor`

### Step 3: Verify API Connectivity
1. Open browser developer tools
2. Navigate to `/it/system-monitor`
3. Check console for API calls:
   - Should see calls to `/it/system-stats`
   - Should see calls to `/it/activity-logs`
   - Check for any CORS or network errors

## ✅ Module Maintenance Setup

### Staff Module (`/staff/`)
**Files to Monitor:**
- `src/app/staff/attendance/attendancetable.tsx`
- `src/app/staff/leave-management/leavetable.tsx`
- `src/app/staff/certificate-management/certificatestable.tsx`

**Test Functionality:**
1. Staff can view attendance
2. Staff can submit leave requests
3. Staff can request certificates
4. Certificate downloads work properly

### Admin Module (`/admin/`)
**Files to Monitor:**
- `src/app/admin/users/userstable.tsx`
- `src/app/admin/leave/page.tsx`
- `src/app/admin/certificates/page.tsx`

**Test Functionality:**
1. Admin can manage users
2. Admin can approve/reject leaves
3. Admin can process certificates
4. User creation and editing works

### Dean Module (`/dean/`)
**Files to Monitor:**
- `src/app/dean/faculty-evaluation/facultyevaluationtable.tsx`
- `src/app/dean/leave-management/leavemanagementtable.tsx`
- `src/app/dean/dean-certificate/deancertificatetable.tsx`

**Test Functionality:**
1. Dean can review faculty evaluations
2. Dean can approve faculty leaves
3. Dean can oversee certificate processes

### Faculty Module (`/faculty/`)
**Files to Monitor:**
- `src/app/faculty/attendance/attendancetable.tsx`
- `src/app/faculty/leave-management/leavetable.tsx`
- `src/app/faculty/certificate-management/certificatestable.tsx`

**Test Functionality:**
1. Faculty attendance tracking works
2. Faculty leave requests process correctly
3. Faculty certificate management functions

### Evaluation Module (`/evaluation/`)
**Files to Monitor:**
- `src/app/evaluation/form.tsx`
- `src/app/evaluation/auth.tsx`
- `src/app/evaluation/page.tsx`

**Test Functionality:**
1. Evaluation form submission works
2. Authentication prevents unauthorized access
3. Evaluation data saves correctly

## ✅ Security Checklist

### Database Security
- [ ] Database user has minimum required permissions
- [ ] IT query endpoint only allows SELECT statements
- [ ] System logs capture security events
- [ ] User activity tracking enabled

### API Security  
- [ ] CORS properly configured
- [ ] Rate limiting implemented (if needed)
- [ ] Authentication required for sensitive endpoints
- [ ] Error messages don't expose sensitive info

### Frontend Security
- [ ] IT module restricted to authorized users only
- [ ] Sensitive data not logged to console in production
- [ ] Input validation on all forms
- [ ] File upload security (certificates)

## ✅ Performance Optimization

### Database Indexes
Run these to optimize query performance:
```sql
-- User activity optimization
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at);

-- Leave request optimization
CREATE INDEX IF NOT EXISTS idx_leave_request_status_date ON leave_request(is_approve, request_date);

-- System logs optimization  
CREATE INDEX IF NOT EXISTS idx_system_logs_module_timestamp ON system_logs(module, timestamp);
```

### Frontend Performance
- [ ] System monitor auto-refresh interval reasonable (30 seconds)
- [ ] Large data sets paginated properly
- [ ] API calls have proper loading states
- [ ] Error boundaries implemented for robustness

## ✅ Monitoring & Alerts Setup

### Daily Monitoring Tasks
1. **System Health Dashboard**
   - Check `/it/system-monitor` daily
   - Review error counts and response times
   - Monitor database connection health

2. **User Activity Review**
   - Check login patterns for anomalies
   - Review failed authentication attempts
   - Monitor module usage statistics

### Weekly Maintenance Tasks
1. **Database Cleanup**
   ```sql
   -- Clear old logs (run weekly)
   DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
   
   -- Clear old performance metrics  
   DELETE FROM performance_metrics WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
   ```

2. **Performance Review**
   - Analyze slow queries using IT database query tool
   - Review API response times
   - Check for growing table sizes

### Monthly Tasks
- [ ] Full database backup
- [ ] Security audit using system logs
- [ ] Performance optimization review
- [ ] User access rights review

## ✅ Backup Procedures

### Automated Daily Backup
Create this script and add to crontab:
```bash
#!/bin/bash
# Save as /scripts/hrms-backup.sh
# Add to crontab: 0 2 * * * /scripts/hrms-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hrms"
DB_NAME="your_database_name"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u username -p$password $DB_NAME > $BACKUP_DIR/hrms_db_$DATE.sql
gzip $BACKUP_DIR/hrms_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "hrms_db_*.sql.gz" -mtime +7 -delete

echo "$(date): Backup completed: hrms_db_$DATE.sql.gz" >> /var/log/hrms_backup.log
```

### Recovery Testing
- [ ] Test backup restoration monthly
- [ ] Verify backup file integrity
- [ ] Document recovery procedures
- [ ] Train team on recovery process

## ✅ Troubleshooting Guide

### Common Issues & Solutions

**Issue: IT Module Not Loading**
1. Check browser console for JavaScript errors
2. Verify IT route structure in Next.js
3. Check authentication/authorization for IT access
4. Test with different user roles

**Issue: API Endpoints Not Working**  
1. Verify ngrok server is running
2. Check database connection in server logs
3. Test with curl commands
4. Review CORS configuration

**Issue: Database Query Tool Errors**
1. Check database connection credentials
2. Verify user has SELECT permissions
3. Test query syntax in MySQL directly
4. Check for special characters in query

**Issue: System Monitor Shows No Data**
1. Verify API endpoints respond correctly
2. Check browser network tab for failed requests
3. Review server logs for errors  
4. Test with mock data fallback

### Emergency Contacts & Procedures
- [ ] Document who to contact for emergencies
- [ ] Create escalation procedures
- [ ] Maintain emergency access credentials
- [ ] Test emergency procedures regularly

## ✅ Go-Live Checklist

### Pre-Launch
- [ ] All database tables created successfully
- [ ] All API endpoints tested and working
- [ ] All module functionality verified
- [ ] Security measures implemented
- [ ] Backup procedures tested
- [ ] Performance optimizations applied

### Launch Day
- [ ] Monitor system health dashboard continuously
- [ ] Review error logs frequently  
- [ ] Test all critical user paths
- [ ] Monitor database performance
- [ ] Keep backup procedures ready

### Post-Launch (First Week)
- [ ] Daily system health reviews
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Security log analysis
- [ ] Backup verification

## 📞 Support Information

**Documentation References:**
- `HRMS-Maintenance-Guide.md` - Comprehensive maintenance procedures
- `IT-API-Reference.md` - Complete API documentation
- `database-schema-monitoring.sql` - Database schema setup
- `ngrok-server-integration.js` - Backend API implementation

**Key Files for Maintenance:**
- System Monitor: `src/app/it/system-monitor/page.tsx`
- Database Query Tool: `src/app/it/database-query/page.tsx`  
- IT Navigation: `src/app/it/components/SideNav.tsx`
- API Routes: Your ngrok Express server + added routes

**Monitoring URLs:**
- System Dashboard: `http://localhost:3000/it/`
- System Monitor: `http://localhost:3000/it/system-monitor`
- Database Query: `http://localhost:3000/it/database-query`

Remember to update all placeholder values (database credentials, server URLs, etc.) with your actual configuration!
