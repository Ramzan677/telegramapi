import express from 'express';
import { createClient } from '@libsql/client';

const app = express();
app.use(express.json());

// Turso Database Client Setup
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Developer Branding Metadata
const metaInfo = {
  developer: "Ramzan Ahsan",
  community_link: "https://chat.whatsapp.com/FiZBn0BykHX47d1iHLOay1"
};

// Root Route - Documentation & Status
app.get('/', (req, res) => {
  res.json({
    status: "Online",
    message: "Telegram Fast Search API Active",
    ...metaInfo,
    endpoints: {
      search_by_username: "/api/search/username/:nick",
      search_by_id: "/api/search/id/:adapteruserid",
      search_by_phone: "/api/search/phone/:phone"
    }
  });
});

// 1. Fast Username / Nick Search Endpoint (Exact & Fast Search)
app.get('/api/search/username/:nick', async (req, res) => {
  try {
    const nick = req.params.nick.trim();
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE nick = ? OR name = ? LIMIT 20',
      args: [nick, nick]
    });

    res.json({
      success: true,
      query: nick,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 2. Telegram User ID Search Endpoint (Fastest Search)
app.get('/api/search/id/:adapteruserid', async (req, res) => {
  try {
    const id = req.params.adapteruserid.trim();
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE adapteruserid = ? LIMIT 10',
      args: [id]
    });

    res.json({
      success: true,
      query: id,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

// 3. Fast Phone Number Search Endpoint
app.get('/api/search/phone/:phone', async (req, res) => {
  try {
    const cleanPhone = req.params.phone.replace(/[^0-9]/g, '');
    const result = await db.execute({
      sql: 'SELECT * FROM telegram WHERE phone = ? LIMIT 20',
      args: [cleanPhone]
    });

    res.json({
      success: true,
      query: cleanPhone,
      total_found: result.rows.length,
      ...metaInfo,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, ...metaInfo });
  }
});

export default app;
