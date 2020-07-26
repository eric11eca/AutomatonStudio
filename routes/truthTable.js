const express = require("express"),
	  router = express.Router(),
	  path = require("path");
	  
let truthTable = require("../app/truth.js");

router.get("/", (request, response) => {
	response.sendFile(path.join(path.join(__dirname, 'public'), "truth.html")
		/*{
			title: "Truth Table Generator",
			author: "Zeming Chen",
			description: "generates truth table acordding to premesis."
		}*/
	);
});

router.get('/generateTable', function(req, res, next) {
	console.log(req.hostname)    
  console.log(req.path)    
	console.log(req.originalUrl)
	if (req.params.task == "generateTable") {
		console.log("request truth table generator");
		var result = truthTable.queryTruthTable();
		res.send({result: result});
	}
});

module.exports = router;
