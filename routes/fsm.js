const express = require("express"),
	router = express.Router(),
	bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

let stateAutomaton = require("../app/stateAutomaton").data;
let regex = require("../app/regex").data;

router.get("/", (request, response) => {
	response.render("fsm", {
		title: "Finite State Automaton Simulation",
		author: "Zeming Chen",
		description: "playground for define FSM and simulate string"
	});
});

router.post("/", (req, res, next) => {
	res.send({
		redirect: '/fsm'
	});
});

router.post("/generateAutomaton", (req, res, next) => {
	var fsmType = req.body.fsmType;
	var automaton = stateAutomaton.createRandomFsm(fsmType, 2, 2, 2);
	return res.send(stateAutomaton.serializeFsmToString(automaton));
});

router.post("/createAutomaton", (req, res, next) => {
	var definition = req.body.definition;
	var automaton = stateAutomaton.parseFsmFromString(definition);
	var expression = stateAutomaton.toRegex(automaton);
	//console.log(JSON.stringify(expression, null, 2));
	var linear = regex.tree.toLinear(expression);
	var reg = regex.linear.toString(linear);
	console.log(reg);
	return res.send({
		automaton,
		reg,
		expression
	});
});

router.post("/printDotFormat", (req, res, next) => {
	var automaton = req.body.automaton;
	var dotString = stateAutomaton.printDotFormat(automaton);
	return res.send(dotString);
});

router.post("/getCurrentStates", (req, res, next) => {
	var automaton = req.body.automaton;
	var currentStates = stateAutomaton.forwardEpsilonTransition(automaton, [automaton.starting]);
	return res.send(currentStates);
});

router.post("/forwardTransition", (req, res, next) => {
	var automaton = req.body.automaton;
	var currentStates = req.body.currentStates;
	var input = req.body.input;
	var newStates = stateAutomaton.forwardTransition(automaton, currentStates, input);
	return res.send(newStates);
});

router.post("/backwardTransition", (req, res, next) => {
	var automaton = req.body.automaton;
	var inputString = req.body.inputString;
	var newStates = stateAutomaton.backwardTransition(automaton, inputString);
	return res.send(newStates);
});

module.exports = router;