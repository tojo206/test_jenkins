const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API endpoint - Get data
app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello from the backend!',
        timestamp: new Date().toISOString(),
        server: 'Node.js/Express',
        version: '1.0.0'
    });
});

// API endpoint - Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({
            error: 'All fields are required'
        });
    }

    // In a real application, you would save this to a database
    // For now, just log it and return success
    console.log('Contact form submission:', { name, email, message });

    res.json({
        message: 'Thank you for your message! We will get back to you soon.',
        receivedAt: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

// For cPanel deployment, export the app
module.exports = app;
