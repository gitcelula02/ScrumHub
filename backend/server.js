require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const backlogRoutes = require('./routes/backlogs');
const sprintRoutes = require('./routes/sprints');
const epicRoutes = require('./routes/epics');
const aiRoutes = require('./routes/ai');
const NotificationService = require('./services/notificationService');
const cors = require('cors');

// Inicializar base de datos
(async () => {
    try {
        await initDatabase();
        console.log('✅ Bases de datos inicializadas');
    } catch (error) {
        console.error('⚠️ Error inicializando bases de datos:', error.message);
        console.log('⚠️ Continuando sin bases de datos...');
    }
})();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., server-to-server) or reflect dev frontend origin.
        if (!origin) return callback(null, true);
        // Allow configured FRONTEND_URL or any localhost dev ports
        const allowed = [process.env.FRONTEND_URL, 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'].filter(Boolean);
        if (allowed.includes(origin) || /http:\/\/localhost:8\d{2}/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    `http://localhost:${process.env.HOST_FRONTEND_PORT || 8080}`;

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', backlogRoutes);
app.use('/api', sprintRoutes);
app.use('/api', epicRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect(`${FRONTEND_URL}/dashboard`);
    }
    return res.redirect(`${FRONTEND_URL}/login`);
});

app.get(['/login', '/register', '/landing'], (req, res) => {
    return res.redirect(`${FRONTEND_URL}${req.path}`);
});

app.get(['/dashboard', '/profile', '/project/:id'], (req, res) => {
    if (!req.session.userId) {
        return res.redirect(`${FRONTEND_URL}/login`);
    }
    return res.redirect(`${FRONTEND_URL}${req.path}`);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setInterval(() => {
    NotificationService.checkAllTasksAndNotify();
}, 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Proyecto Jira running on port ${PORT}         ║
║                                                   ║
║   📁 http://localhost:${PORT}                       ║
║   📋 http://localhost:${PORT}/dashboard             ║
║   👤 http://localhost:${PORT}/login                 ║
║                                                   ║
║   Demo: admin@proyecto.com / admin123             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
