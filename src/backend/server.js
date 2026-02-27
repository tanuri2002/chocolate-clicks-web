const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = require('./db');

app.get('/', (req, res) => {
  res.send('API is running...');
});

// DB test route
app.get('/dbtest', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, result: rows });
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Unable to connect to MySQL on startup:', err.message);
  }

  // Mount API routes
  const usersRouter = require('./routes/users');
  app.use('/api/users', usersRouter);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();