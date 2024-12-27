require('dotenv').config();
const express = require('express');
const app = express();

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Add this to handle internationalized domain names without punycode
const { toASCII } = require('url');

// If you're handling domains, use this instead of direct punycode
const handleDomain = (domain) => {
    try {
        return new URL(domain).hostname;
    } catch {
        return domain;
    }
};

// Your existing server setup...
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Add this near your other routes
app.get('/test-env', (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT
    });
}); 