import express from 'express';
import { createClient } from '@libsql/client';

const app = express();
app.use(express.json());

// Turso Database Client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Developer Branding & Credits
const metaInfo = {
  developer: "Ramzan Ahsan",
  community_link: "https://chat.whatsapp.com/FiZBn0BykHX47d1iHLOay1"
};

// Root Route - Welcome & API Documentation
app.get('/', (req, res) => {
  res.json({
    status: "Online",
    message: "Telegram Data Search API Active",
    ...metaInfo,
    endpoints: {
      search_by_phone: "/api/search/phone/:phone",
      search_by_username: "/api/search/username/:nick",
      search_by_id: "/api/search/id/:telegram_id"
    }
  });
});

// 1. Phone Number Search Endpoint
app.get('/api/search/phone/:phone', async (req, res) => {
  try {
    const queryPhone = req.params.phone.replace(/[^0-9]/g, ''); // Clean non-numeric input
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE phone LIKE ? LIMIT 50',
      args: [`%${queryPhone}%`]
    });

    res.json({
      success: true,
      query: req.params.phone,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 2. Username / Nick Search Endpoint
app.get('/api/search/username/:nick', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE nick LIKE ? OR name LIKE ? LIMIT 50',
      args: [`%${req.params.nick}%`, `%${req.params.nick}%`]
    });

    res.json({
      success: true,
      query: req.params.nick,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 3. Telegram ID (adapteruserid) Search Endpoint
app.get('/api/search/id/:id', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE adapteruserid = ? LIMIT 10',
      args: [req.params.id]
    });

    res.json({
      success: true,
      query: req.params.id,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

export default app;
