import express from "express";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const { data: listItems, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: listItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    const { error } = await supabase
      .from('items')
      .insert([{ title: item }]);

    if (error) throw error;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/edit", async (req, res) => {
  const { updatedItemTitle: item, updatedItemId: id } = req.body;
  try {
    const { error } = await supabase
      .from('items')
      .update({ title: item })
      .eq('id', id);

    if (error) throw error;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/delete", async (req, res) => {
  const { deleteItemId: id } = req.body;
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
