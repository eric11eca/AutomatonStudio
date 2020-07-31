const express = require("express"),
  router = express.Router();


router.get("/", (request, response) => {
  response.render("index", {
    title: "Computational Logic Toolboc",
    author: "Zeming Chen"
  });
});

router.post("/", (req, res, next) => {
  res.send({
    redirect: '/'
  });
});

module.exports = router;