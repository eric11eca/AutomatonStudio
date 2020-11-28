const express = require("express"),
	router = express.Router(),
	bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

let cfgGrammar = require("../app/cfg.js").data;
let cfgInput = "";
let searchInput = "";

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

router.post('/generateCFG', (req, res, next) => {
	cfgInput = req.body.cfgInput;
	//console.log(cfgInput.split('->'));
	var result = cfgGrammar.createCFG();
	cfgGrammar.parseInputIn(cfgInput.split('\n') , result);
	console.log(result);
	
	return res.send("1");
	//return res.send(result);
})

router.post('/searchString', (req, res, next) => {
	console.log(1);
	searchInput = req.body.searchInput;
	//console.log(cfgInput.split('->'));
	if(cfgGrammar.core == undefined){
		throw new Error ("CFG not defined");
	}
	var result = cfgGrammar.LRParsing(cfgGrammar.core, searchInput.concat("$"));
	console.log(result);
	
	return res.send("1");
	//return res.send(result);
})

module.exports = router;