const fs = require('fs');
const path = require('path');

const verifyBuild = () => {
    // Verify frontend build
    const frontendBuildPath = path.join(__dirname, '../frontend/build');
    if (!fs.existsSync(frontendBuildPath)) {
        throw new Error('Frontend build directory is missing');
    }

    const indexHtml = path.join(frontendBuildPath, 'index.html');
    if (!fs.existsSync(indexHtml)) {
        throw new Error('index.html is missing from frontend build');
    }

    // Verify backend
    const serverFile = path.join(__dirname, '../backend/server.js');
    if (!fs.existsSync(serverFile)) {
        throw new Error('server.js is missing');
    }

    console.log('Build verification passed!');
};

verifyBuild(); 