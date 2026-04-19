require('dotenv').config();
const express = require('express');
const cors = require('cors');

const signsRoutes = require('./routes/signs');
const statsRoutes = require('./routes/stats');
const alertsRoutes = require('./routes/alerts');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/signs', signsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/reports', reportsRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'NHAI Web App API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Express backend running on http://localhost:${PORT}`);
});
