// Minimal Node.js server for Railway debugging (no TypeScript)
const express = require('express');

console.log('🔍 Starting test server...');
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.get('/', (req, res) => {
  console.log('📡 Request received on /');
  res.json({
    message: 'Railway test server working!',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'not set'
  });
});

app.get('/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

console.log(`🚀 About to listen on 0.0.0.0:${PORT}`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running successfully on 0.0.0.0:${PORT}`);
  console.log(`📊 Health endpoint: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});