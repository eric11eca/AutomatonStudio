let fsm = {};
let util = require("./util.js").data;

fsm.constants = {
  epsilon: '$',
  determine: 'DFA',
  non_determine: 'NFA',
  e_non_determine: 'e',
};

/********** Define Finite State Automaton *************/

fsm.createFSM = function () {
  return {
    states: [],
    alphabet: [],
    accepting: [],
    starting: undefined,
    transitions: {}
  };
};

fsm._addStateOrAlphabet = function (arr, obj, undefErrorMsg, existsErrorMsg) {
  if (obj === undefined) {
    throw new Error(undefErrorMsg);
  }
  if (util.contains(arr, obj)) {
    throw new Error(existsErrorMsg);
  }

  arr.push(obj);
  return obj;
};

fsm.addState = function (automaton, state) {
  return fsm._addStateOrAlphabet(automaton.states, state,
    "No state object specified", "State already exists");
};

fsm.addAlphabet = function (automaton, char) {
  if (util.areEquivalent(char, fsm.constants.epsilon)) {
    throw new Error("Can't add the epsilon symbol to the alphabet");
  }
  return fsm._addStateOrAlphabet(automaton.alphabet, char,
    "No symbol object specified", "Symbol already exists");
};

fsm.addAcceptingState = function (automaton, state) {
  if (!util.contains(automaton.states, state)) {
    throw new Error("The specified object is not a state of the FSM");
  }
  fsm._addStateOrAlphabet(automaton.accepting, state, "",
    "The specified state is already accepting");
};

fsm.setStartingState = function (automaton, state) {
  if (!util.contains(automaton.states, state)) {
    throw new Error("The specified state is not in the FSM");
  }
  automaton.starting = state;
};

fsm._addTransition = function (automaton, fromState, toStates, input) {
  if (!util.contains(automaton.states, fromState) ||
    !util.containsAll(automaton.states, toStates)) {
    throw new Error("One of the specified objects is not a state of the FSM");
  }

  var transKey = fromState + ',' + input;

  if (transKey in automaton.transitions) {
    automaton.transition[transKey].toStates = util.setUnion(
      automaton.transitions[transKey].toStates, toStates);
  } else {
    automaton.transitions[transKey] = {};
    automaton.transitions[transKey].toStates = toStates;
    automaton.transitions[transKey].fromState = fromState;
    automaton.transitions[transKey].input = input;
  }
};

fsm.addTransition = function (automaton, fromState, toStates, transitionSymbol) {
  if (!util.contains(automaton.alphabet, transitionSymbol)) {
    throw new Error("The specified object is not an alphabet symbol of the FSM");
  }
  fsm._addTransition(automaton, fromState, toStates, transitionSymbol);
};

fsm.addEpsilonTransition = function (automaton, fromState, toStates) {
  fsm._addTransition(automaton, fromState, toStates, automaton.constants.epsilon);
};

fsm.loadContents = function (automaton, states, alphabet, start, accepting, transitions) {
  for (var i = states.length - 1; i >= 0; i--) {
    fsm.addState(automaton, states[i]);
  }

  for (i = alphabet.length - 1; i >= 0; i--) {
    fsm.addAlphabet(automaton, alphabet[i]);
  }

  for (i = 0; i < accepting.length; i++) {
    fsm.addAcceptingState(automaton, accepting[i]);
  }

  fsm.setStartingState(automaton, start);

  for (i = 0; i < transitions.length; i++) {
    var transition = transitions[i];

    for (var j = 0; j < transition[0].length; j++) {
      for (var k = 0; k < transition[1].length; k++) {
        if (transition[1][k] === fsm.constants.epsilon) {
          fsm.addEpsilonTransition(automaton, transition[0][j], transition[2]);
        } else {
          fsm.addTransition(automaton, transition[0][j], transition[2], transition[1][k]);
        }
      }
    }
  }
};

/********** Validate Finite State Automaton Definition*************/
fsm.validate = function (automaton) {
  var i, j, k;
  var transitions = Object.values(automaton.transitions);

  if (typeof automaton == 'undefined' || automaton == null) {
    throw new Error('Automaton defenition missing');
  }
  if (automaton.states.length < 1) {
    throw new Error('Automaton definition missing states');
  }
  if (automaton.alphabet.length < 1) {
    throw new Error('Automaton definition missing alphabet');
  }
  if (typeof automaton.starting == 'undefined' || automaton.starting == null) {
    throw new Error('Automaton definition missing starting states');
  }
  if (automaton.accepting.length < 1) {
    throw new Error('Automaton definition missing accepting states');
  }

  if (transitions.length < 1) {
    throw new Error('Automaton definition missing transtions');
  }

  var statesSet = new Set(automaton.states);
  var alphabetSet = new Set(automaton.alphabet);
  var acceptingSet = new Set(automaton.accepting);

  if (statesSet.size < automaton.states.length) {
    throw new Error('Error: Equivalent states');
  }

  if (alphabetSet.size < automaton.alphabet.length) {
    throw new Error('Error: Equivalent alphabet characters');
  }

  if (acceptingSet.size < automaton.accepting.length) {
    throw new Error('Error: Equivalent acceptingStates');
  }

  if (util.contains(automaton.alphabet, fsm.constants.epsilon)) {
    throw new Error('Error: Alphabet contains epsilon');
  }

  automaton.alphabet.forEach(char => {
    if (util.contains(automaton.states, char)) {
      throw new Error('Error: States and alphabet character overlap');
    }
  });

  automaton.accepting.forEach(state => {
    if (!(util.contains(automaton.states, state))) {
      throw new Error('Error: one accepting state is not in the automaton');
    }
  });

  if (!(util.contains(automaton.states, automaton.starting))) {
    throw new Error('Error: The starting state is not in the automaton');
  }

  for (i = 0; i < transitions.length; i++) {
    var transition = transitions[i];

    if (typeof transition.fromState === 'undefined' ||
      typeof transition.toStates === 'undefined' ||
      typeof transition.input === 'undefined') {
      throw new Error('Transitions must have fromState, toState and symbol');
    }

    if (!(util.contains(automaton.states, transition.fromState))) {
      throw new Error('Transition fromState must be in states.');
    }

    if (!(util.contains(automaton.alphabet, transition.input)) &&
      transition.input !== automaton.constants.epsilon) {
      throw new Error('Transition symbol must be in alphabet.');
    }

    for (k = 0; k < transition.toStates.length; k++) {
      if (!(util.contains(automaton.states, transition.toStates[k]))) {
        throw new Error('Transition toStates must be in states.');
      }

      if (util.contains(transition.toStates, transition.toStates[k], k + 1)) {
        throw new Error('Transition toStates must not contain duplicates.');
      }
    }
  }

  for (i = 0; i < transitions.length; i++) {
    for (j = i + 1; j < transitions.length; j++) {
      if (transitions[i].fromState === transitions[j].fromState &&
        transitions[i].input === transitions[j].input) {
        throw new Error('Transitions for the same fromState and symbol must be defined in a single trainsition.');
      }
    }
  }

  return true;
};

