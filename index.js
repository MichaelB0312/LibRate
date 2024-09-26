import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "bt,fubanv",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;
const jsonAPI = 'https://openlibrary.org/search.json?q=';
const coverAPI = 'https://covers.openlibrary.org/b/olid/';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { book_id: 1, title: "1984", author: "George Orwell", olid:'OL21733390M' },
];

let error_msg = '';

async function load_items() {
  const result = await db.query(
    `SELECT book_list.book_id, book_list.title, book_details.read_date, book_details.OLID
      FROM book_list
      JOIN book_details
      ON book_list.book_id = book_details.id`
  );

  console.log(result.rows);
  items = result.rows;
}

async function fetchOLM(jsonAPI, item){

  let q_item = item.replaceAll(' ', '+').toLowerCase();
  try{
    const response = await axios.get(jsonAPI + q_item);
    return response.data.docs[0].cover_edition_key;
  } catch(error){
      console.error("Failed to make request:", error.message);
  }
}

app.get("/", async (req, res) => {
  await load_items();
  if( error_msg == ''){
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  }
  else{
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      error: error_msg
    });
  }
  let src = "https://covers.openlibrary.org/b/olid/" + items[0].olid + "-M.jpg";
  console.log (src);
});

app.post("/add", async (req, res) => {
  let item = req.body.newItem;
  error_msg = '';
  console.log(item);
  console.log(req.body);
  // await db.query("INSERT INTO book_list (title) VALUES ($1)", [item]);
  // await db.query("INSERT INTO book_details ")
  //const response1 = await axios.get(API_URL + '/Any?format=txt');
  //console.log("oldddd joke " + response1.data);
  console.log(typeof(jsonAPI + item));
  const olm = await fetchOLM(jsonAPI, item);
  console.log(olm);
  try{
    await db.query(
      "INSERT INTO book_list (title) VALUES ($1)",
      [item]
    );
    console.log("inserted into book list");
    const book_id = await db.query(
      "SELECT book_id FROM book_list WHERE title=($1)",
      [item]
    );
    console.log(book_id.rows[0].book_id);
    console.log("id has been selected");
    try{
      await db.query(
        "INSERT INTO book_details (id, read_date, olid) VALUES ($1,$2,$3)",
        [book_id.rows[0].book_id, req.body.read_date, olm]
      );
      res.redirect("/");
      //TODO///////// error adding to both tries
    }catch(err){
      console.log(err);
      error_msg = "Book has already been added, try again";
      res.redirect("/");
    }
  }catch(err){
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  let edited_item = req.body.updatedItemTitle;
  //console.log(typeof edited_item);
  let item_id = req.body.updatedItemId;
  console.log("wiiiiii ");
  console.log("wiiiiii " + item_id);
  //console.log(req.body);
  await db.query("UPDATE book_list SET title = ($1) WHERE book_id = ($2)", [edited_item, item_id]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  let del_id = req.body.deleteItemId;
  await db.query("DELETE FROM book_list WHERE id = ($1)", [del_id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
