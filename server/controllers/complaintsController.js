const pool = require('../config/db');

const validCategories = [
    "Electrical", "Plumbing", "WiFi / Internet", "Cleaning", 
    "Furniture", "Water Supply", "Security", "Mess / Food", 
    "Room Maintenance", "Other"
];

const validStatuses = ["DISPATCHED", "IN_PROGRESS", "COMPLETED"];

// Create a complaint
exports.createComplaint = async (req, res) => {
    try {
        const { category, description, priority, room_number } = req.body;
        const userId = req.user.id;
        // image_url comes from multer: file path relative to server
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category selected' });
        }

        const newComplaint = await pool.query(
            `INSERT INTO complaints (user_id, category, description, priority, status, room_number, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, category, description, priority, 'DISPATCHED', room_number || null, image_url]
        );

        req.io.emit('new_complaint', newComplaint.rows[0]);
        res.status(201).json(newComplaint.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating complaint' });
    }
};

// Get complaints based on role
exports.getComplaints = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        let query = `
            SELECT c.*, u.name as student_name, s.name as assigned_staff_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users s ON c.assigned_to = s.id
        `;
        let values = [];

        if (role === 'student') {
            query += ' WHERE c.user_id = $1 ORDER BY c.created_at DESC';
            values.push(userId);
        } else if (role === 'staff') {
            query += ' WHERE c.assigned_to = $1 ORDER BY c.created_at DESC';
            values.push(userId);
        } else {
            query += ' ORDER BY c.created_at DESC';
        }

        const complaints = await pool.query(query, values);
        res.json(complaints.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching complaints' });
    }
};

// Update status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log(`Backend received status update request for ID: ${id}, Status: ${status}`);

        if (!validStatuses.includes(status)) {
            console.error(`Invalid status received: ${status}`);
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const updated = await pool.query(
            'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        req.io.emit('complaint_updated', updated.rows[0]);
        console.log(`Successfully updated database and emitted socket event for ID: ${id}`);

        res.json(updated.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating status' });
    }
};

// Assign complaint to staff
exports.assignStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { staff_id } = req.body;
        
        // Auto assign sets state to DISPATCHED ensuring proper state transitions
        const updated = await pool.query(
            'UPDATE complaints SET assigned_to = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [staff_id, 'DISPATCHED', id] 
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        req.io.emit('complaint_updated', updated.rows[0]);
        req.io.emit('staff_assigned', updated.rows[0]);

        res.json(updated.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error assigning staff' });
    }
};

// Get all staff for dropdown
exports.getStaff = async (req, res) => {
    try {
        const staff = await pool.query("SELECT id, name FROM users WHERE role = 'staff'");
        res.json(staff.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching staff list' });
    }
};
