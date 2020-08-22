function initialize() {
	inputStringLeft = null;
	currentStates = null;
	inactiveStates = null;
	previousStates = null;
	nextStates = null;
}

var regex = null;
var automaton = null;
var inputString = null;
var nextSymbolIndex = 0;
var currentStates = null;
var inactiveStates = null;
var previousStates = null;
var nextStates = null;
var inputIsFSM = true;

function colorStates(states, cssClass) {
	if (states === undefined || states === null) {
		return;
	}

	states = getElementsOfStates(states);

	for (var i = 0; i < states.length; i++) {
		states[i].children("ellipse").each(function () {
			$(this).attr("class", cssClass);
		});
	}
}

function colorDiv(divId, intervals, cssClass) {
	var regex = $("#" + divId).html();

	var start = 0;
	var out = "";

	for (var i = 0; i < intervals.length; i++) {
		out += regex.slice(start, intervals[i][0]);
		out += '<font class="' + cssClass + '">' + regex.slice(intervals[i][0], intervals[i][1]) + '</font>';
		start = intervals[i][1];
	}

	out += regex.slice(start);

	$("#" + divId).html(out);
}

function getElementsOfStates(states) {
	var retVal = [];

	for (var i = 0; i < states.length; i++) {
		$("title:contains('" + states[i] + "')").each(function (index, element) {
			if ($(this).text() === states[i]) {
				retVal.push($(this).parent());
			}
		});
	}

	return retVal;
}

function colorize() {
	colorStates(automaton.states, "inactiveStates");
	colorStates(previousStates, "previousState");
	colorStates(nextStates, "nextState");
	colorStates(currentStates, "currentState");
}

function reorderCirclesInAcceptingStates(states) {
	var stateElements = getElementsOfStates(states);
	for (var i = 0; i < stateElements.length; i++) {
		var e1 = $(stateElements[i].children("ellipse")[0]);
		var e2 = $(stateElements[i].children("ellipse")[1]);
		e1.insertAfter(e2);
	}
}

function drawGraph() {
	fetch('/fsm/printDotFormat', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			automaton: automaton
		})
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Unable to generate random automaton");
		}
		response.text().then(text => {
			var gvizXml = Viz(text, "svg");
			$("#automatonGraph").html(gvizXml);
			$("polygon").each(function (index, element) {
				if ($(this).attr("stroke") == "transparent") {
					$(this).attr("fill", "#f3f3f3");
				}
			});
			reorderCirclesInAcceptingStates(automaton.accepting);
			$("#automatonGraph svg").width($("#automatonGraph").width());
		});
		return true;
	}).catch((err) => {
		console.log(err);
	});
}

function colorNextSymbol() {
	$("#inputString").html(inputString);

	if ($("#inputString").html() === "") {
		$("#inputString").html("<br>");
	}

	if (nextSymbolIndex < inputString.length) {
		colorDiv("inputString", [
			[nextSymbolIndex, nextSymbolIndex + 1]
		], "nextSymbol");
	}
}

function resetAutomaton() {
	fetch('/fsm/getCurrentStates', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			automaton: automaton
		})
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Unable to reset automaton");
		}
		return response.text();
	}).then((data) => {
		currentStates = JSON.parse(data);
		inputString = $("#inputString").text();
		nextSymbolIndex = 0;
		colorize();
		colorNextSymbol();
	}).catch((err) => {
		console.log(err);
	});
}

$("#generateRandomString").click(function () {
	if ($("#startStop").text() === "Stop") {
		$("#startStop").click();
	}

	$("#inputString").val(Math.random() >= 0.5 ?
		noam.fsm.randomStringInLanguage(automaton).join("") :
		noam.fsm.randomStringNotInLanguage(automaton).join(""));
	onInputStringChange();
});

$("#generateRandomAcceptableString").click(function () {
	if ($("#startStop").text() === "Stop") {
		$("#startStop").click();
	}

	var s = noam.fsm.randomStringInLanguage(automaton).join("");
	$("#inputString").val(s);
	onInputStringChange();
});

$("#generateRandomUnacceptableString").click(function () {
	if ($("#startStop").text() === "Stop") {
		$("#startStop").click();
	}

	var s = noam.fsm.randomStringNotInLanguage(automaton).join("");
	$("#inputString").val(s);
	onInputStringChange();
});

$("#startStop").click(function () {
	let r = "";
	if ($("#startStop").text() === "Start") {
		r = $("#inputString").val();
		$("#inputString").parent().html('<div id="inputString" type="text" placeholder="See if this fits"><br></div>');
		$("#inputString").css("width", "10%");
		$("#inputString").html(r === "" ? '<br>' : r);
		resetAutomaton();
		$("#inputString").removeAttr("contenteditable");
		$("#inputFirst").attr("disabled", false);
		$("#inputNext").attr("disabled", false);
		$("#inputPrevious").attr("disabled", false);
		$("#inputLast").attr("disabled", false);
		$("#startStop").text("Stop");
	} else {
		//r = $("#inputString").text();
		$("#inputString").parent().html('<input id="inputString" type="text" placeholder="See if this fits">');
		$("#inputString").keyup(onInputStringChange);
		$("#inputString").change(onInputStringChange);
		$("#inputString").val(r);
		$("#inputString").attr("contenteditable", "");
		$("#inputFirst").attr("disabled", true);
		$("#inputNext").attr("disabled", true);
		$("#inputPrevious").attr("disabled", true);
		$("#inputLast").attr("disabled", true);
		$("#startStop").text("Start");
		$("#inputString").html(($("#inputString").text()));
		$("#inputString").focus();
	}
});