/********** Parse Finite State Automaton Definition*************/

fsm.parseFsmFromString = function (definition) {
  var states = definition.states;
  var alphabet = definition.alphabet;
  var start = definition.start;
  var accepting = definition.accepting;
  var transitions = definition.transitions;
  var transfunc = [];

  var parseCounts = {
    states: (states.length > 0),
    alphabet: (alphabet.length > 0),
    start: (start.length > 0),
    accepting: (accepting.length > 0),
    transitions: (transitions.length > 0)
  };

  transitions.forEach(trans => {
    var state_rest = trans.split(':');

    var state = state_rest[0].split(',');
    var parts = state_rest[1].split(';');

    for (var j = 0; j < parts.length; j++) {
      var left_right = parts[j].split('->');
      var al_t = left_right[0].split(',');
      var st_t = left_right[1].split(',');
    }

    transfunc.push([state, al_t, st_t]);
  });

  for (var k in parseCounts) {
    if (!parseCounts[k]) {
      throw new Error('Fromal definition missing' + parseCounts[k]);
    }
  }

  var automaton = fsm.createFSM();
  fsm.loadContents(automaton, states, alphabet, start, accepting, transfunc);
  fsm.validate(automaton);
  return automaton;
};


/**********Transition Functions for Finite State Automaton *************/

fsm.forwardEpsilonTransition = function (automaton, currentStates) {
  if (!(util.containsAll(automaton.states, currentStates))) {
    throw new Error('FSM must contain all the given states.');
  }

  let unprocessedStates = currentStates;
  let newStates = [];

  while (unprocessedStates.length !== 0) {
    let currentState = unprocessedStates.pop();
    newStates.push(currentState);

    Object.keys(automaton.transitions).forEach(key => {
      let transition = automaton.transitions[key];
      if (transition.input == fsm.constants.epsilon &&
        util.areEquivalent(transition.fromState, currentState)) {
        transition.toStates.forEach(state => {
          if (!(util.contains(newStates, state))) {
            unprocessedStates.push(transition.toStates[j]);
          }
        });
      }
    });
  }
  return newStates;
};

fsm.forwardSymbolTransition = function (automaton, currentStates, symbol) {
  var newStates = [];

  Object.keys(automaton.transitions).forEach(key => {
    let transition = automaton.transitions[key];

    if (util.areEquivalent(transition.input, symbol) &&
      util.contains(currentStates, transition.fromState)) {
      transition.toStates.forEach(state => {
        if (!(util.contains(newStates, state))) {
          newStates.push(state);
        }
      });
    }
  });
  return newStates;
};

fsm.forwardTransition = function (automaton, currentStates, input) {
  if (!(util.containsAll(automaton.states, currentStates))) {
    throw new Error('Some states are not in the automaton states');
  }

  if (!(util.contains(automaton.alphabet, input))) {
    throw new Error('This character are not in the automaton alphabet');
  }

  var newStates = util.clone(currentStates);

  newStates = fsm.forwardEpsilonTransition(automaton, newStates);
  newStates = fsm.forwardSymbolTransition(automaton, newStates, input);
  newStates = fsm.forwardEpsilonTransition(automaton, newStates);

  return newStates;
};

fsm.backwardTransition = function (automaton, inputString) {
  if (!(util.containsAll(automaton.alphabet, inputString))) {
    throw new Error('Some characters are not in the automaton alphabet');
  }

  let newStates = fsm.forwardEpsilonTransition(automaton, [automaton.starting]);

  inputString.forEach(char => {
    newStates = fsm.forwardTransition(automaton, newStates, char);
  });

  return newStates;
};




// read a stream of input symbols starting from state and make a list of
// states that were on the transition path
fsm.transitionTrail = function (fsm, state, inputSymbolStream) {
  if (!(util.containsAll(fsm.alphabet, inputSymbolStream))) {
    throw new Error('FSM must contain all symbols for which the transition is being computed');
  }

  var states = [state];
  var trail = [util.clone(states)];

  for (var i = 0; i < inputSymbolStream.length; i++) {
    states = fsm.makeTransition(fsm, states, inputSymbolStream[i]);
    trail.push(util.clone(states));
  }

  return trail;
};

// test if a stream of input symbols leads a fsm to an accepting state
fsm.isStringInLanguage = function (fsm, inputSymbolStream) {
  var states = fsm.readString(fsm, inputSymbolStream);

  return util.containsAny(fsm.acceptingStates, states);
};

