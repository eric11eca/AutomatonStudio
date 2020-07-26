const express = require("express"),
      router = express.Router();

router.get("/", (request, response) => {
	response.render("index.html"
		/*{
			title: "Truth Table Generator",
			author: "Zeming Chen",
			description: "generates truth table acordding to premesis."
		}*/
	);
});

module.exports = router;
