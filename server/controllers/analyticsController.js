const pool = require('../config/db');

exports.getOverview = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 0; // 0 means All Time
        
        // Build WHERE clauses for current and previous periods
        let currentWhere = '';
        let previousWhere = '';
        
        if (days > 0) {
            currentWhere = `WHERE created_at >= NOW() - INTERVAL '${days} days'`;
            previousWhere = `WHERE created_at >= NOW() - INTERVAL '${days * 2} days' AND created_at < NOW() - INTERVAL '${days} days'`;
        }

        // Fetch Current Stats
        const currentStatsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DISPATCHED' THEN 1 ELSE 0 END) as dispatched,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
            FROM complaints
            ${currentWhere}
        `;
        const currentRes = await pool.query(currentStatsQuery);
        const curr = currentRes.rows[0];

        // Fetch Previous Stats to calculate trends
        const prevStatsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DISPATCHED' THEN 1 ELSE 0 END) as dispatched,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
            FROM complaints
            ${previousWhere}
        `;
        const prevRes = await pool.query(prevStatsQuery);
        const prev = prevRes.rows[0];

        // Helper to calculate percentage change safely
        const calculateTrend = (current, previous) => {
            const curValue = parseInt(current) || 0;
            const prevValue = parseInt(previous) || 0;
            if (prevValue === 0) return curValue > 0 ? 100 : 0;
            return Math.abs(Math.round(((curValue - prevValue) / prevValue) * 100)); // returns absolute % difference
        };
        
        const getDirection = (current, previous) => {
             const curValue = parseInt(current) || 0;
             const prevValue = parseInt(previous) || 0;
             if(curValue === prevValue) return 'neutral';
             return curValue > prevValue ? 'up' : 'down';
        };

        res.json({
            current: {
                total: parseInt(curr.total) || 0,
                dispatched: parseInt(curr.dispatched) || 0,
                in_progress: parseInt(curr.in_progress) || 0,
                completed: parseInt(curr.completed) || 0
            },
            trends: {
                total: { dir: getDirection(curr.total, prev.total), percent: calculateTrend(curr.total, prev.total) },
                dispatched: { dir: getDirection(curr.dispatched, prev.dispatched), percent: calculateTrend(curr.dispatched, prev.dispatched) },
                in_progress: { dir: getDirection(curr.in_progress, prev.in_progress), percent: calculateTrend(curr.in_progress, prev.in_progress) },
                completed: { dir: getDirection(curr.completed, prev.completed), percent: calculateTrend(curr.completed, prev.completed) }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching overview analytics' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 0;
        let where = '';
        if (days > 0) {
            where = `WHERE created_at >= NOW() - INTERVAL '${days} days'`;
        }

        const categoryStats = await pool.query(`SELECT category as name, COUNT(*) as value FROM complaints ${where} GROUP BY category`);
        res.json(categoryStats.rows.map(row => ({ name: row.name, value: parseInt(row.value) })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching category analytics' });
    }
};

exports.getRecent = async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 10;
        const recent = await pool.query(`
            SELECT c.id, c.category, c.status, c.priority, c.created_at, u.name as student_name 
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC 
            LIMIT $1
        `, [limit]);

        res.json(recent.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching recent complaints' });
    }
};
