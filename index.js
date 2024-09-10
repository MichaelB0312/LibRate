import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "bt,fubanv",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function load_items() {
  const result = await db.query(
    "SELECT * FROM items ORDER BY id ASC;"
  );

  console.log(result.rows);
  items = result.rows;
}

app.get("/", async (req, res) => {
  await load_items();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  let edited_item = req.body.updatedItemTitle;
  let item_id = req.body.updatedItemId;
  //console.log(req.body);
  await db.query("UPDATE items SET title = ($1) WHERE id = ($2)", [edited_item, item_id]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  let del_id = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = ($1)", [del_id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
