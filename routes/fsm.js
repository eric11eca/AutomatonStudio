const express = require("express"),
      router = express.Router();

router.get("/fsm", (request, response) => {
	response.render("fsm.html"
		/*{
			title: "Truth Table Generator",
			author: "Zeming Chen",
			description: "generates truth table acordding to premesis."
		}*/
	);
});

module.exports = router;
