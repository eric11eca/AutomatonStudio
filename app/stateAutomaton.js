let fsm = {};
let util = require("./util.js").data;

fsm.constants = {
  epsilon: '$',
  determine: 'DFA',
  non_determine: 'NFA',
  e_non_determine: 'ENFA',
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
    throw new Error("Can't add the epsilon input to the alphabet");
  }
  return fsm._addStateOrAlphabet(automaton.alphabet, char,
    "No input object specified", "input already exists");
};

fsm.addAcceptingState = function (automaton, state) {
  //console.log("AcceptingState: ", [state]);

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
  //console.log("FromState: ", fromState);
  //console.log("ToStates: ", toStates);

  if (!util.contains(automaton.states, fromState) ||
    !util.containsAll(automaton.states, toStates)) {
    throw new Error("One of the specified objects is not a state of the FSM");
  }

  var transKey = fromState + ',' + input;

  if (transKey in automaton.transitions) {
    automaton.transitions[transKey].toStates = util.setUnion(
      automaton.transitions[transKey].toStates, toStates);
  } else {
    automaton.transitions[transKey] = {
      toStates: toStates,
      fromState: fromState,
      input: input
    };
  }
};

fsm.addTransition = function (automaton, fromState, toStates, transitioninput) {
  if (!util.contains(automaton.alphabet, transitioninput)) {
    throw new Error("The specified object is not an alphabet input of the FSM");
  }
  fsm._addTransition(automaton, fromState, toStates, transitioninput);
};

fsm.addEpsilonTransition = function (automaton, fromState, toStates) {
  fsm._addTransition(automaton, fromState, toStates, fsm.constants.epsilon);
};

fsm.loadContents = function (automaton, states, alphabet, start, accepting, transitions) {
  for (var i = states.length - 1; i >= 0; i--) {
    fsm.addState(automaton, states[i]);
  }

  for (i = alphabet.length - 1; i >= 0; i--) {
    fsm.addAlphabet(automaton, alphabet[i]);
  }

  for (i = 0; i < accepting.length; i++) {
    if (accepting[i]) {
      fsm.addAcceptingState(automaton, accepting[i]);
    }
  }

  fsm.setStartingState(automaton, start);

  //console.log("States: ", automaton.states);

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
    throw new Error('Error: Equivalent accepting');
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
      throw new Error('Transitions must have fromState, toState and input');
    }

    if (!(util.contains(automaton.states, transition.fromState))) {
      throw new Error('Transition fromState must be in states.');
    }

    if (!(util.contains(automaton.alphabet, transition.input)) &&
      transition.input != fsm.constants.epsilon) {
      throw new Error('Transition input must be in alphabet.');
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
        throw new Error('Transitions for the same fromState and input must be defined in a single trainsition.');
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
    var state = state_rest[0].split(';');
    var parts = state_rest[1].split('->');
    var alphabet = parts[0];
    var toStates = parts[1].split(';');
    transfunc.push([state, alphabet, toStates]);
  });

  for (var k in parseCounts) {
    if (!parseCounts[k]) {
      throw new Error('Fromal definition missing' + parseCounts[k]);
    }
  }

  //console.log("Transition Function: ", transfunc);

  var automaton = fsm.createFSM();
  fsm.loadContents(automaton, states, alphabet, start, accepting, transfunc);
  fsm.validate(automaton);
  //console.log("Complete Automaton: ", automaton);
  return automaton;
};


/**********Simulation Functions for Finite State Automaton *************/

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
            unprocessedStates.push(state);
          }
        });
      }
    });
  }
  return newStates;
};

