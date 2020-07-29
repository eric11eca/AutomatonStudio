const express = require("express"),
	router = express.Router(),
	bodyParser = require('body-parser');

const truthTable = require("../app/truth.js");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

let premises = "";

router.get("/", (request, response) => {
	response.render("truth", {
		title: "Truth Table Generator",
		author: "Zeming Chen",
		description: "generates truth table acordding to premesis."
	});
});

router.post("/", (req, res, next) => {
	res.send({
		redirect: '/truth'
	});
});


router.post('/generateTable', (req, res, next) => {
	premises = req.body.premises;
	var result = truthTable.data.queryTruthTable(premises);
	return res.send(result);
});

module.exports = router;