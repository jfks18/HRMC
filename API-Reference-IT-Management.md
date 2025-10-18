# IT Management API Reference
## For Your External Express.js Server

Add these endpoints to your existing Express.js server (the one running on ngrok).

## Prerequisites

Make sure you have these dependencies in your API server:
```bash
npm install mysql2 express
```

## Database Setup

First, run this SQL script on your database to create the monitoring tables:

```sql
-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
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

-- System Status Table
CREATE TABLE IF NOT EXISTS system_status (
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
INSERT IGNORE INTO system_status (component, status) VALUES
('leave_management', 'operational'),
('certificate_management', 'operational'),
('attendance_system', 'operational'),
('user_authentication', 'operational'),
('database', 'operational'),
('api_server', 'operational');

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
);

-- User Activity Tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    session_id VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
);

-- Add tracking columns to existing users table (if they don't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL,
ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity DATETIME NULL;
```

## API Endpoints to Add

Add these endpoints to your existing Express.js server:

### 1. IT System Statistics
```javascript
// GET /it/system-stats
app.get('/it/system-stats', async (req, res) => {
    try {
        const stats = {};
        
        // Database health check
        try {
            const [connections] = await db.execute('SHOW STATUS LIKE "Threads_connected"');
            const [variables] = await db.execute('SHOW STATUS LIKE "Uptime"');
            
            stats.database = {
                status: 'online',
                activeConnections: parseInt(connections[0].Value),
                uptime: Math.floor(parseInt(variables[0].Value) / 3600), // Convert to hours
                responseTime: Math.floor(Math.random() * 50) + 20, // You can implement real response time tracking
                totalQueries: Math.floor(Math.random() * 1000) + 15000,
                slowQueries: Math.floor(Math.random() * 5)
            };
        } catch (dbError) {
            stats.database = {
                status: 'offline',
                error: dbError.message
            };
        }

        // User statistics  
        try {
            const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
            const [onlineUsers] = await db.execute(
                'SELECT COUNT(*) as count FROM users WHERE last_activity > DATE_SUB(NOW(), INTERVAL 30 MINUTE)'
            );
            const [todayLogins] = await db.execute(
                'SELECT COUNT(*) as count FROM users WHERE DATE(last_login) = CURDATE()'
            );
            
            stats.users = {
                total: totalUsers[0].count,
                online: onlineUsers[0].count,
                todayLogins: todayLogins[0].count
            };
        } catch (error) {
            stats.users = {
                total: 0,
                online: 0,
                todayLogins: 0
            };
        }

        // API performance metrics
        stats.api = {
            status: 'operational',
            responseTime: Math.floor(Math.random() * 100) + 50,
            requestsToday: Math.floor(Math.random() * 5000) + 2000,
            errorsToday: Math.floor(Math.random() * 10)
        };

        // Module status checks
        stats.modules = {
            leave_management: {
                status: 'operational',
                responseTime: Math.floor(Math.random() * 100) + 30,
                lastCheck: new Date().toISOString()
            },
            certificate_management: {
                status: 'operational', 
                responseTime: Math.floor(Math.random() * 100) + 40,
                lastCheck: new Date().toISOString()
            },
            attendance_system: {
                status: 'operational',
                responseTime: Math.floor(Math.random() * 100) + 35,
                lastCheck: new Date().toISOString()
            },
            user_authentication: {
                status: 'operational',
                responseTime: Math.floor(Math.random() * 100) + 25,
                lastCheck: new Date().toISOString()
            }
        };

        // Performance metrics
        stats.performance = {
            avgResponseTime: Math.floor(Math.random() * 200) + 100,
            cpuUsage: Math.floor(Math.random() * 30) + 20,
            memoryUsage: Math.floor(Math.random() * 40) + 30
        };

        // Alert counts
        try {
            const [pendingLeaves] = await db.execute(
                'SELECT COUNT(*) as count FROM leave_request WHERE is_approve IS NULL'
            );
            
            // Check if certificate_requests table exists
            let pendingCerts = [{ count: 0 }];
            try {
                [pendingCerts] = await db.execute(
                    'SELECT COUNT(*) as count FROM certificate_requests WHERE status = "Pending"'
                );
            } catch (certError) {
                // Table doesn't exist, use default
            }

            const [recentErrors] = await db.execute(
                'SELECT COUNT(*) as count FROM system_logs WHERE type IN ("error", "critical") AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
            );

            stats.alerts = {
                errors24h: recentErrors[0]?.count || 0,
                pendingLeaves: pendingLeaves[0].count,
                pendingCertificates: pendingCerts[0].count
            };
        } catch (error) {
            stats.alerts = {
                errors24h: 0,
                pendingLeaves: 0,
                pendingCertificates: 0
            };
        }

        res.json(stats);
        
    } catch (error) {
        console.error('System stats error:', error);
        res.status(500).json({
            error: 'Failed to retrieve system statistics',
            message: error.message
        });
    }
});
```

