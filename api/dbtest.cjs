const pool = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.status(200).json({ ok: true, result: rows });
  } catch (err) {
    console.error('DB test error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
