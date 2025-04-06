const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "taskmanager",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Database Connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL Database");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
})();

// Routes
app.get("/", (req, res) => res.send("Task Manager API (MySQL)"));

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const [tasks] = await pool.query(
      "SELECT * FROM tasks ORDER BY FIELD(priority, 'high', 'medium', 'low'), id ASC"
    );
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add a task
app.post("/tasks", async (req, res) => {
  const { title, priority } = req.body;

  if (!title || !["high", "medium", "low"].includes(priority)) {
    return res.status(400).json({ error: "Invalid title or priority" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (title, priority, completed) VALUES (?, ?, FALSE)",
      [title, priority]
    );

    res.status(201).json({ id: result.insertId, title, priority, completed: false });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mark task as completed/uncompleted
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connection...");
  await pool.end();
  console.log("Database connection closed.");
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
