const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const csv = require('csv-parser');
const { Readable } = require('stream');

const DEFAULT_PASSWORD = 'hostel@123';

// GET /api/students — all students
exports.getStudents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, room_number, created_at FROM users WHERE role = 'student' ORDER BY name`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

// POST /api/students — add single student
exports.addStudent = async (req, res) => {
    try {
        const { name, email, room_number } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

        const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, room_number)
             VALUES ($1, $2, $3, 'student', $4)
             ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, room_number = EXCLUDED.room_number
             RETURNING id, name, email, room_number`,
            [name, email, hashed, room_number || null]
        );
        res.status(201).json({ student: result.rows[0], defaultPassword: DEFAULT_PASSWORD });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add student' });
    }
};

// POST /api/students/upload — bulk CSV
// Expected CSV columns: name, email, room_number (room_number optional)
exports.uploadCSV = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const results = [];
    const errors  = [];

    // Parse CSV from buffer (multer memoryStorage)
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
        stream
            .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
            .on('data', (row) => results.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    if (results.length === 0) {
        return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const inserted = [];

    for (const row of results) {
        const name  = (row.name  || '').trim();
        const email = (row.email || '').trim().toLowerCase();
        const room  = (row.room_number || row.room || '').trim();

        if (!name || !email) {
            errors.push({ row, reason: 'Missing name or email' });
            continue;
        }

        try {
            const r = await pool.query(
                `INSERT INTO users (name, email, password, role, room_number)
                 VALUES ($1, $2, $3, 'student', $4)
                 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, room_number = EXCLUDED.room_number
                 RETURNING id, name, email, room_number`,
                [name, email, hashed, room || null]
            );
            inserted.push(r.rows[0]);
        } catch (err) {
            errors.push({ row, reason: err.message });
        }
    }

    res.json({
        inserted: inserted.length,
        errors,
        defaultPassword: DEFAULT_PASSWORD,
        students: inserted,
    });
};

// DELETE /api/students/:id — remove student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM users WHERE id = $1 AND role = 'student'`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete student' });
    }
};