// pretty print the fsm transition function and accepting states as a table
fsm.printTable = function (fsm) {
  var Table = require('cli-table');
  var colHeads = [""].concat(fsm.alphabet);

  if (fsm.determineType(fsm) === fsm.constans.e_non_determine) {
    colHeads.push(fsm.constants.epsilon);
  }

  colHeads.push("");

  var table = new Table({
    head: colHeads,
    chars: {
      'top': '-',
      'top-mid': '+',
      'top-left': '+',
      'top-right': '+',
      'bottom': '-',
      'bottom-mid': '+',
      'bottom-left': '+',
      'bottom-right': '+',
      'left': '|',
      'left-mid': '+',
      'mid': '-',
      'mid-mid': '+',
      'right': '|',
      'right-mid': '+'
    },
    truncate: '~'
  });

  var tableRows = [],
    i, j;
  for (i = 0; i < fsm.states.length; i++) {
    tableRows.push(new Array(colHeads.length));
    for (j = 0; j < colHeads.length; j++) {
      tableRows[i][j] = "";
    }
    tableRows[i][0] = fsm.states[i].toString();
    tableRows[i][colHeads.length - 1] =
      util.contains(fsm.acceptingStates, fsm.states[i]) ?
      "1" : "0";
    table.push(tableRows[i]);
  }

  for (i = 0; i < fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    var colNum = null;
    var rowNum = null;

    for (j = 0; j < fsm.states.length; j++) {
      if (util.areEquivalent(fsm.states[j], transition.fromState)) {
        rowNum = j;
        break;
      }
    }

    if (transition.symbol === fsm.constants.epsilon) {
      colNum = colHeads.length - 2;
    } else {
      for (j = 0; j < fsm.alphabet.length; j++) {
        if (util.areEquivalent(fsm.alphabet[j], transition.symbol)) {
          colNum = j + 1;
          break;
        }
      }
    }

    if (typeof tableRows[rowNum][colNum].text === "undefined") {
      tableRows[rowNum][colNum] = {
        text: []
      };
    }

    tableRows[rowNum][colNum].text.push(transition.toStates);
  }

  return table.toString();
};

fsm.serializeFsmToString = function (fsm) {
  var lines = [];

  lines.push("#states");

  for (var i = 0; i < fsm.states.length; i++) {
    lines.push(fsm.states[i].toString());
  }

  lines.push("#initial");

  lines.push(fsm.initialState.toString());

  lines.push("#accepting");

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    lines.push(fsm.acceptingStates[i].toString());
  }

  lines.push("#alphabet");

  for (i = 0; i < fsm.alphabet.length; i++) {
    lines.push(fsm.alphabet[i].toString());
  }

  lines.push("#transitions");

  for (i = 0; i < fsm.transitions.length; i++) {
    lines.push(fsm.transitions[i].fromState.toString() + ":" +
      fsm.transitions[i].symbol.toString() + "->" +
      fsm.transitions[i].toStates.join(","));
  }

  return lines.join("\n");
};

fsm.isAcceptingState = function (fsm, stateObj) {
  return util.contains(fsm.acceptingStates, stateObj);
};

fsm.determineType = function (fsm) {
  var fsmType = fsm.constans.determine;

  for (var i = 0; i < fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    if (transition.symbol === fsm.constants.epsilon) {
      fsmType = fsm.constans.e_non_determine;
      break;
    } else if (transition.toStates.length === 0 ||
      transition.toStates.length > 1) {
      fsmType = fsm.constans.non_determine;
    }
  }

  if (fsmType === fsm.constans.determine) {
    if (fsm.transitions.length < fsm.states.length * fsm.alphabet.length) {
      fsmType = fsm.constans.non_determine;
    }
  }

  return fsmType;
};



// print the fsm transition function and accepting states as an HTML table
fsm.printHtmlTable = function (fsm) {
  var headers = [""].concat(fsm.alphabet);
  if (fsm.determineType(fsm) === fsm.constans.e_non_determine) {
    headers.push(fsm.constants.epsilon);
  }
  headers.push("");

  var tableRows = [],
    i, j;

  for (i = 0; i < fsm.states.length; i++) {
    tableRows.push(new Array(headers.length));
    for (j = 0; j < headers.length; j++) {
      tableRows[i][j] = {
        text: []
      };
    }
    tableRows[i][0] = {
      text: fsm.states[i].toString()
    };
    tableRows[i][headers.length - 1] =
      util.contains(fsm.acceptingStates, fsm.states[i]) ? {
        text: ["1"]
      } : {
        text: ["0"]
      };
  }

  for (i = 0; i < fsm.transitions.length; i++) {
    var transition = fsm.transitions[i];

    var colNum = null;
    var rowNum = null;

    for (j = 0; j < fsm.states.length; j++) {
      if (util.areEquivalent(fsm.states[j], transition.fromState)) {
        rowNum = j;
        break;
      }
    }

    if (transition.symbol === fsm.constants.epsilon) {
      colNum = headers.length - 2;
    } else {
      for (j = 0; j < fsm.alphabet.length; j++) {
        if (util.areEquivalent(fsm.alphabet[j], transition.symbol)) {
          colNum = j + 1;
          break;
        }
      }
    }

    if (typeof tableRows[rowNum][colNum].text === "undefined") {
      tableRows[rowNum][colNum] = {
        text: []
      };
    }

    tableRows[rowNum][colNum].text.push(transition.toStates);
  }

  var htmlString = [];

  htmlString.push("<table border='1'>");
  htmlString.push("  <tr>");

  for (i = 0; i < headers.length; i++) {
    htmlString.push("    <th>" + headers[i].toString() + "</th>");
  }

  htmlString.push("  </tr>");

  for (i = 0; i < tableRows.length; i++) {
    htmlString.push("  <tr>");
    for (j = 0; j < tableRows[i].length; j++) {
      htmlString.push("    <td>" + tableRows[i][j].text + "</td>");
    }

    htmlString.push("  </tr>");
  }

  htmlString.push("</table>");
  return htmlString.join("\n");
};

