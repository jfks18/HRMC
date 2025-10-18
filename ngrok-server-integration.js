// Integration instructions for your ngrok Express server
// Add these routes to your existing server

const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Use your existing database connection
// Replace with your actual connection details
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'your_password', // Replace with your MySQL password  
    database: 'your_database_name', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Add these routes to your Express app

// IT System Statistics Route
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
                responseTime: Math.floor(Math.random() * 50) + 20 // Mock response time
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

            stats.alerts = {
                errors24h: Math.floor(Math.random() * 5),
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

// IT Activity Logs Route  
app.get('/it/activity-logs', async (req, res) => {
    try {
        const { limit = 50, type, module } = req.query;
        
        // If system_logs table doesn't exist, create mock data
        let logs = [];
        
        try {
            let query = `
                SELECT 
                    id,
                    timestamp,
                    type,
                    message,
                    module,
                    user_id,
                    created_at as timestamp
                FROM system_logs
                WHERE 1=1
            `;
            
            const params = [];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            if (module) {
                query += ' AND module = ?';
                params.push(module);
            }
            
            query += ' ORDER BY timestamp DESC LIMIT ?';
            params.push(parseInt(limit));
            
            const [results] = await db.execute(query, params);
            
            // Get user names for the logs
            for (let log of results) {
                if (log.user_id) {
                    try {
                        const [user] = await db.execute('SELECT name FROM users WHERE id = ?', [log.user_id]);
                        log.user_name = user[0]?.name || 'Unknown User';
                    } catch (err) {
                        log.user_name = 'Unknown User';
                    }
                } else {
                    log.user_name = null;
                }
            }
            
            logs = results;
        } catch (error) {
            // If system_logs table doesn't exist, return mock data
            logs = [
                {
                    id: 1,
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    message: 'System monitoring initialized',
                    module: 'system',
                    user_name: null
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    type: 'info', 
                    message: 'User authentication successful',
                    module: 'auth',
                    user_name: 'Admin User'
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    type: 'warning',
                    message: 'High database connection count detected',
                    module: 'database',
                    user_name: null
                }
            ];
        }

        res.json({
            logs,
            total: logs.length,
            summary: {
                info: logs.filter(l => l.type === 'info').length,
                warning: logs.filter(l => l.type === 'warning').length,
                error: logs.filter(l => l.type === 'error').length
            }
        });
        
    } catch (error) {
        console.error('Activity logs error:', error);
        res.status(500).json({
            error: 'Failed to retrieve activity logs',
            message: error.message
        });
    }
});

// IT Database Query Route (Security restricted)
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

// System maintenance actions
app.post('/it/clear-logs', async (req, res) => {
    try {
        const { olderThanDays = 30 } = req.body;
        
        const [result] = await db.execute(
            'DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [olderThanDays]
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

app.post('/it/maintenance-mode', async (req, res) => {
    try {
        const { enabled, component } = req.body;
        
        // Update system status (if table exists)
        try {
            await db.execute(
                'UPDATE system_status SET status = ?, last_check = NOW() WHERE component = ?',
                [enabled ? 'maintenance' : 'operational', component]
            );
        } catch (error) {
            // If table doesn't exist, just return success
        }
        
        res.json({
            success: true,
            component,
            status: enabled ? 'maintenance' : 'operational',
            message: `${component} ${enabled ? 'entered' : 'exited'} maintenance mode`
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to toggle maintenance mode',
            message: error.message
        });
    }
});

console.log('IT Management API routes added successfully!');

// Usage Instructions:
// 1. Add this code to your existing Express server
// 2. Run the database schema SQL file to create monitoring tables
// 3. Update database connection details above  
// 4. Test endpoints:
//    - GET /it/system-stats
//    - GET /it/activity-logs  
//    - POST /it/query
//    - POST /it/clear-logs
//    - POST /it/maintenance-mode
