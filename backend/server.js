require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/members',     require('./routes/members'));
app.use('/api/trainers',    require('./routes/trainers'));
app.use('/api/packages',    require('./routes/packages'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/memberships', require('./routes/memberships'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Gym Management API running ✅' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏋️  Gym API running on http://localhost:${PORT}`));
