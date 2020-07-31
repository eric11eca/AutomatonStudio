let fsm = require("fsm").data;


let regex = {};

let tree = {};

tree.constants = {
  UNION: 'union',
  SEQ: 'sequence',
  KLEEN: 'kleene_star',
  ELEM: 'literal',
  EPS: 'epsilon'
};


// Returns the root of a new tree that represents the expression that is the union of
// all the choices.
tree.makeUnion = function (children) {
  return {
    tag: tree.constants.UNION,
    children: children
  };
};

// Returns the root of a new tree that represents the expression that is the sequence
// of all the elements.
tree.makeSequence = function (children) {
  return {
    tag: tree.constants.SEQ,
    children: children
  };
};

// Wraps the given expressin tree unde a Kleene star operator.
// Returns the root of the new tree.
tree.makeKleenStar = function (expression) {
  return {
    tag: tree.constants.KLEEN,
    expression: expression
  };
};

// Creates a node that represents the literal obj.
tree.makeLiteral = function (obj) {
  return {
    tag: tree.constants.ELEM,
    obj: obj
  };
};

var epsNode = {
  tag: tree.constants.EPS
};
// Returns a node representing the empty string regular expression.
tree.makeEpsilon = function () {
  return epsNode;
};

tree._automatonFromUnion = function (regex, automaton, stateCounter) {
  var l = fsm.addState(automaton, stateCounter.getAndAdvance());
  var r = fsm.addState(automaton, stateCounter.getAndAdvance());
  for (var i = 0; i < regex.choices.length; i++) {
    var statePair = _dispatchToAutomaton(regex.choices[i], automaton, stateCounter);
    noam.fsm.addEpsilonTransition(automaton, l, [statePair[0]]);
    noam.fsm.addEpsilonTransition(automaton, statePair[1], [r]);
  }
  return [l, r];
};