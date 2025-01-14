import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to the database!");
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/edit", async (req, res) => {
  const { updatedItemTitle: item, updatedItemId: id } = req.body;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/delete", async (req, res) => {
  const { deleteItemId: id } = req.body;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
