let fsm = require("./stateAutomaton").data;

let tree = {};

tree.constants = {
  UNION: 'union',
  CONCAT: 'concatnation',
  KLEEN: 'kleene_star',
  ELEM: 'element',
  EPS: 'epsilon'
};


// Returns the root of a new tree that represents the expression that is the union of
// all the choices.
tree.makeUnion = function (children) {
  return {
    type: tree.constants.UNION,
    children: children
  };
};

// Returns the root of a new tree that represents the expression that is the concatnation
// of all the elements.
tree.makeConcatnation = function (components) {
  return {
    type: tree.constants.CONCAT,
    components: components
  };
};

// Wraps the given expressin tree unde a Kleene star.
// Returns the root of the new tree.
tree.makeKleenStar = function (expression) {
  return {
    type: tree.constants.KLEEN,
    expression: expression
  };
};

// Creates a node that represents the characters in alphabet.
tree.makeElement = function (obj) {
  return {
    type: tree.constants.ELEM,
    obj: obj
  };
};

var epsNode = {
  type: tree.constants.EPS
};
// Returns a node representing the empty string regular expression.
tree.makeEpsilon = function () {
  return epsNode;
};


tree._simplify_rule_eps = function (reg) {
  if (reg.type == tree.constants.KLEEN && reg.expression == tree.constants.EPS) {
    reg.type = reg.expression.type;
    delete reg.expression;
    return true;
  }
  return false;
};

tree._simplify_rule_eps_concat = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    for (var i = 0; i < reg.components.lenght; i++) {
      if (reg.components[i].type == tree.constants.EPS) {
        reg.components.splice(i, 1);
        return true;
      }
    }
  }
  return false;
};

tree._simplify_rule_kleen_1 = function (reg) {
  if (reg.type == tree.constants.KLEEN && tree.expr.type == tree.constants.KLEEN) {
    reg.expression = reg.expression.expression;
    return true;
  }

  return false;
};

tree._simplify_rule_kleen_2 = function (reg) {
  if (reg.type == tree.constants.KLEEN && tree.expr.type == tree.constants.UNION) {
    reg.expression = reg.expression.expression;
    for (var i = 0; i < reg.expression.children.length; i++) {
      if (reg.expression.children[i].type == tree.constants.KLEEN) {
        reg.expression.children[i] = reg.expression.children[i].expression;
        return true;
      }
    }
  }
  return false;
};

tree._simplify_rule_eps_kleen_union = function (reg) {
  if (reg.type == tree.constants.UNION && reg.children.length > 1) {
    var epsidx = -1;
    var isKleen = false;
    for (i = 0; i < reg.children.length; i++) {
      if (reg.children[i].type == tree.constants.EPS) {
        epsidx = i;
      } else if (reg.children[i].type == tree.constants.KLEEN) {
        isKleen = true;
      }
    }

    if (epsidx >= 0 && isKleen) {
      reg.children.splice(epsidx, 1);
      return true;
    }
  }
};

tree._simplify_rule_kleen_3 = function (reg) {
  if (reg.type == tree.constants.KLEEN &&
    reg.expression.type == tree.constants.CONCAT) {
    for (var i = 0; i < reg.expression.components.length; i++) {
      if (reg.expression.component[i].type != tree.constants.KLEEN) {
        return false;
      }
    }

    reg.expression.type = tree.constants.UNION;
    reg.expression.children = reg.expression.components;
    delete reg.expression.component;
    return true;
  }
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



let regex = {
  tree: tree
};

exports.data = regex;