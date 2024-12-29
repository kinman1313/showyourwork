const express = require('express');
const app = express();

// Add logging to see every request
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    console.log('Root route hit');
    res.json({ message: 'Root route' });
});

app.get('/test-env', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
    console.log('404 for:', req.url);
    res.status(404).json({ error: 'Not found' });
});

const server = app.listen(5000, () => {
    console.log('=================');
    console.log('Server is running');
    console.log('=================');
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
}); 