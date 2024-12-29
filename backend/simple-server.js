const express = require('express');
const app = express();

// Log all requests
app.use((req, res, next) => {
    console.log('Request received:', req.method, req.url);
    next();
});

// Basic routes
app.get('/', function (req, res) {
    console.log('Root route hit');
    res.send({ message: 'Root route' });
});

app.get('/test-env', function (req, res) {
    console.log('Test route hit');
    res.send({ message: 'Test route' });
});

// Start server
const server = app.listen(5000, function () {
    console.clear();
    console.log('Server started on port 5000');
});

// Handle errors
server.on('error', function (error) {
    console.error('Server error:', error);
}); 