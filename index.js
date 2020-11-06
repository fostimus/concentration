const express = require("express");
const app = express();
const db = require("./models");

app.set("view engine", "ejs");

app.use(express.static("static"));

// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/score", function(req, res) {
  res.redirect("/");
  // find the record with the name; if not, create it
  db.score
    .findOrCreate({
      where: {
        name: req.body.name
      }
    })
    .then(returnedScore => {
      const returnedValues = returnedScore[0].dataValues;
      // if the score is null or the subitted score (from current play) is bigger than saved score, update record
      if (!returnedValues.score || req.body.score > returnedValues.score) {
        console.log("hello");
        db.score.update(
          {
            score: req.body.score
          },
          {
            where: {
              name: returnedValues.name
            }
          }
        );
      }
    });
});

console.log("On port.....", port);

app.listen(port);
