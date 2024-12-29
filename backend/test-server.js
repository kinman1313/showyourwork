const express = require('express');
const app = express();

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working' });
});

// Start server
app.listen(5000, () => {
    console.log('Test server running on port 5000');
}); 