function onInputStringChange() {
	var chars = $("#inputString").val().split("");
	var alphabetSet = new Set(automaton.alphabet);
	var isValidInputString = -1;
	for (var i = 0; i < chars.length; i++) {
		if (!alphabetSet.has(chars[i])) {
			isValidInputString = i;
			break;
		}
	}

	if (isValidInputString === -1) {
		$("#startStop").attr("disabled", false);
		$("#inputString").parent().addClass("success");
		$("#inputString").parent().removeClass("error");
		$("#inputError").hide();
	} else {
		$("#startStop").attr("disabled", true);
		$("#inputString").parent().removeClass("success");
		$("#inputString").parent().addClass("error");
		$("#inputError").show();
		$("#inputError").text("Error: input character at position " + i + " is not in FSM alphabet.");
	}
}

async function forwardTransition() {
	let response = await fetch('/fsm/forwardTransition', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			automaton: automaton,
			currentStates: currentStates,
			input: inputString[nextSymbolIndex]
		})
	});
	let data = await response.text();
	return data;
}

function backwardTransition() {
	fetch('/fsm/backwardTransition', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			automaton: automaton,
			inputString: inputString.substring(0, nextSymbolIndex - 1).split("")
		})
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Unable to generate random automaton");
		}
		return response.text();
	}).then((data) => {
		currentStates = JSON.parse(data);
		nextSymbolIndex -= 1;
		colorize();
		colorNextSymbol();
	}).catch((err) => {
		console.log(err);
	});
}

$("#inputFirst").click(function () {
	resetAutomaton();
});

$("#inputPrevious").click(function () {
	if (nextSymbolIndex > 0) {
		backwardTransition();
	}
});

$("#inputNext").click(async function () {
	if (nextSymbolIndex < inputString.length) {
		let data = await forwardTransition();
		currentStates = JSON.parse(data);
		nextSymbolIndex += 1;
		colorize();
		colorNextSymbol();
	}
});

$("#inputLast").click(async function () {
	var i = 0;
	console.log(nextSymbolIndex);
	while (nextSymbolIndex < inputString.length) {
		console.log(nextSymbolIndex);
		let data = await forwardTransition();
		currentStates = JSON.parse(data);
		nextSymbolIndex += 1;
		colorize();
		colorNextSymbol();
		i = i + 1;
		if (i > 10) {
			break;
		}
	}
});

$("#regexinput").click(function () {
	inputIsFSM = false;
});

$("#fsminput").click(function () {
	inputIsFSM = true;
});

$("#generateRegex").click(function () {
	regex = noam.re.string.random(5, "abcd", {});
	regex = noam.re.string.simplify(regex);
	$("#regex").val(regex);
	$("#regex").focus();
	onRegexOrAutomatonChange();
});

function generateAutomaton(fsmType) {
	fetch('/fsm/generateAutomaton', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			fsmType: fsmType
		})
	}).then((response) => {
		if (!response.ok) {
			throw new Error("Unable to generate random automaton");
		}
		response.text().then(text => {
			var definition = process_automaton_df(text.split('#'));
			$("#states").val(definition[0]);
			$("#alphabet").val(definition[1]);
			$("#start").val(definition[2]);
			$("#accept").val(definition[3]);
			$("#transition").val(definition[4]);
			$("#transition").scrollTop(0);
			$("#transition").focus();
		});
		return true;
	}).catch((err) => {
		console.log(err);
	});
}

function process_automaton_df(definition) {
	var states = definition[1];
	var start = definition[2];
	var accept = definition[3];
	var alphabet = definition[4];
	var transition = definition[5];

	states = states.replace("states", '');
	states = states.replace(/\n/ig, ";");
	states = states.slice(1, -1);

	start = start.replace("starting", '');
	start = start.replace(/\n/ig, ",");
	start = start.slice(1, -1);

	accept = accept.replace("accepting", '');
	accept = accept.replace(/\n/ig, ";");
	accept = accept.slice(1, -1);

	alphabet = alphabet.replace("alphabet", '');
	alphabet = alphabet.replace(/\n/ig, ",");
	alphabet = alphabet.slice(1, -1);

	transition = transition.replace("transitions", '');
	return [states, alphabet, start, accept, transition.substr(1)];
}

$("#generateDFA").click(function () {
	generateAutomaton("DFA");
});

$("#generateNFA").click(function () {
	generateAutomaton("NFA");
});

$("#generateENFA").click(function () {
	generateAutomaton("ENFA");
});