// print the fsm in the graphviz dot format
fsm.printDotFormat = function (machine) {
  var result = ["digraph finite_state_machine {", "  rankdir=LR;"];
  var accStates = ["  node [shape = doublecircle];"];

  var i, j, k, trans;
  var automaton = machine;

  for (i = 0; i < automaton.accepting.length; i++) {
    accStates.push(automaton.accepting[i].toString());
  }

  accStates.push(";");
  if (accStates.length > 2) {
    result.push(accStates.join(" "));
  }
  result.push("  node [shape = circle];");
  result.push("  secret_node [style=invis, shape=point];");

  var initStateArrow = ["  secret_node ->"];
  initStateArrow.push(automaton.starting);
  initStateArrow.push("[style=bold];");
  result.push(initStateArrow.join(" "));

  var newTransitions = [];
  var transitions = Object.values(automaton.transitions);

  for (i = 0; i < transitions.length; i++) {
    for (j = 0; j < transitions[i].toStates.length; j++) {
      var found = null;

      for (k = 0; k < newTransitions.length; k++) {
        if (util.areEquivalent(newTransitions[k].fromState, transitions[i].fromState) &&
          util.areEquivalent(newTransitions[k].toStates, [transitions[i].toStates[j]])) {
          found = newTransitions[k];
        }
      }

      if (found === null) {
        var newTransition = util.clone(transitions[i]);
        newTransition.toStates = [newTransition.toStates[j]];
        newTransition.input = [newTransition.input];
        newTransitions.push(newTransition);
      } else {
        found.input.push(transitions[i].input);
      }
    }
  }

  for (i = 0; i < newTransitions.length; i++) {
    if (newTransitions[i].toStates[0] == automaton.starting) {
      trans = [" "];
      trans.push(newTransitions[i].toStates[0].toString());
      trans.push("->");
      trans.push(newTransitions[i].fromState.toString());
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].input.toString() + '"');
      trans.push(" dir = back];");
      result.push(trans.join(" "));
    } else {
      trans = [" "];
      trans.push(newTransitions[i].fromState.toString());
      trans.push("->");
      trans.push(newTransitions[i].toStates[0].toString());
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].input.toString() + '"');
      trans.push(" ];");
      result.push(trans.join(" "));
    }
  }

  result.push("}");

  return result.join("\n").replace(/\$/g, "$");
};

// determine reachable states
fsm.getReachableStates = function (fsm, state, shouldIncludeInitialState) {
  var unprocessedStates = [state],
    i, j;
  var reachableStates = shouldIncludeInitialState ? [state] : [];

  while (unprocessedStates.length !== 0) {
    var currentState = unprocessedStates.pop();

    for (i = 0; i < fsm.transitions.length; i++) {
      var transition = fsm.transitions[i];

      if (util.areEquivalent(currentState, transition.fromState)) {
        for (j = 0; j < transition.toStates.length; j++) {
          if (!(util.contains(reachableStates, transition.toStates[j]))) {
            reachableStates.push(transition.toStates[j]);

            if (!(util.contains(unprocessedStates, transition.toStates[j]))) {
              unprocessedStates.push(transition.toStates[j]);
            }
          }
        }
      }
    }
  }

  return reachableStates;
};

// determine and remove unreachable states
fsm.removeUnreachableStates = function (fsm) {
  var reachableStates = fsm.getReachableStates(fsm, fsm.initialState, true);
  var newFsm = util.clone(fsm),
    i;
  newFsm.states = [];
  newFsm.acceptingStates = [];
  newFsm.transitions = [];

  for (i = 0; i < fsm.states.length; i++) {
    if (util.contains(reachableStates, fsm.states[i])) {
      newFsm.states.push(util.clone(fsm.states[i]));
    }
  }

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    if (util.contains(reachableStates, fsm.acceptingStates[i])) {
      newFsm.acceptingStates.push(util.clone(fsm.acceptingStates[i]));
    }
  }

  for (i = 0; i < fsm.transitions.length; i++) {
    if (util.contains(reachableStates, fsm.transitions[i].fromState)) {
      newFsm.transitions.push(util.clone(fsm.transitions[i]));
    }
  }

  return newFsm;
};

// determines if two states from potentially different fsms are equivalent
fsm.areEquivalentStates = function (fsmA, stateA, fsmB, stateB) {
  if (fsm.determineType(fsmA) !== fsm.constans.determine ||
    fsm.determineType(fsmB) !== fsm.constans.determine) {
    throw new Error('FSMs must be DFAs');
  }

  if (fsmA.alphabet.length !== fsmB.alphabet.length ||
    !(util.containsAll(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error('FSM alphabets must be the same');
  }

  if (!(util.contains(fsmA.states, stateA)) ||
    !(util.contains(fsmB.states, stateB))) {
    throw new Error('FSMs must contain states');
  }

  function doBothStatesHaveSameAcceptance(fsmX, stateX, fsmY, stateY) {
    var stateXAccepting = util.contains(fsmX.acceptingStates, stateX);
    var stateYAccepting = util.contains(fsmY.acceptingStates, stateY);

    return (stateXAccepting && stateYAccepting) ||
      (!(stateXAccepting) && !(stateYAccepting));
  }

  var unprocessedPairs = [
    [stateA, stateB]
  ];
  var processedPairs = [],
    i, j;

  while (unprocessedPairs.length !== 0) {
    var currentPair = unprocessedPairs.pop();

    if (!(doBothStatesHaveSameAcceptance(fsmA, currentPair[0], fsmB, currentPair[1]))) {
      return false;
    }

    processedPairs.push(currentPair);

    for (j = 0; j < fsmA.alphabet.length; j++) {
      var pair = [fsm.forwardTransition(fsmA, [currentPair[0]], fsmA.alphabet[j])[0],
        fsm.forwardTransition(fsmB, [currentPair[1]], fsmA.alphabet[j])[0]
      ];

      if (!(util.contains(processedPairs, pair)) &&
        !(util.contains(unprocessedPairs, pair))) {
        unprocessedPairs.push(pair);
      }
    }
  }

  return true;
};

// determines if two fsms are equivalent by testing equivalence of starting states
fsm.areEquivalentFSMs = function (fsmA, fsmB) {
  return fsm.areEquivalentStates(fsmA, fsmA.initialState, fsmB, fsmB.initialState);
};

// finds and removes equivalent states
fsm.removeEquivalentStates = function (fsm) {
  if (fsm.determineType(fsm) !== fsm.constans.determine) {
    throw new Error('FSM must be DFA');
  }

  var equivalentPairs = [],
    i, j, k;

  for (i = 0; i < fsm.states.length; i++) {
    for (j = i + 1; j < fsm.states.length; j++) {
      if (fsm.areEquivalentStates(fsm, fsm.states[i], fsm, fsm.states[j])) {
        var pair = [fsm.states[i], fsm.states[j]];

        for (k = 0; k < equivalentPairs.length; k++) {
          if (util.areEquivalent(equivalentPairs[k][1], pair[0])) {
            pair[0] = equivalentPairs[k][1];
            break;
          }
        }

        if (!(util.contains(equivalentPairs, pair))) {
          equivalentPairs.push(pair);
        }
      }
    }
  }

  var newFsm = {
    states: [],
    alphabet: util.clone(fsm.alphabet),
    initialState: [],
    acceptingStates: [],
    transitions: []
  };

  function isOneOfEquivalentStates(s) {
    for (var i = 0; i < equivalentPairs.length; i++) {
      if (util.areEquivalent(equivalentPairs[i][1], s)) {
        return true;
      }
    }

    return false;
  }

  function getEquivalentState(s) {
    for (var i = 0; i < equivalentPairs.length; i++) {
      if (util.areEquivalent(equivalentPairs[i][1], s)) {
        return equivalentPairs[i][0];
      }
    }

    return s;
  }

  for (i = 0; i < fsm.states.length; i++) {
    if (!(isOneOfEquivalentStates(fsm.states[i]))) {
      newFsm.states.push(util.clone(fsm.states[i]));
    }
  }

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    if (!(isOneOfEquivalentStates(fsm.acceptingStates[i]))) {
      newFsm.acceptingStates.push(util.clone(fsm.acceptingStates[i]));
    }
  }

  newFsm.initialState = util.clone(getEquivalentState(fsm.initialState));

  for (i = 0; i < fsm.transitions.length; i++) {
    var transition = util.clone(fsm.transitions[i]);

    if (isOneOfEquivalentStates(transition.fromState)) {
      continue;
    }

    for (j = 0; j < transition.toStates.length; j++) {
      transition.toStates[j] = getEquivalentState(transition.toStates[j]);
    }

    newFsm.transitions.push(transition);
  }

  return newFsm;
};

// minimizes the fsm by removing unreachable and equivalent states
fsm.minimize = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constans.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constans.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  var fsmWithoutUnreachableStates = fsm.removeUnreachableStates(newFsm);
  var minimalFsm = fsm.removeEquivalentStates(fsmWithoutUnreachableStates);
  return minimalFsm;
};

