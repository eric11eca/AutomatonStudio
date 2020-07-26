const express = require("express"),
	  router = express.Router(),
		bodyParser = require('body-parser');
		
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
			
let stateAutomaton = require("../app/stateAutomaton.js");

router.get("/", (request, response) => {
	response.render("fsm",
		{
			title: "Finite State Automaton Simulation",
			author: "Zeming Chen",
			description: "playground for define FSM and simulate string"
		}
	);
});

router.post("/createAutomaton", (req, res, next) => {
	var 
});

module.exports = router;