async function convertToAutomaton(regex) {
	let response = await fetch('/fsm/convertToAutomaton', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			regex: regex
		})
	});
	let newFSM = await response.text();
	return newFSM;
}

async function convertAutomaton(req, automaton) {
	console.log(req);
	let response = await fetch(req, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			automaton: automaton
		})
	});
	let newFSM = await response.text();
	return newFSM;
}

$("#createAutomatonReg").click(async function () {
	$("#automatonGraph").html("");
	$("#inputString").html("<br>");

	regex = $("#regex").val();
	automatonType = $("#automatonType").val();
	automaton = await convertToAutomaton(regex);

	if (automatonType == "NFA") {
		automaton = await convertAutomaton("\fsm\convertEnfaToNfa", automaton);
	}

	if (automatonType == "DFA") {
		automaton = await convertAutomaton("\fsm\convertEnfaToNfa", automaton);
		automaton = await convertAutomaton("\fsm\convertNfaToDfa", automaton);
		automaton = await convertAutomaton("\fsm\minimize", automaton);
		automaton = await convertAutomaton("\fsm\convertStatesToNumbers", automaton);
	}

	initialize();
	drawGraph();
	resetAutomaton();

	$("#generateRandomString").attr("disabled", false);
	$("#generateRandomAcceptableString").attr("disabled", false);
	$("#generateRandomUnacceptableString").attr("disabled", false);
	$("#inputString").attr("disabled", false);
	$("#startStop").attr("disabled", false);
});

$("#createAutomatonFsm").click(async function () {
	$("#automatonGraph").html("");
	$("#inputString").html("<br>");

	var definition = {
		states: $("#states").val().split(';'),
		alphabet: $("#alphabet").val().split(','),
		start: $("#start").val(),
		accepting: $("#accept").val().split(';'),
		transitions: $("#transition").val().split('\n')
	};

	var response = await createAutomaton(definition);
	response = JSON.parse(response);

	automaton = response.automaton;
	regex = response.reg;
	$("#regex-input").val(regex);

	initialize();
	drawGraph();
	resetAutomaton();

	$("#generateRandomString").attr("disabled", false);
	$("#generateRandomAcceptableString").attr("disabled", false);
	$("#generateRandomUnacceptableString").attr("disabled", false);
	$("#inputString").attr("disabled", false);
	$("#startStop").attr("disabled", false);
});

async function createAutomaton(definition) {
	let response = await fetch('/fsm/createAutomaton', {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			definition: definition
		})
	});
	let newFSM = await response.text();
	return newFSM;
}

/*$("#regex").change(onRegexOrAutomatonChange);
$("#regex").keyup(onRegexOrAutomatonChange);
$("#fsm").change(onRegexOrAutomatonChange);
$("#fsm").keyup(onRegexOrAutomatonChange);*/

/*function onRegexOrAutomatonChange() {
  $("#automatonGraph").html("");
  $("#inputString").html("<br>");

  $("#generateRandomString").attr("disabled", true);
  $("#generateRandomAcceptableString").attr("disabled", true);
  $("#generateRandomUnacceptableString").attr("disabled", true);
  $("#createAutomaton").attr("disabled", true);
  $("#startStop").attr("disabled", true);
  $("#inputFirst").attr("disabled", true);
  $("#inputNext").attr("disabled", true);
  $("#inputPrevious").attr("disabled", true);
  $("#inputLast").attr("disabled", true);
  $("#inputString").parent().html('<input id="inputString" type="text" class="input-block-level monospaceRegex" placeholder="See if this fits" disabled>');
  $("#inputString").parent().removeClass("success error");
  $("#inputString").keyup(onInputStringChange);
  $("#inputString").change(onInputStringChange);
  $("#startStop").text("Start");
  $("#inputError").hide();

  if (inputIsFSM) {
    validateRegex();
  } else {
    validateFsm();
  }
}

function validateFsm() {
  var fsm = $("#transition").val();

  if (fsm.length === 0) {
    $("#transition").parent().removeClass("success error");
    $("#fsmError").hide();
  } else {
    try {
      noam.fsm.parseFsmFromString(fsm);
      $("#transition").parent().removeClass("error");
      $("#transition").parent().addClass("success");
      $("#createAutomaton").attr("disabled", false);
      $("#fsmError").hide();
    } catch (e) {
      $("#transition").parent().removeClass("success");
      $("#transition").parent().addClass("error");
      $("#fsmError").text("Error: " + e.message);
      $("#fsmError").show();
    }
  }
}

function validateRegex() {
  var regex = $("#regex").val();

  if (regex.length === 0) {
    $("#regex").parent().removeClass("success error");
    $("#fsmError").hide();
  } else {
    try {
      noam.re.string.toTree(regex);
      $("#regex").parent().removeClass("error");
      $("#regex").parent().addClass("success");
      $("#createAutomaton").attr("disabled", false);
      $("#fsmError").hide();
    } catch (e) {
      $("#regex").parent().removeClass("success");
      $("#regex").parent().addClass("error");
      $("#fsmError").text("Error: " + e.message);
      $("#fsmError").show();
    }
  }
}*/