import express from 'express';
import { createClient } from '@libsql/client';

const app = express();
app.use(express.json());

// Turso Database Client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const metaInfo = {
  developer: "Ramzan Ahsan",
  community_link: "https://chat.whatsapp.com/FiZBn0BykHX47d1iHLOay1"
};

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: "Online",
    mode: "Debug Mode",
    ...metaInfo,
    debug_endpoints: {
      random_sample: "/api/debug/sample",
      raw_phone_search: "/api/debug/phone/:phone",
      raw_username_search: "/api/debug/username/:nick"
    }
  });
});

// 1. Debug: Single Random Record Check (Columns Structure dekhne ke liye)
app.get('/api/debug/sample', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM telegram LIMIT 5');
    res.json({
      success: true,
      mode: "Sample Raw Data",
      ...metaInfo,
      columns_found: result.columns,
      total_rows: result.rows.length,
      sample_data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 2. Debug: Phone Search Raw Output
app.get('/api/debug/phone/:phone', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE phone = ? LIMIT 5',
      args: [req.params.phone]
    });
    res.json({
      success: true,
      query: req.params.phone,
      ...metaInfo,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 3. Debug: Username Search Raw Output
app.get('/api/debug/username/:nick', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE nick = ? LIMIT 5',
      args: [req.params.nick]
    });
    res.json({
      success: true,
      query: req.params.nick,
      ...metaInfo,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

export default app;
