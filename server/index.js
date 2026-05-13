const express = require('express');
const cors = require('cors');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Core Middleware ──
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// ── API Routes ──
app.use('/api/centers', require('./routes/centers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/dispatches', require('./routes/dispatches'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Disaster Relief API is running', timestamp: new Date().toISOString() });
});

// ── Error Handling ──
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n🚨 Disaster Relief API Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/api/health`);
  console.log(`   Centers:    http://localhost:${PORT}/api/centers`);
  console.log(`   Inventory:  http://localhost:${PORT}/api/inventory`);
  console.log(`   Volunteers: http://localhost:${PORT}/api/volunteers`);
  console.log(`   Dispatches: http://localhost:${PORT}/api/dispatches\n`);
});
