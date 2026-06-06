const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Database ──────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "notesdb",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

// Auto-create table kalau belum ada
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id         SERIAL PRIMARY KEY,
        title      VARCHAR(255) NOT NULL,
        content    TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Database siap");
  } finally {
    client.release();
  }
}

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────

// GET semua catatan
app.get("/api/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST buat catatan baru
app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Title wajib diisi" });
  try {
    const result = await pool.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE hapus catatan
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.json({ message: "Catatan dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────
async function start() {
  // Retry koneksi DB (tunggu postgres siap)
  let retries = 10;
  while (retries > 0) {
    try {
      await initDB();
      break;
    } catch (err) {
      console.log(`⏳ Nunggu database... (${retries} percobaan tersisa)`);
      retries--;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, () => {
    console.log(`🚀 Backend jalan di http://localhost:${PORT}`);
  });
}

start();