fsm.forwardinputTransition = function (automaton, currentStates, input) {
  var newStates = [];

  Object.keys(automaton.transitions).forEach(key => {
    let transition = automaton.transitions[key];

    if (util.areEquivalent(transition.input, input) &&
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
  newStates = fsm.forwardinputTransition(automaton, newStates, input);
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

// read a stream of input inputs starting from state and make a list of
// states that were on the transition path
fsm.readString = function (automaton, state, inputString) {
  if (!(util.containsAll(fsm.alphabet, inputinputStream))) {
    throw new Error('FSM must contain all inputs for which the transition is being computed');
  }
  var currentStates = [state];
  var trail = [util.clone(currentStates)];

  inputString.forEach(char => {
    currentStates = fsm.forwardTransition(automaton, currentStates, char);
    trail.push(util.clone(currentStates));
  });

  return {
    currentState: currentStates,
    trail: trail
  };
};

// test if a stream of input inputs leads a fsm to an accepting state
fsm.isStringInLanguage = function (automaton, inputString) {
  var finalStates = fsm.readString(automaton, automaton.starting, inputString);
  return util.containsAny(automaton.accepting, finalStates);
};


/**********Fomrating Functions for Finite State Automaton *************/

fsm.serializeFsmToString = function (autoamton) {
  var lines = [];
  lines.push("#states");
  for (var i = 0; i < autoamton.states.length; i++) {
    lines.push(autoamton.states[i].toString());
  }
  lines.push("#starting");
  lines.push(autoamton.starting.toString());
  lines.push("#accepting");
  for (i = 0; i < autoamton.accepting.length; i++) {
    lines.push(autoamton.accepting[i].toString());
  }
  lines.push("#alphabet");
  for (i = 0; i < autoamton.alphabet.length; i++) {
    lines.push(autoamton.alphabet[i].toString());
  }
  lines.push("#transitions");
  for (const key in autoamton.transitions) {
    lines.push(autoamton.transitions[key].fromState.toString() + ":" +
      autoamton.transitions[key].input.toString() + "->" +
      autoamton.transitions[key].toStates.join(";"));
  }
  return lines.join("\n");
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

  //console.log(newTransitions);

  for (i = 0; i < newTransitions.length; i++) {
    if (newTransitions[i].toStates[0] == automaton.starting) {
      trans = [" "];
      trans.push(newTransitions[i].toStates[0].toString().replace(/,/g, ''));
      trans.push("->");
      trans.push(newTransitions[i].fromState.toString().replace(/,/g, ''));
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].input.toString() + '"');
      trans.push(" dir = back];");
      result.push(trans.join(" "));
    } else {
      trans = [" "];
      trans.push(newTransitions[i].fromState.toString().replace(/,/g, ''));
      trans.push("->");
      trans.push(newTransitions[i].toStates[0].toString().replace(/,/g, ''));
      trans.push("[");
      trans.push("label =");
      trans.push('"' + newTransitions[i].input.toString() + '"');
      trans.push(" ];");
      result.push(trans.join(" "));
    }
  }

  result.push("}");

  //console.log(result);

  return result.join("\n").replace(/\$/g, "$");

};


/**********Type Converting Functions for Finite State Automaton *************/

fsm.determineType = function (automaton) {
  var fsmType = fsm.constants.determine;
  for (const key in automaton.transitions) {
    var transition = automaton.transitions[key];

    if (transition.input === fsm.constants.epsilon) {
      fsmType = fsm.constants.e_non_determine;
      break;
    } else if (transition.toStates.length === 0 ||
      transition.toStates.length > 1) {
      fsmType = fsm.constants.non_determine;
    }
  }

  if (fsmType == fsm.constants.determine) {
    if (Object.keys(automaton.transitions).length < automaton.states.length * automaton.alphabet.length) {
      fsmType = fsm.constants.non_determine;
    }
  }
  return fsmType;
};

fsm.convertEnfaToNfa = function (automaton) {
  if (fsm.determineType(automaton) !== fsm.constants.e_non_determine) {
    return automaton;
  }

  var newFsm = util.clone(automaton);
  var epsilonStates = fsm.forwardEpsilonTransition(automaton, [automaton.starting]);
  if (util.containsAny(newFsm.accepting, epsilonStates) &&
    !(util.contains(newFsm.accepting, newFsm.starting))) {
    newFsm.accepting.push(newFsm.starting);
  }

  var newTransitions = {};
  newFsm.states.forEach(state => {
    newFsm.alphabet.forEach(char => {
      var toStates = fsm.forwardTransition(newFsm, [state], char).sort();
      toStates = [...new Set(toStates)];
      if (toStates.length > 0) {
        var transKey = state + ',' + char;
        newTransitions[transKey] = {};
        newTransitions[transKey].fromState = state;
        newTransitions[transKey].input = char;
        newTransitions[transKey].toStates = toStates;
      }
    });
  });
  newFsm.transitions = newTransitions;

  var nonDeterminTransitions = [];
  for (const key in automaton.transitions) {
    var transition = automaton.transitions[key];
    if (transition.toStates.length > 1) {
      var existing = false;
      for (var i = 0; i < nonDeterminTransitions.length; i++) {
        if (util.areEqualSets(transition.toStates, nonDeterminTransitions[i])) {
          transition.toStates = nonDeterminTransitions[i];
          existing = true;
          break;
        }
      }
      if (!existing) {
        nonDeterminTransitions.push(transition.toStates);
      }
    }
  }
  return newFsm;
};

fsm.convertNfaToDfa = function (automaton) {
  var fsmType = fsm.determineType(automaton);
  if (fsmType === fsm.constants.e_non_determine) {
    throw new Error('FSM must be nondeterministic one');
  } else if (fsmType === fsm.constants.determine) {
    return automaton;
  }

  var newFsm = {
    states: [],
    alphabet: util.clone(automaton.alphabet),
    starting: [util.clone(automaton.starting)],
    accepting: [],
    transitions: {}
  };

  automaton.states.forEach(s => {
    newFsm.states.push([util.clone(s)]);
  });

  automaton.accepting.forEach(a => {
    newFsm.accepting.push([util.clone(a)]);
  });

  var activeStates = [];

  for (const key in automaton.transitions) {
    var transition = util.clone(automaton.transitions[key]);
    transition.fromState = [transition.fromState];
    transition.toStates = [transition.toStates];
    if (transition.toStates[0].length > 1) {
      if (!(util.containsSet(activeStates, transition.toStates[0]))) {
        activeStates.push(transition.toStates[0]);
      }
    }
    var transKey = transition.fromState + ',' + transition.input;
    newFsm.transitions[transKey] = transition;
  }

  while (activeStates.length > 0) {
    var state = activeStates.pop();
    newFsm.states.push(state);
    if (util.containsAny(automaton.accepting, state)) {
      newFsm.accepting.push(state);
    }

    newFsm.alphabet.forEach(char => {
      var nextStates = fsm.forwardTransition(automaton, state, char);
      for (const arr in [newFsm.states, activeStates]) {
        var equalSet = util.returnEqualSet(arr, nextStates);
        if (equalSet.length > 0) {
          nextStates = equalSet;
        }
      }

      if (nextStates.length > 0) {
        var k = state + ',' + char;
        newFsm.transitions[k] = {
          fromState: state,
          input: char,
          toStates: nextStates
        };
      }

      if (!(util.containsSet(newFsm.states, nextStates)) &&
        !(util.containsSet(activeStates, nextStates)) && nextStates.length > 1) {
        activeStates.push(nextStates);
      }
    });
  }
  return newFsm;
};


/********** States Operational Functions for Finite State Automaton *************/

fsm.getReachableStates = function (automaton) {
  var states = [automaton.starting];
  var reachableStates = new Set([automaton.starting]);
  while (states.length != 0) {
    var currState = states.pop();
    Object.values(automaton.transitions).forEach(transition => {
      if (util.areEquivalent(currState, transition.fromState)) {
        var toStatesSet = new Set(transition.toStates);
        var stateSet = new Set(states);
        reachableStates = reachableStates.union(toStatesSet);
        states.concat(toStatesSet.difference(stateSet).from());
      }
    });
  }
  return reachableStates;
};

// determine and remove unreachable states
fsm.removeUnreachableStates = function (automaton) {
  var reachableStates = fsm.getReachableStates(automaton);
  var reachableStatesSet = new Set(reachableStates);
  var newFsm = util.clone(automaton);

  var oldStates = new Set(automaton.states);
  var oldAccepting = new Set(automaton.accepting);

  newFsm.states = oldStates.intersection(reachableStatesSet).from();
  newFsm.accepting = oldAccepting.intersection(reachableStates).from();
  newFsm.transitions = {};

  Object.keys(automaton.transitions).forEach(key => {
    var transition = automaton.transitions[key];
    if (util.contains(reachableStates, transition.fromState)) {
      newFsm.transitions[key] = util.clone(transition);
    }
  });

  return newFsm;
};

// determines if two states from potentially different fsms are equivalent
fsm.areEquivalentStates = function (fsmA, stateA, fsmB, stateB) {
  if (fsm.determineType(fsmA) !== fsm.constants.determine ||
    fsm.determineType(fsmB) !== fsm.constants.determine) {
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
    var stateXAccepting = util.contains(fsmX.accepting, stateX);
    var stateYAccepting = util.contains(fsmY.accepting, stateY);

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
fsm.areEquivalentFSMs = function (fsm1, fsm2) {
  return fsm.areEquivalentStates(fsm1, fsm1.starting, fsm2, fsm2.starting);
};

// finds and removes equivalent states
fsm.removeEquivalentStates = function (automaton) {
  if (fsm.determineType(automaton) !== fsm.constants.determine) {
    throw new Error('FSM must be DFA');
  }

  var stateSet = new Set(util.clone(automaton.states));
  var accetSet = new Set(util.clone(automaton.accepting));

  var equivalentPairs = [accetSet, util.Difference(stateSet, accetSet)];

  var i, j = 0;

  while (true) {
    var newEquivalentPairs = [];
    equivalentPairs.forEach(eqClass => {
      var eqClassMap = new Map();
      eqClass.forEach(state => {
        //console.log("State: ", state);
        var classKey = "";
        automaton.alphabet.forEach(alpha => {
          var key = state + ',' + alpha;
          var toStateSet = new Set(automaton.transitions[key].toStates);
          for (i = 0; i < equivalentPairs.length; i++) {
            if (util.Equal(toStateSet,
                util.Intersection(toStateSet, equivalentPairs[i]))) {
              classKey += i.toString();
            }
          }
          //console.log("Input: ", alpha);
          //console.log("To States: ", toStateSet);
          //console.log("classKey: ", classKey);
        });

        if (eqClassMap.has(classKey)) {
          eqClassMap.get(classKey).add(state);
        } else {
          eqClassMap.set(classKey, new Set([state]));
        }
        //console.log(eqClassMap);
      });
      newEquivalentPairs = newEquivalentPairs.concat(
        Array.from(eqClassMap.values()));
    });
    //console.log(newEquivalentPairs);
    if (util.areEquivalent(newEquivalentPairs, equivalentPairs)) {
      break;
    } else {
      equivalentPairs = newEquivalentPairs;
    }
  }

  for (i = 0; i < equivalentPairs.length; i++) {
    equivalentPairs[i] = Array.from(equivalentPairs[i]);
  }

  //console.log(equivalentPairs);

  var newFsm = {
    states: [],
    alphabet: util.clone(automaton.alphabet),
    starting: [],
    accepting: [],
    transitions: {}
  };

  for (i = 0; i < equivalentPairs.length; i++) {
    newFsm.states.push(equivalentPairs[i][0]);
    if (util.containsAll(automaton.accepting, equivalentPairs[i])) {
      newFsm.accepting.push(equivalentPairs[i][0]);
    }
    if (util.contains(equivalentPairs[i], automaton.starting)) {
      newFsm.starting = equivalentPairs[i][0];
    }
  }

  Object.values(automaton.transitions).forEach(transition => {
    if (util.contains(newFsm.states, transition.fromState)) {
      var key = transition.fromState + ',' + transition.input;
      newFsm.transitions[key] = {
        fromState: util.clone(transition.fromState),
        input: util.clone(transition.input),
        toStates: []
      };
      for (j = 0; j < transition.toStates.length; j++) {
        for (i = 0; i < equivalentPairs.length; i++) {
          if (util.contains(equivalentPairs[i], transition.toStates[j])) {
            newFsm.transitions[key].toStates.push(equivalentPairs[i][0]);
          }
        }
      }
    }
  });

  console.log(newFsm);

  return newFsm;
};

// minimizes the fsm by removing unreachable and equivalent states
fsm.minimize = function (automaton) {
  var fsmType = fsm.determineType(automaton);
  var newFsm = automaton;

  if (fsmType === fsm.constants.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(automaton);
    newFsm = fsm.convertNfaToDfa(newFsm);
  } else if (fsmType === fsm.constants.non_determine) {
    newFsm = fsm.convertNfaToDfa(automaton);
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

  for (i = 0; i < fsm.accepting.length; i++) {
    fsm.addAcceptingState(newFsm, mapping[fsm.accepting[i].toString()]);
  }

  for (i = 0; i < fsm.transitions.length; i++) {
    var newToStates = [];

    for (j = 0; j < fsm.transitions[i].toStates.length; j++) {
      newToStates.push(mapping[fsm.transitions[i].toStates[j].toString()]);
    }

    fsm.addTransition(newFsm,
      mapping[fsm.transitions[i].fromState.toString()],
      newToStates,
      fsm.transitions[i].input);
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

  newFsm.starting = newFsm.states[0];

  newFsm.accepting = [];
  for (i = 0; i < numStates; i++) {
    if (Math.round(Math.random())) {
      newFsm.accepting.push(newFsm.states[i]);
    }
  }

  if (fsmType === fsm.constants.e_non_determine) {
    newFsm.alphabet.push(fsm.constants.epsilon);
  }

  newFsm.transitions = {};
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

        newFsm.transitions[newFsm.states[i] + ',' + newFsm.alphabet[j]] = {
          fromState: newFsm.states[i],
          input: newFsm.alphabet[j],
          toStates: toStates
        };
      }
    }
  }

  if (fsmType === fsm.constants.e_non_determine) {
    newFsm.alphabet.pop();
  }

  return newFsm;
};



// test whether if the language accepted by the fsm contains at least one string
fsm.isLanguageNonEmpty = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constants.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constants.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  return newFsm.accepting.length > 0;
};

fsm.isLanguageInfinite = function (fsm) {
  var fsmType = fsm.determineType(fsm);
  var newFsm = fsm;

  if (fsmType === fsm.constants.non_determine) {
    newFsm = fsm.convertNfaToDfa(fsm);
  } else if (fsmType === fsm.constants.e_non_determine) {
    newFsm = fsm.convertEnfaToNfa(fsm);
    newFsm = fsm.convertNfaToDfa(newFsm);
  }

  newFsm = fsm.minimize(newFsm);

  var deadState = null,
    i, reachable;

  for (i = 0; i < newFsm.states.length; i++) {
    if (util.contains(newFsm.accepting, newFsm.states[i])) {
      continue;
    }

    reachable = fsm.getReachableStates(newFsm, newFsm.states[i], true);

    if (util.containsAny(newFsm.accepting, reachable)) {
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



fsm.operators = {
  "union": function (bool1, bool2) {
    return bool1 && bool2;
  },
  "intersection": function (bool1, bool2) {
    return bool1 || bool2;
  },
  "difference": function (bool1, bool2) {
    return bool1 && !(bool2);
  },
  "complement": function (set1, set2) {
    return !(util.contains(set1, set2));
  }
};

fsm.crossProduct = function (fsm1, fsm2, operator) {
  var newAlphabet = util.clone(fsm1.alphabet);
  var newStates = [];
  var newStarting = [util.clone(fsm1.starting), util.clone(fsm2.starting)];
  var newAccepting = [];
  var newTransitions = {};

  fsm1.states.forEach(state1 => {
    fsm2.states.forEach(state2 => {
      var newState = [util.clone(state1), util.clone(state2)];
      newStates.push(newState);

      newAlphabet.forEach(char => {
        var transKey = newState + ',' + char;
        newTransitions[transKey].fromState = newState;
        newTransitions[transKey].input = char;
        newTransitions[transKey].toStates = [
          fsm.forwardTransition(fsm1, [state1, char])[0],
          fsm.forwardTransition(fsm2, [state2, char])[0]
        ];
      });

      if (fsm.operators[operator](
          fsm1.accepting.include(state1),
          fsm2.accepting.include(state2))) {
        newAccepting.push(newState);
      }
    });
  });

  return {
    states: newStates,
    alphabet: newAlphabet,
    accepting: newAccepting,
    starting: newStarting,
    transitions: newTransitions
  };
};

fsm.union = function (fsm1, fsm2) {
  if (!(util.areEquivalent(fsm1.alphabet, fsm2.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  return fsm.crossProduct(fsm1, fsm2, "union");
};

fsm.intersection = function (fsm1, fsm2) {
  return fsm.crossProduct(fsm1, fsm2, "intersection");
};

fsm.difference = function (fsm1, fsm2) {
  if (!(util.areEquivalent(fsm1.alphabet, fsm2.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  return fsm.crossProduct(fsm1, fsm2, "difference");
};

fsm.complement = function (fsm) {
  var newFsm = util.clone(fsm);
  var newAccepting = [];

  newFsms.states.forEach(state => {
    if (fsm.operators.complement(newFsm.accepting, state)) {
      newAccepting.push(state);
    }
  });

  newFsm.accepting = newAccepting;
  return newFsm;
};

fsm.concatenation = function (fsm1, fsm2) {
  if (!(util.areEquivalent(fsm1.alphabet, fsm2.alphabet))) {
    throw new Error("Alphabets must be the same");
  }

  if (util.containsAny(fsm1.states, fsm2.states)) {
    throw new Error("States must not overlap");
  }

  var newAlphabet = util.clone(fsm1.alphabet);
  var newStates = util.clone(fsm1.states).concat(util.clone(fsm2.states));
  var newStarting = util.clone(fsm1.starting);
  var newAccepting = util.clone(fsm2.accepting);
  var newTransitions = {
    ...util.clone(fsm1.transitions),
    ...util.clone(fsm2.transitions)
  };

  fsm1.accepting.forEach(state => {
    var transKey = state + ',' + fsm.constants.epsilon;
    newTransitions[transKey].fromState = util.clone(state);
    newTransitions[transKey].input = fsm.constants.epsilon;
    newTransitions[transKey].toStates = [util.clone(fsm2.starting)];
  });

  return {
    states: newStates,
    alphabet: newAlphabet,
    accepting: newAccepting,
    starting: newStarting,
    transitions: newTransitions
  };
};

fsm.kleen = function (fsm) {
  var newFsm = util.clone(fsm);
  var newStarting = "S";

  newFsm.states.push(newStarting);
  var transKey = newStarting + ',' + fsm.constants.epsilon;
  newFsm.transitions[transKey].fromState = newStarting;
  newFsm.transitions[transKey].input = fsm.constants.epsilon;
  newFsm.transitions[transKey].toStates = [newFsm.starting];
  newFsm.starting = newStarting;

  newFsm.accepting.forEach(state => {
    var transKey = state + ',' + fsm.constants.epsilon;
    newFsm.transitions[transKey].fromState = state;
    newFsm.transitions[transKey].input = fsm.constants.epsilon;
    newFsm.transitions[transKey].toStates = [newStarting];
  });

  return newFsm;
};

fsm.reverse = function (fsm) {
  var newFsm = util.clone(fsm);

  var newTransitions = {};
  for (var key in newFsm.transitions) {
    var transition = newFsm.transitions[key];
    transition.toStates.forEach(state => {
      var transKey = state + ',' + transition.input;
      newFsm.transitions[transKey].fromState = state;
      newFsm.transitions[transKey].input = transition.input;
      newFsm.transitions[transKey].toStates = [transition.fromState];
    });
  }
  newFsm.transitions = newTransitions;

  var prevAcceptings = newFsm.accepting;
  newFsm.accepting = [newFsm.starting];

  var newStarting = "S";
  newFsm.states.push(newStarting);
  newFsm.starting = newStarting;

  var transKey = newStarting + ',' + fsm.constants.epsilon;
  newFsm.transitions[transKey].fromState = newStarting;
  newFsm.transitions[transKey].input = fsm.constants.epsilon;
  newFsm.transitions[transKey].toStates = prevAcceptings;

  return newFsm;
};

fsm.isSubset = function (fsm1, fsm2) {
  return fsm.areEquivalentFSMs(fsm2, fsm.intersection(fsm1, fsm2));
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
    if (fsm.transitions[i].input === fsm.constants.epsilon) {
      grammar.productions.push({
        left: [util.clone(fsm.transitions[i].fromState)],
        right: util.clone(fsm.transitions[i].toStates)
      });
    } else {
      grammar.productions.push({
        left: [util.clone(fsm.transitions[i].fromState)],
        right: [util.clone(fsm.transitions[i].input)].concat(
          util.clone(fsm.transitions[i].toStates))
      });
    }
  }

  for (i = 0; i < fsm.accepting.length; i++) {
    grammar.productions.push({
      left: [util.clone(fsm.accepting[i])],
      right: [grammar.constants.epsilon]
    });
  }

  return grammar;
};

fsm.inputsForTransitions = function (automaton, stateA, stateB) {
  var res = [];

  for (var i = 0; i < automaton.transitions.length; i++) {
    var transition = automaton.transitions[i];

    if (util.areEquivalent(transition.fromState, stateA) &&
      util.contains(transition.toStates, stateB)) {
      res.push(transition.input);
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
      var inputs = fsm.inputsForTransitions(automaton, automaton.states[i], automaton.states[j]);

      for (z = 0; z < inputs.length; z++) {
        inputs[z] = regex.tree.makeElement(inputs[z]);
      }

      if (i === j) {
        inputs.push(regex.tree.makeEpsilon());
      }

      r[0][i][j] = regex.tree.makeUnion(inputs);
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
          seq = regex.tree.makeConcatnation([r[k - 1][i][k - 1], r[k - 1][k - 1][j]]);
        } else {
          seq = regex.tree.makeConcatnation([r[k - 1][i][k - 1], regex.tree.makeKleenStar(r[k - 1][k - 1][k - 1]), r[k - 1][k - 1][j]]);
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

    if (util.contains(automaton.accepting, automaton.states[i])) {
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