fsm.convertStatesToNumbers = function (fsm) {
  var newFsm = fsm.makeNew();
  var mapping = {};

  for (i = 0; i < fsm.states.length; i++) {
    mapping[fsm.states[i].toString()] = i;
  }

  newFsm.alphabet = util.clone(fsm.alphabet);

  for (i = 0; i < fsm.states.length; i++) {
    fsm.addState(newFsm, mapping[fsm.states[i].toString()]);
  }

  fsm.setStartingState(newFsm, mapping[fsm.initialState.toString()]);

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    fsm.addAcceptingState(newFsm, mapping[fsm.acceptingStates[i].toString()]);
  }

  for (i = 0; i < fsm.transitions.length; i++) {
    var newToStates = [];

    for (j = 0; j < fsm.transitions[i].toStates.length; j++) {
      newToStates.push(mapping[fsm.transitions[i].toStates[j].toString()]);
    }

    fsm.addTransition(newFsm,
      mapping[fsm.transitions[i].fromState.toString()],
      newToStates,
      fsm.transitions[i].symbol);
  }

  return newFsm;
};

// generate random fsm
fsm.createRandomFsm = function (fsmType, numStates, numAlphabet, maxNumToStates) {
  var newFsm = {},
    i, j, k;

  function prefix(ch, num, str) {
    var retStr = str;

    for (var i = 0; i < str.length - num; i++) {
      retStr = ch + str;
    }

    return retStr;
  }

  newFsm.states = [];
  for (i = 0, len = numStates.toString().length; i < numStates; i++) {
    newFsm.states.push("s" + prefix("0", len, i.toString()));
  }

  newFsm.alphabet = [];

  if (numAlphabet > 26) {
    for (i = 0, len = numAlphabet.toString().length; i < numAlphabet; i++) {
      newFsm.alphabet.push("a" + prefix("0", len, i.toString()));
    }
  } else {
    newFsm.alphabet = "abcdefghijklmnopqrstuvwxyz".substr(0, numAlphabet).split("");
  }

  newFsm.initialState = newFsm.states[0];

  newFsm.acceptingStates = [];
  for (i = 0; i < numStates; i++) {
    if (Math.round(Math.random())) {
      newFsm.acceptingStates.push(newFsm.states[i]);
    }
  }

  if (fsmType === fsm.constants.e_non_determine) {
    newFsm.alphabet.push(fsm.constants.epsilon);
  }

  newFsm.transitions = [];
  for (i = 0; i < numStates; i++) {
    for (j = 0; j < newFsm.alphabet.length; j++) {
      var numToStates = 1;

      if (fsmType !== fsm.constants.determine) {
        numToStates = Math.floor(Math.random() * maxNumToStates);
      }

      if (numToStates > 0) {
        var toStates = [];
        for (k = 0; k < newFsm.states.length && toStates.length < numToStates; k++) {
          var diff = (newFsm.states.length - k) - (numToStates - toStates.length) + 1;

          if (diff <= 0) {
            diff = 1;
          } else {
            diff = 1 / diff;
          }

          if (Math.random() <= diff) {
            toStates.push(newFsm.states[k]);
          }
        }

        newFsm.transitions.push({
          fromState: newFsm.states[i],
          symbol: newFsm.alphabet[j],
          toStates: toStates
        });
      }
    }
  }

  if (fsmType === fsm.constants.e_non_determine) {
    newFsm.alphabet.pop();
  }

  return newFsm;
};

