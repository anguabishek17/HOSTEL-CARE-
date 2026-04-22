const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const totalReq = await pool.query('SELECT COUNT(*) FROM complaints');       
        const pendingReq = await pool.query("SELECT COUNT(*) FROM complaints WHERE status = 'DISPATCHED'");
        const inProgressReq = await pool.query("SELECT COUNT(*) FROM complaints WHERE status = 'IN_PROGRESS'");
        const resolvedReq = await pool.query("SELECT COUNT(*) FROM complaints WHERE status = 'COMPLETED'");
        
        const categoryStats = await pool.query('SELECT category as name, COUNT(*) as value FROM complaints GROUP BY category');

        res.json({
            totals: {
                all: parseInt(totalReq.rows[0].count),
                pending: parseInt(pendingReq.rows[0].count),
                resolved: parseInt(resolvedReq.rows[0].count),
                in_progress: parseInt(inProgressReq.rows[0].count)
            },
            categories: categoryStats.rows.map(row => ({ name: row.name, value: parseInt(row.value) }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
};
