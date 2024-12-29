module.exports = {
    frontend: {
        outputPath: 'build',
        publicUrl: process.env.PUBLIC_URL || '/',
        optimization: {
            minimize: true,
            splitChunks: true
        }
    },
    backend: {
        outputPath: 'dist',
        copyFiles: ['package.json', '.env.example']
    }
}; 