fsm.convertNfaToDfa = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  if (fsmType === fsm.constans.e_non_determine) {
    throw new Error('FSM must be an NFA');
  }

  if (fsmType === fsm.constans.determine) {
    return fsm;
  }

  var newFsm = {},
    i, j, k, transition;

  newFsm.alphabet = util.clone(fsm.alphabet);
  newFsm.states = [];
  newFsm.acceptingStates = [];
  newFsm.initialState = [util.clone(fsm.initialState)];
  newFsm.transitions = [];

  for (i = 0; i < fsm.states.length; i++) {
    newFsm.states.push([util.clone(fsm.states[i])]);
  }

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    newFsm.acceptingStates.push([util.clone(fsm.acceptingStates[i])]);
  }

  var newStates = [];
  var multiStates = [];

  for (i = 0; i < fsm.transitions.length; i++) {
    transition = util.clone(fsm.transitions[i]);
    transition.fromState = [transition.fromState];

    transition.toStates = [transition.toStates];

    if (transition.toStates[0].length > 1) {
      if (!(util.containsSet(newStates, transition.toStates[0]))) {
        newStates.push(transition.toStates[0]);
      }
    }

    newFsm.transitions.push(transition);
  }

  while (newStates.length !== 0) {
    var state = newStates.pop();

    newFsm.states.push(state);

    if (util.containsAny(fsm.acceptingStates, state)) {
      newFsm.acceptingStates.push(state);
    }

    for (i = 0; i < newFsm.alphabet.length; i++) {
      var ts = fsm.makeTransition(fsm, state, newFsm.alphabet[i]).sort();

      for (j = 0; j < newFsm.states.length; j++) {
        if (util.areEqualSets(ts, newFsm.states[j])) {
          ts = newFsm.states[j];
          break;
        }
      }

      for (j = 0; j < newStates.length; j++) {
        if (util.areEqualSets(ts, newStates[j])) {
          ts = newStates[j];
          break;
        }
      }

      if (ts.length > 0) {
        newFsm.transitions.push({
          fromState: state,
          symbol: newFsm.alphabet[i],
          toStates: [ts]
        });
      }

      if (!(util.containsSet(newFsm.states, ts)) && !(util.containsSet(newStates, ts)) && ts.length > 1) {
        newStates.push(ts);
      }
    }
  }

  var errorAdded = false;
  var errorState = "ERROR";

  for (i = 0; i < newFsm.states.length; i++) {
    for (j = 0; j < newFsm.alphabet.length; j++) {
      var found = false;
      for (k = 0; k < newFsm.transitions.length; k++) {
        transition = newFsm.transitions[k];

        if (util.areEquivalent(transition.symbol, newFsm.alphabet[j]) &&
          util.areEquivalent(transition.fromState, newFsm.states[i])) {
          found = true;
          break;
        }
      }

      if (found === false) {
        if (errorAdded === false) {
          newFsm.states.push([errorState]);
          errorAdded = true;
        }

        newFsm.transitions.push({
          fromState: newFsm.states[i],
          symbol: newFsm.alphabet[j],
          toStates: [
            [errorState]
          ]
        });
      }
    }
  }

  return newFsm;
};

fsm.convertEnfaToNfa = function (fsm) {
  if (fsm.determineType(fsm) !== fsm.constans.e_non_determine) {
    return fsm; // this is already an NFA (or a DFA which is also an NFA)
  }

  var newFsm = util.clone(fsm),
    i, j;

  var initialEpsilon = fsm.computeEpsilonClosure(fsm, [fsm.initialState]);

  if (util.containsAny(newFsm.acceptingStates, initialEpsilon) &&
    !(util.contains(newFsm.acceptingStates, newFsm.initialState))) {
    newFsm.acceptingStates.push(newFsm.initialState);
  }

  var newTransitions = [];

  for (i = 0; i < newFsm.states.length; i++) {
    for (j = 0; j < newFsm.alphabet.length; j++) {
      var toStates = fsm.makeTransition(newFsm, [newFsm.states[i]], newFsm.alphabet[j]).sort();

      if (toStates.length > 0) {
        newTransitions.push({
          fromState: newFsm.states[i],
          toStates: toStates,
          symbol: newFsm.alphabet[j]
        });
      }
    }
  }

  newFsm.transitions = newTransitions;

  var multiStateTransitions = [];

  for (i = 0; i < newFsm.transitions.length; i++) {
    var transition = newFsm.transitions[i];

    if (transition.toStates.length > 1) {
      var existing = false;

      for (j = 0; j < multiStateTransitions.length; j++) {
        if (util.areEqualSets(transition.toStates, multiStateTransitions[j])) {
          transition.toStates = multiStateTransitions[j];
          existing = true;
          break;
        }
      }

      if (existing === false) {
        multiStateTransitions.push(transition.toStates);
      }
    }
  }

  return newFsm;
};

// test whether if the language accepted by the fsm contains at least one string
fsm.isLanguageNonEmpty = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constans.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constans.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  return newFsm.acceptingStates.length > 0;
};

fsm.isLanguageInfinite = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constans.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constans.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  var deadState = null,
    i, reachable;

  for (i = 0; i < newFsm.states.length; i++) {
    if (util.contains(newFsm.acceptingStates, newFsm.states[i])) {
      continue;
    }

    reachable = fsm.getReachableStates(newFsm, newFsm.states[i], true);

    if (util.containsAny(newFsm.acceptingStates, reachable)) {
      continue;
    }

    deadState = newFsm.states[i];
    break;
  }

  if (deadState === null) {
    return true;
  }

  for (i = 0; i < newFsm.states.length; i++) {
    if (util.areEquivalent(deadState, newFsm.states[i])) {
      continue;
    }

    reachable = fsm.getReachableStates(newFsm, newFsm.states[i], false);

    if (util.contains(reachable, newFsm.states[i])) {
      return true;
    }
  }

  return false;
};

// generate a random string which the fsm accepts
fsm.randomStringInLanguage = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constans.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constans.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  if (newFsm.acceptingStates.length === 0) {
    return null;
  }

  var currentState = newFsm.acceptingStates[Math.floor(Math.random() * newFsm.acceptingStates.length)];
  var trail = [];

  while (true) {
    if (util.areEquivalent(currentState, newFsm.initialState) === true) {
      if (Math.round(Math.random())) {
        break;
      }
    }

    var transitions = [],
      i;

    for (i = 0; i < newFsm.transitions.length; i++) {
      if (util.areEquivalent(newFsm.transitions[i].toStates[0], currentState)) {
        transitions.push(newFsm.transitions[i]);
      }
    }

    if (transitions.length === 0) {
      break;
    }

    var transition = transitions[Math.floor(Math.random() * transitions.length)];

    trail.push(transition.symbol);
    currentState = transition.fromState;
  }

  trail.reverse();

  return trail;
};