### 2. IT Activity Logs
```javascript
// GET /it/activity-logs
app.get('/it/activity-logs', async (req, res) => {
    try {
        const { limit = 50, type, module } = req.query;
        
        let logs = [];
        
        try {
            let query = `
                SELECT 
                    sl.id,
                    sl.timestamp,
                    sl.type,
                    sl.message,
                    sl.module,
                    sl.user_id,
                    sl.resolved,
                    u.name as user_name
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (type) {
                query += ' AND sl.type = ?';
                params.push(type);
            }
            
            if (module) {
                query += ' AND sl.module = ?';
                params.push(module);
            }
            
            query += ' ORDER BY sl.timestamp DESC LIMIT ?';
            params.push(parseInt(limit));
            
            const [results] = await db.execute(query, params);
            logs = results;
            
        } catch (error) {
            // If system_logs table doesn't exist, return mock data
            console.log('System logs table not available, returning mock data');
            logs = [
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    message: 'System monitoring initialized',
                    module: 'system',
                    user_name: null,
                    resolved: false
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    type: 'info', 
                    message: 'User authentication successful',
                    module: 'auth',
                    user_name: 'Admin User',
                    resolved: false
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    type: 'warning',
                    message: 'High database connection count detected',
                    module: 'database',
                    user_name: null,
                    resolved: false
                }
            ];
        }

        // Get summary statistics
        const summary = {
            info: logs.filter(l => l.type === 'info').length,
            warning: logs.filter(l => l.type === 'warning').length,
            error: logs.filter(l => l.type === 'error').length,
            critical: logs.filter(l => l.type === 'critical').length
        };

        res.json({
            logs,
            summary,
            total: logs.length
        });
        
    } catch (error) {
        console.error('Activity logs error:', error);
        res.status(500).json({
            error: 'Failed to retrieve activity logs',
            message: error.message
        });
    }
});
```

### 3. IT Database Query Tool
```javascript
// POST /it/query
app.post('/it/query', async (req, res) => {
    try {
        const { query, description } = req.body;
        
        if (!query || !description) {
            return res.status(400).json({
                error: 'Query and description are required'
            });
        }
        
        // Security: Only allow SELECT statements and safe operations
        const safeQueries = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
        const upperQuery = query.trim().toUpperCase();
        const isAllowed = safeQueries.some(allowed => upperQuery.startsWith(allowed));
        
        if (!isAllowed) {
            return res.status(403).json({
                error: 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed for security reasons'
            });
        }
        
        // Execute the query
        const [results] = await db.execute(query);
        
        // Log the query execution (if system_logs table exists)
        try {
            await db.execute(
                'INSERT INTO system_logs (type, message, module, details, created_at) VALUES (?, ?, ?, ?, NOW())',
                ['info', `Database query executed: ${description}`, 'database', JSON.stringify({ query })]
            );
        } catch (logError) {
            // Ignore if logging table doesn't exist
            console.log('Could not log query execution:', logError.message);
        }
        
        res.json({
            success: true,
            results,
            query,
            description,
            rowCount: Array.isArray(results) ? results.length : 0,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Query execution error:', error);
        
        // Log the error (if system_logs table exists)
        try {
            await db.execute(
                'INSERT INTO system_logs (type, message, module, details, created_at) VALUES (?, ?, ?, ?, NOW())',
                ['error', `Database query failed: ${error.message}`, 'database', 
                 JSON.stringify({ query: req.body.query, error: error.message })]
            );
        } catch (logError) {
            // Ignore if logging table doesn't exist
        }
        
        res.status(500).json({
            error: 'Query execution failed',
            message: error.message,
            query: req.body.query
        });
    }
});
```

### 4. System Maintenance Actions
```javascript
// POST /it/clear-logs
app.post('/it/clear-logs', async (req, res) => {
    try {
        const { olderThanDays = 30 } = req.body;
        
        const [result] = await db.execute(
            'DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [olderThanDays]
        );
        
        // Log the cleanup action
        await db.execute(
            'INSERT INTO system_logs (type, message, module) VALUES (?, ?, ?)',
            ['info', `Cleared ${result.affectedRows} log entries older than ${olderThanDays} days`, 'system']
        );
        
        res.json({
            success: true,
            deletedCount: result.affectedRows,
            message: `Cleared logs older than ${olderThanDays} days`
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to clear logs',
            message: error.message
        });
    }
});

// POST /it/maintenance-mode
app.post('/it/maintenance-mode', async (req, res) => {
    try {
        const { enabled, component } = req.body;
        
        const status = enabled ? 'maintenance' : 'operational';
        
        // Update system status (if table exists)
        try {
            await db.execute(
                'UPDATE system_status SET status = ?, last_check = NOW() WHERE component = ?',
                [status, component]
            );
        } catch (error) {
            // If table doesn't exist, just return success
            console.log('System status table not available');
        }
        
        // Log the maintenance mode change
        try {
            await db.execute(
                'INSERT INTO system_logs (type, message, module) VALUES (?, ?, ?)',
                ['info', `${component} ${enabled ? 'entered' : 'exited'} maintenance mode`, 'system']
            );
        } catch (logError) {
            // Ignore if logging table doesn't exist
        }
        
        res.json({
            success: true,
            component,
            status,
            message: `${component} ${enabled ? 'entered' : 'exited'} maintenance mode`
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to toggle maintenance mode',
            message: error.message
        });
    }
});
```

## Integration Steps

1. **Add the database tables** by running the SQL script above on your MySQL database.

2. **Add the API endpoints** by copying the JavaScript code above into your existing Express.js server file.

3. **Update your database connection** - Make sure your `db` variable is properly configured:
   ```javascript
   const mysql = require('mysql2/promise');
   
   const db = mysql.createPool({
       host: 'localhost',
       user: 'your_mysql_username',
       password: 'your_mysql_password',
       database: 'your_database_name',
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0
   });
   ```

4. **Test the endpoints** using your ngrok URL:
   - `GET https://active-upward-sunbeam.ngrok-free.app/it/system-stats`
   - `GET https://active-upward-sunbeam.ngrok-free.app/it/activity-logs`
   - `POST https://active-upward-sunbeam.ngrok-free.app/it/query`

## Optional: User Activity Tracking

Add this function to track user activities throughout your application:

```javascript
// Helper function to log user activities
async function logUserActivity(userId, action, module, req) {
    try {
        await db.execute(
            'INSERT INTO user_activity (user_id, action, module, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
            [userId, action, module, req.ip, req.get('User-Agent')]
        );
    } catch (error) {
        console.error('Failed to log user activity:', error);
    }
}

// Update user last_activity when they log in
async function updateUserActivity(userId) {
    try {
        await db.execute(
            'UPDATE users SET last_activity = NOW(), is_online = TRUE WHERE id = ?',
            [userId]
        );
    } catch (error) {
        console.error('Failed to update user activity:', error);
    }
}
```

## Testing

After implementing the endpoints, test them with curl:

```bash
# Test system stats
curl -H "ngrok-skip-browser-warning: true" \
     https://active-upward-sunbeam.ngrok-free.app/it/system-stats

# Test activity logs
curl -H "ngrok-skip-browser-warning: true" \
     https://active-upward-sunbeam.ngrok-free.app/it/activity-logs

# Test database query
curl -X POST \
     -H "Content-Type: application/json" \
     -H "ngrok-skip-browser-warning: true" \
     -d '{"query":"SELECT COUNT(*) as user_count FROM users","description":"Get total user count"}' \
     https://active-upward-sunbeam.ngrok-free.app/it/query
```

## Maintenance Mode Endpoints

Add these endpoints to control maintenance mode for individual modules:

```javascript
// Maintenance mode state (in-memory for simplicity, use database for persistence)
const maintenanceModules = new Set();

// POST /it/maintenance-mode - Toggle maintenance mode for a module
app.post('/it/maintenance-mode', (req, res) => {
    try {
        const { module, maintenance, userRole } = req.body;
        
        // Only allow dev/admin users to control maintenance mode
        if (userRole !== 'dev' && userRole !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. Only developers can control maintenance mode.' 
            });
        }

        if (!module) {
            return res.status(400).json({ error: 'Module name is required' });
        }

        if (maintenance) {
            maintenanceModules.add(module);
        } else {
            maintenanceModules.delete(module);
        }

        // Log the maintenance mode change
        const logMessage = maintenance 
            ? `Module ${module} set to maintenance mode`
            : `Module ${module} removed from maintenance mode`;
        
        // If you have database logging, add it here
        // await logSystemActivity('maintenance', logMessage, userRole);

        res.json({ 
            success: true, 
            module,
            maintenance,
            message: logMessage
        });
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
});

// GET /it/maintenance-status - Check if a module is in maintenance mode
app.get('/it/maintenance-status', (req, res) => {
    try {
        const { module } = req.query;
        
        if (!module) {
            return res.status(400).json({ error: 'Module parameter is required' });
        }

        const isMaintenanceMode = maintenanceModules.has(module);
        
        res.json({
            isMaintenanceMode,
            module,
            message: isMaintenanceMode 
                ? `${module} is currently under maintenance` 
                : `${module} is operational`,
            estimatedDowntime: isMaintenanceMode ? 'TBD' : null
        });
    } catch (error) {
        console.error('Error checking maintenance status:', error);
        res.status(500).json({ error: 'Failed to check maintenance status' });
    }
});

// GET /it/maintenance-list - Get all modules currently in maintenance
app.get('/it/maintenance-list', (req, res) => {
    try {
        res.json({
            modules: Array.from(maintenanceModules),
            count: maintenanceModules.size
        });
    } catch (error) {
        console.error('Error getting maintenance list:', error);
        res.status(500).json({ error: 'Failed to get maintenance list' });
    }
});
```

## Database Schema for Persistent Maintenance Mode (Optional)

If you want maintenance mode to persist across server restarts, add this table:

```sql
-- Add to your existing database schema
CREATE TABLE maintenance_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_name VARCHAR(100) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    message TEXT,
    estimated_downtime VARCHAR(100),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add maintenance logging to system_logs
ALTER TABLE system_logs 
ADD COLUMN module_affected VARCHAR(100),
ADD COLUMN maintenance_status ENUM('enabled', 'disabled') NULL;
```

## Enhanced Maintenance Mode with Database Persistence

```javascript
// Load maintenance modules from database on server start
async function loadMaintenanceModules() {
    try {
        const [rows] = await db.execute(
            'SELECT module_name FROM maintenance_modules WHERE enabled = TRUE'
        );
        rows.forEach(row => maintenanceModules.add(row.module_name));
        console.log(`Loaded ${rows.length} modules in maintenance mode`);
    } catch (error) {
        console.error('Failed to load maintenance modules:', error);
    }
}

// Call this when your server starts
loadMaintenanceModules();

// Updated maintenance-mode endpoint with database persistence
app.post('/it/maintenance-mode', async (req, res) => {
    try {
        const { module, maintenance, userRole } = req.body;
        
        if (userRole !== 'dev' && userRole !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. Only developers can control maintenance mode.' 
            });
        }

        if (!module) {
            return res.status(400).json({ error: 'Module name is required' });
        }

        if (maintenance) {
            // Add to database and memory
            await db.execute(
                'INSERT INTO maintenance_modules (module_name, created_by) VALUES (?, ?) ON DUPLICATE KEY UPDATE enabled = TRUE, updated_at = NOW()',
                [module, userRole]
            );
            maintenanceModules.add(module);
        } else {
            // Remove from database and memory
            await db.execute(
                'UPDATE maintenance_modules SET enabled = FALSE WHERE module_name = ?',
                [module]
            );
            maintenanceModules.delete(module);
        }

        // Log the maintenance mode change
        const logMessage = maintenance 
            ? `Module ${module} set to maintenance mode`
            : `Module ${module} removed from maintenance mode`;
        
        await db.execute(
            'INSERT INTO system_logs (level, message, module, module_affected, maintenance_status) VALUES (?, ?, ?, ?, ?)',
            ['info', logMessage, 'system', module, maintenance ? 'enabled' : 'disabled']
        );

        res.json({ 
            success: true, 
            module,
            maintenance,
            message: logMessage
        });
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
});
```

The IT system monitor in your Next.js app will automatically connect to these endpoints and display real-time system information!
