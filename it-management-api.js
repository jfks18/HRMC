// HRMS IT Management API Routes
// Add these routes to your Express.js server

const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection (adjust as needed)
const db = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// IT Database Query Endpoint
router.post('/it/query', async (req, res) => {
    try {
        const { query, description } = req.body;
        
        // Security: Only allow SELECT statements and specific safe operations
        const safeQueries = [
            'SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'
        ];
        
        const upperQuery = query.trim().toUpperCase();
        const isAllowed = safeQueries.some(allowed => upperQuery.startsWith(allowed));
        
        if (!isAllowed) {
            return res.status(403).json({
                error: 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed'
            });
        }
        
        // Log the query execution
        await db.execute(
            'INSERT INTO system_logs (type, message, module, details) VALUES (?, ?, ?, ?)',
            ['info', `Database query executed: ${description}`, 'database', JSON.stringify({ query })]
        );
        
        const [results] = await db.execute(query);
        
        res.json({
            success: true,
            results,
            query,
            description,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        // Log the error
        await db.execute(
            'INSERT INTO system_logs (type, message, module, details) VALUES (?, ?, ?, ?)',
            ['error', `Database query failed: ${error.message}`, 'database', JSON.stringify({ query: req.body.query, error: error.message })]
        );
        
        res.status(500).json({
            error: 'Query execution failed',
            message: error.message
        });
    }
});

// System Statistics Endpoint
router.get('/it/system-stats', async (req, res) => {
    try {
        const stats = {};
        
        // Database connections
        const [connections] = await db.execute('SHOW STATUS LIKE "Threads_connected"');
        stats.database = {
            activeConnections: parseInt(connections[0].Value),
            status: 'operational'
        };
        
        // User statistics
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [onlineUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE is_online = TRUE');
        const [todayLogins] = await db.execute(
            'SELECT COUNT(*) as count FROM users WHERE DATE(last_login) = CURDATE()'
        );
        
        stats.users = {
            total: totalUsers[0].count,
            online: onlineUsers[0].count,
            todayLogins: todayLogins[0].count
        };
        
        // System health
        const [systemStatus] = await db.execute('SELECT * FROM system_status');
        stats.modules = {};
        systemStatus.forEach(status => {
            stats.modules[status.component] = {
                status: status.status,
                responseTime: status.response_time_ms,
                uptime: status.uptime_percentage,
                lastCheck: status.last_check
            };
        });
        
        // Recent activity
        const [recentErrors] = await db.execute(
            'SELECT COUNT(*) as count FROM system_logs WHERE type IN ("error", "critical") AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
        );
        
        const [pendingLeaves] = await db.execute(
            'SELECT COUNT(*) as count FROM leave_request WHERE is_approve IS NULL'
        );
        
        const [pendingCerts] = await db.execute(
            'SELECT COUNT(*) as count FROM certificate_requests WHERE status = "Pending"'
        );
        
        stats.alerts = {
            errors24h: recentErrors[0].count,
            pendingLeaves: pendingLeaves[0].count,
            pendingCertificates: pendingCerts[0].count
        };
        
        // Performance metrics (last hour averages)
        const [avgResponseTime] = await db.execute(
            'SELECT AVG(metric_value) as avg_time FROM performance_metrics WHERE metric_name = "api_response_time" AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
        );
        
        stats.performance = {
            avgResponseTime: avgResponseTime[0].avg_time || 0,
            timestamp: new Date().toISOString()
        };
        
        res.json(stats);
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve system statistics',
            message: error.message
        });
    }
});

// Activity Logs Endpoint
router.get('/it/activity-logs', async (req, res) => {
    try {
        const { limit = 100, type, module, startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                sl.id,
                sl.timestamp,
                sl.type,
                sl.message,
                sl.module,
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
        
        if (startDate) {
            query += ' AND sl.timestamp >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND sl.timestamp <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY sl.timestamp DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [logs] = await db.execute(query, params);
        
        // Get summary statistics
        const [summary] = await db.execute(`
            SELECT 
                type,
                COUNT(*) as count
            FROM system_logs 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY type
        `);
        
        res.json({
            logs,
            summary: summary.reduce((acc, item) => {
                acc[item.type] = item.count;
                return acc;
            }, {}),
            total: logs.length
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve activity logs',
            message: error.message
        });
    }
});

// System Action Endpoints
router.post('/it/clear-logs', async (req, res) => {
    try {
        const { olderThanDays = 30 } = req.body;
        
        const [result] = await db.execute(
            'DELETE FROM system_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [olderThanDays]
        );
        
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

router.post('/it/maintenance-mode', async (req, res) => {
    try {
        const { enabled, component } = req.body;
        
        const status = enabled ? 'maintenance' : 'operational';
        
        await db.execute(
            'UPDATE system_status SET status = ?, last_check = NOW() WHERE component = ?',
            [status, component]
        );
        
        await db.execute(
            'INSERT INTO system_logs (type, message, module) VALUES (?, ?, ?)',
            ['info', `${component} ${enabled ? 'entered' : 'exited'} maintenance mode`, 'system']
        );
        
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

// Performance tracking middleware (add to your main routes)
const trackPerformance = async (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', async () => {
        const responseTime = Date.now() - start;
        
        try {
            await db.execute(
                'INSERT INTO performance_metrics (metric_name, metric_value, unit) VALUES (?, ?, ?)',
                ['api_response_time', responseTime, 'ms']
            );
        } catch (error) {
            console.error('Failed to log performance metric:', error);
        }
    });
    
    next();
};

// User activity tracking function (call this in your protected routes)
const logUserActivity = async (userId, action, module, req) => {
    try {
        await db.execute(
            'INSERT INTO user_activity (user_id, action, module, ip_address, user_agent, session_id) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, action, module, req.ip, req.get('User-Agent'), req.sessionID]
        );
    } catch (error) {
        console.error('Failed to log user activity:', error);
    }
};

module.exports = {
    router,
    trackPerformance,
    logUserActivity
};
