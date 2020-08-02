const express = require("express"),
	router = express.Router(),
	bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

let stateAutomaton = require("../app/cfg.js").data;

router.get("/", (request, response) => {
	response.render("cfg", {
		title: "Context-free Grammar Simulation",
		author: "JINLIN AND HIS MASTER",
		description: "playground for define context-free grammar"
	});
});

router.post("/", (req, res, next) => {
	res.send({
		redirect: '/cfg'
	});
});

module.exports = router;