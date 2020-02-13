const express = require("express");
const router = express.Router();
const request = require("request");
const iconv = require("iconv-lite");
const { Mongo, updateData, API_URL } = require("../scripts/update");

Mongo.connect();

router.get("/", function(req, res, next) {
  let done = projects => {
    res.render("index", { title: "iBureau", projects: projects || [] });
  };
  !Mongo.projects || !Mongo.projects.find
    ? done()
    : Mongo.projects.find({}).toArray((err, projects) => {
        done(projects);
      });
});

router.get("/get", function(req, res, next) {
  request(
    {
      uri: req.query.url,
      method: "GET",
      encoding: null
    },
    (error, response, body) => {
      if (error) return res.send("");
      const file = iconv.decode(Buffer.from(body), "ISO-8859-1");
      res.send(`${API_URL}/${file}`);
    }
  );
});

router.get("/update", function(req, res, next) {
  updateData();
  res.send({ ok: 1 });
});

module.exports = router;
