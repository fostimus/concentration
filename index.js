const express = require("express");
const app = express();
const db = require("./models");

app.set("view engine", "ejs");

app.use(express.static("static"));

// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scores", function(req, res) {
  db.score
    .findAll({
      order: [["score", "DESC"]]
    })
    .then(scores => {
      res.render("scoreboard", { scores: scores });
    });
});

app.post("/score", function(req, res) {
  console.log(req.body.score);
  console.log(req.body.name);

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
      res.redirect("/scores");
    });
});

console.log("On port.....", port);

app.listen(port);
