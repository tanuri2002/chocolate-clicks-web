const pool = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const [rows] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName, email, created_at FROM users ORDER BY id DESC LIMIT 100');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
