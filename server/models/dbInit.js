const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log("Initializing database schema...");
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'warden', 'staff', 'official')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create with standard syntax if it does not exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
                status VARCHAR(20) NOT NULL DEFAULT 'DISPATCHED',
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Alter Constraints (MUST occur BEFORE updating data or it violates the old explicit check constraint)
        await client.query(`ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;`);
        await client.query(`ALTER TABLE complaints ALTER COLUMN status SET DEFAULT 'DISPATCHED';`);

        // Migrate Old Data First so adding new constraint doesn't fail
        await client.query(`UPDATE complaints SET status = 'DISPATCHED' WHERE status = 'pending';`);
        await client.query(`UPDATE complaints SET status = 'IN_PROGRESS' WHERE status = 'in_progress';`);
        await client.query(`UPDATE complaints SET status = 'COMPLETED' WHERE status = 'resolved';`);

        // Add New Constraint
        await client.query(`ALTER TABLE complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('DISPATCHED', 'IN_PROGRESS', 'COMPLETED'));`);

        // Add new fields if they don't exist (safe ALTER)
        await client.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS room_number VARCHAR(20);`);
        await client.query(`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS image_url TEXT;`);

        // Add room_number to users table for student records
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS room_number VARCHAR(20);`);

        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if we need to seed the database
        const res = await client.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(res.rows[0].count, 10);
        
        if (userCount === 0) {
            console.log("Empty database detected, seeding initial accounts...");
            const defaultPassword = await bcrypt.hash('password123', 10);
            
            await client.query(`
                INSERT INTO users (name, email, password, role) VALUES 
                ('Student Test', 'student@hostel.com', $1, 'student'),
                ('Warden Admin', 'warden@hostel.com', $1, 'warden'),
                ('Staff Worker', 'staff@hostel.com', $1, 'staff'),
                ('Higher Official', 'official@hostel.com', $1, 'official')
            `, [defaultPassword]);
            console.log("Seeded test accounts with password 'password123'");
        }

        await client.query('COMMIT');
        console.log("Database initialized successfully!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Failed to initialize database:", e);
        throw e;
    } finally {
        client.release();
    }
};

module.exports = initDb;
