const express = require("express");
const app = express();
const db = require("./models");

app.set("view engine", "ejs");

app.use(express.static("static"));

// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/score", function(req, res) {
  res.redirect("/");
  db.score
    .findOrCreate({
      where: {
        name: req.body.name
      }
    })
    .then(returnedScore => {
      console.log(returnedScore);
    });
});

app.listen(4000);
