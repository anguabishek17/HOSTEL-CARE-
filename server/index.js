const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For dev, we allow all
        methods: ['GET', 'POST']
    }
});

const initDb = require('./models/dbInit');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Init DB
initDb().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Make io accessible to our router
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/students', studentRoutes);

app.get('/', (req, res) => res.send('Hostel Complaint Management API acts perfectly'));

// Socket.io for Realtime
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join_complaint', (complaintId) => {
        socket.join(`complaint_${complaintId}`);
        console.log(`Socket ${socket.id} joined complaint_${complaintId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