// generate a random string which the fsm doest accept
fsm.randomStringNotInLanguage = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constans.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constans.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  var nonAcceptingStates = [],
    i;

  for (i = 0; i < newFsm.states.length; i++) {
    if (!(util.contains(newFsm.acceptingStates, newFsm.states[i]))) {
      nonAcceptingStates.push(newFsm.states[i]);
    }
  }

  if (nonAcceptingStates.length === 0) {
    return null;
  }

  var currentState = nonAcceptingStates[Math.floor(Math.random() * nonAcceptingStates.length)];
  var trail = [];

  while (true) {
    if (util.areEquivalent(currentState, newFsm.initialState) === true) {
      if (Math.round(Math.random())) {
        break;
      }
    }

    var transitions = [];

    for (i = 0; i < newFsm.transitions.length; i++) {
      if (util.areEquivalent(newFsm.transitions[i].toStates[0], currentState)) {
        transitions.push(newFsm.transitions[i]);
      }
    }

    if (transitions.length === 0) {
      break;
    }

    var transition = transitions[Math.floor(Math.random() * transitions.length)];

    trail.push(transition.symbol);
    currentState = transition.fromState;
  }

  trail.reverse();

  return trail;
};

// get a new fsm which accepts the language L=L1+L2 (set union) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
fsm.union = function (fsmA, fsmB) {
  if (!(util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  var newFsm = {
    alphabet: util.clone(fsmA.alphabet),
    states: [],
    initialState: [util.clone(fsmA.initialState), util.clone(fsmB.initialState)],
    acceptingStates: [],
    transitions: []
  };

  var i, j, k;

  for (i = 0; i < fsmA.states.length; i++) {
    for (j = 0; j < fsmB.states.length; j++) {
      var newState = [util.clone(fsmA.states[i]), util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (util.contains(fsmA.acceptingStates, fsmA.states[i]) ||
        util.contains(fsmB.acceptingStates, fsmB.states[j])) {
        newFsm.acceptingStates.push(newState);
      }

      for (k = 0; k < newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState: newState,
          symbol: newFsm.alphabet[k],
          toStates: [
            [fsm.forwardTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
              fsm.forwardTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]
            ]
          ]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the language L=L1/L2 (set intersection) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
fsm.intersection = function (fsmA, fsmB) {
  var new_alphabet = util.clone(util.setIntersection(fsmA.alphabet, fsmB.alphabet));

  var newFsm = {
    alphabet: new_alphabet,
    states: [],
    initialState: [util.clone(fsmA.initialState), util.clone(fsmB.initialState)],
    acceptingStates: [],
    transitions: []
  };

  var i, j, k;

  for (i = 0; i < fsmA.states.length; i++) {
    for (j = 0; j < fsmB.states.length; j++) {
      var newState = [util.clone(fsmA.states[i]), util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (util.contains(fsmA.acceptingStates, fsmA.states[i]) &&
        util.contains(fsmB.acceptingStates, fsmB.states[j])) {
        newFsm.acceptingStates.push(newState);
      }

      for (k = 0; k < newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState: newState,
          symbol: newFsm.alphabet[k],
          toStates: [
            [fsm.forwardTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
              fsm.forwardTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]
            ]
          ]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the language L=L1-L2 (set difference) where
// L1 is the language accepted by fsma and
// L2 is the language accepted by fsmB
fsm.difference = function (fsmA, fsmB) {
  if (!(util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  var newFsm = {
    alphabet: util.clone(fsmA.alphabet),
    states: [],
    initialState: [util.clone(fsmA.initialState), util.clone(fsmB.initialState)],
    acceptingStates: [],
    transitions: []
  };

  var i, j, k;

  for (i = 0; i < fsmA.states.length; i++) {
    for (j = 0; j < fsmB.states.length; j++) {
      var newState = [util.clone(fsmA.states[i]), util.clone(fsmB.states[j])];
      newFsm.states.push(newState);

      if (util.contains(fsmA.acceptingStates, fsmA.states[i]) &&
        !(util.contains(fsmB.acceptingStates, fsmB.states[j]))) {
        newFsm.acceptingStates.push(newState);
      }

      for (k = 0; k < newFsm.alphabet.length; k++) {
        newFsm.transitions.push({
          fromState: newState,
          symbol: newFsm.alphabet[k],
          toStates: [
            [fsm.forwardTransition(fsmA, [fsmA.states[i]], newFsm.alphabet[k])[0],
              fsm.forwardTransition(fsmB, [fsmB.states[j]], newFsm.alphabet[k])[0]
            ]
          ]
        });
      }
    }
  }

  return newFsm;
};

// get a new fsm which accepts the complement language of the
// langauge accepted by the input fsm
fsm.complement = function (fsm) {
  var newFsm = util.clone(fsm);

  var newAccepting = [],
    i;

  for (i = 0; i < newFsm.states.length; i++) {
    if (!(util.contains(newFsm.acceptingStates, newFsm.states[i]))) {
      newAccepting.push(newFsm.states[i]);
    }
  }

  newFsm.acceptingStates = newAccepting;

  return newFsm;
};

// get a new fsm which accepts the language L1L2 where
// L1 is the language accepted by fsmA and L2 is the
// langauge accepted by fsmB
fsm.concatenation = function (fsmA, fsmB) {
  if (!(util.areEquivalent(fsmA.alphabet, fsmB.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  if (util.containsAny(fsmA.states, fsmB.states)) {
    throw new Error("States must not overlap");
  }

  var newFsm = {
    alphabet: util.clone(fsmA.alphabet),
    states: util.clone(fsmA.states).concat(util.clone(fsmB.states)),
    initialState: util.clone(fsmA.initialState),
    acceptingStates: util.clone(fsmB.acceptingStates),
    transitions: util.clone(fsmA.transitions).concat(util.clone(fsmB.transitions))
  };

  for (var i = 0; i < fsmA.acceptingStates.length; i++) {
    newFsm.transitions.push({
      fromState: util.clone(fsmA.acceptingStates[i]),
      toStates: [util.clone(fsmB.initialState)],
      symbol: fsm.constants.epsilon
    });
  }

  return newFsm;
};

// get a new fsm which accepts the language L*, where L is
// accepted by the input fsm and * is the kleene operator
fsm.kleene = function (fsm) {
  var newFsm = util.clone(fsm);

  var newInitial = "NEW_INITIAL";

  newFsm.states.push(newInitial);
  newFsm.transitions.push({
    fromState: newInitial,
    toStates: [newFsm.initialState],
    symbol: fsm.constants.epsilon
  });
  newFsm.initialState = newInitial;

  for (var i = 0; i < newFsm.acceptingStates.length; i++) {
    newFsm.transitions.push({
      fromState: newFsm.acceptingStates[i],
      toStates: [newInitial],
      symbol: fsm.constants.epsilon
    });
  }

  return newFsm;
};

// get a new fsm which accepts the reverse language of the input fsm
fsm.reverse = function (fsm) {
  var newFsm = util.clone(fsm);

  var newTransitions = [];

  for (var i = 0; i < newFsm.transitions.length; i++) {
    for (var j = 0; j < newFsm.transitions[i].toStates.length; j++) {
      newTransitions.push({
        fromState: newFsm.transitions[i].toStates[j],
        toStates: [newFsm.transitions[i].fromState],
        symbol: newFsm.transitions[i].symbol
      });
    }
  }

  newFsm.transitions = newTransitions;

  var oldAcceptingStates = newFsm.acceptingStates;

  newFsm.acceptingStates = [newFsm.initialState];

  var newInitialState = "NEW_INITIAL";
  newFsm.states.push(newInitialState);
  newFsm.initialState = newInitialState;

  newFsm.transitions.push({
    fromState: newInitialState,
    toStates: oldAcceptingStates,
    symbol: fsm.constants.epsilon
  });

  return newFsm;
};

// check whether the language accepted by fsmB is a subset of
// the language accepted by fsmA
fsm.isSubset = function (fsmA, fsmB) {
  var fsmIntersection = fsm.intersection(fsmA, fsmB);

  return fsm.areEquivalentFSMs(fsmB, fsmIntersection);
};

// convert the fsm into a regular grammar
fsm.grammar = function (fsm) {
  var grammar = {
    nonterminals: util.clone(fsm.states),
    terminals: util.clone(fsm.alphabet),
    initialNonterminal: util.clone(fsm.initialState),
    productions: []
  };

  var i;

  for (i = 0; i < fsm.transitions.length; i++) {
    if (fsm.transitions[i].symbol === fsm.constants.epsilon) {
      grammar.productions.push({
        left: [util.clone(fsm.transitions[i].fromState)],
        right: util.clone(fsm.transitions[i].toStates)
      });
    } else {
      grammar.productions.push({
        left: [util.clone(fsm.transitions[i].fromState)],
        right: [util.clone(fsm.transitions[i].symbol)].concat(
          util.clone(fsm.transitions[i].toStates))
      });
    }
  }

  for (i = 0; i < fsm.acceptingStates.length; i++) {
    grammar.productions.push({
      left: [util.clone(fsm.acceptingStates[i])],
      right: [grammar.constants.epsilon]
    });
  }

  return grammar;
};

fsm.symbolsForTransitions = function (automaton, stateA, stateB) {
  var res = [];

  for (var i = 0; i < automaton.transitions.length; i++) {
    var transition = automaton.transitions[i];

    if (util.areEquivalent(transition.fromState, stateA) &&
      util.contains(transition.toStates, stateB)) {
      res.push(transition.symbol);
    }
  }

  return res;
};

let regex = require("./regex").data;

fsm.toRegex = function (automaton) {
  var r = [];
  var n = automaton.states.length;

  var i, j, k, z;

  for (k = 0; k < n + 1; k++) {
    r[k] = [];
    for (i = 0; i < n; i++) {
      r[k][i] = [];
    }
  }

  for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
      var symbols = fsm.symbolsForTransitions(automaton, automaton.states[i], automaton.states[j]);

      for (z = 0; z < symbols.length; z++) {
        symbols[z] = regex.tree.makeLiteral(symbols[z]);
      }

      if (i === j) {
        symbols.push(regex.tree.makeEpsilon());
      }

      r[0][i][j] = regex.tree.makeUnion(symbols);
    }
  }

  for (k = 1; k < n + 1; k++) {
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        var t1 = ((typeof r[k - 1][i][k - 1].choices !== "undefined" && r[k - 1][i][k - 1].choices.length === 0) ||
          (typeof r[k - 1][k - 1][j].choices !== "undefined" && r[k - 1][k - 1][j].choices.length === 0) ||
          (typeof r[k - 1][k - 1][k - 1].choices !== "undefined" && r[k - 1][k - 1][k - 1].choices.length === 0));
        var t2 = (typeof r[k - 1][i][j].choices !== "undefined" && r[k - 1][i][j].choices.length === 0);

        var seq = null;

        if (r[k - 1][k - 1][k - 1].tag === regex.tree.constants.EPS) {
          seq = regex.tree.makeSequence([r[k - 1][i][k - 1], r[k - 1][k - 1][j]]);
        } else {
          seq = regex.tree.makeSequence([r[k - 1][i][k - 1], regex.tree.makeKleenStar(r[k - 1][k - 1][k - 1]), r[k - 1][k - 1][j]]);
        }

        var alt = [];

        if (!t2) {
          alt.push(r[k - 1][i][j]);
        }

        if (!t1) {
          alt.push(seq);
        }

        alt = regex.tree.makeUnion(alt);

        r[k][i][j] = alt;
      }
    }
  }

  var startStateIndex = -1;
  var acceptableStatesIndexes = [];

  for (i = 0; i < automaton.states.length; i++) {
    if (util.areEquivalent(automaton.states[i], automaton.initialState)) {
      startStateIndex = i;
    }

    if (util.contains(automaton.acceptingStates, automaton.states[i])) {
      acceptableStatesIndexes.push(i);
    }
  }

  var elements = [];

  for (i = 0; i < acceptableStatesIndexes.length; i++) {
    elements.push(r[n][startStateIndex][acceptableStatesIndexes[i]]);
  }

  return regex.tree.makeUnion(elements);
};

exports.data = fsm;