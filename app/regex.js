let fsm = require("./stateAutomaton").data,
  util = require("./util").data;

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

// $* => $
tree._simplify_rule_eps = function (reg) {
  if (reg.type == tree.constants.KLEEN && reg.expression == tree.constants.EPS) {
    reg.type = reg.expression.type;
    delete reg.expression;
    return true;
  }
  return false;
};

// $a => a
tree._simplify_rule_eps_concat = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    for (var i = 0; i < reg.components.length; i++) {
      if (reg.components[i].type == tree.constants.EPS) {
        reg.components.splice(i, 1);
        return true;
      }
    }
  }
  return false;
};

// (a*)* => a*
tree._simplify_rule_kleen_1 = function (reg) {
  if (reg.type == tree.constants.KLEEN && tree.expr.type == tree.constants.KLEEN) {
    reg.expression = reg.expression.expression;
    return true;
  }

  return false;
};

// (a+b*)* => (a+b)*
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

// $+a* => a*
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

// (a*b*)* => (a*+b*)*
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

// (a+(b+c)) => a+b+c
tree._simplify_rule_concat_parent = function (reg) {
  if (reg.type == tree.constants.UNION && RegExp.children.length > 1) {
    var dict = {
      type: tree.constants.UNION,
      obj: ""
    };
    var unionIdx = tree._findIndex(reg.children, dict, ['type']);
    if (unionIdx >= 0) {
      var child = reg.children[unionIdx];
      reg.children.splice(unionIdx, 1);
      for (i = 0; i < child.children.length; i++) {
        reg.children.splice(unionIdx + 1, 0, child.children[i]);
      }
      return true;
    }
  }
};

// ab(cd) => abcd
tree._simplify_rule_concat_parent = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    var dict = {
      type: tree.constants.CONCAT,
      obj: ""
    };
    var concatIdx = tree._findIndex(reg.components, dict, ['type']);
    if (concatIdx >= 0) {
      var component = reg.components[concatIdx];
      reg.components.splice(concatIdx, 1);
      for (var i = 0; i < component.components.length; i++) {
        reg.componsnets.splice(concatIdx + 1, 0, component.components[concatIdx]);
      }
      return true;
    }
  }
  return false;
};

// a+a => a
tree._simplify_rule_equal_union = function (reg) {
  if (reg.type == tree.constants.UNION && reg.children.length > 1) {
    for (var i = 0; i < reg.children.length - 1; i++) {
      var dict = {
        type: "",
        obj: reg.children[i]
      };
      var equivIdx = tree._findIndex(reg.children.slice(i + 1), dict, ['obj']);

      if (equivIdx >= 0) {
        reg.children.splice(equivIdx, 1);
        return true;
      }
    }
  }
  return false;
};

// a+a* => a*
tree._simplify_rule_union_kleen = function (reg) {
  if (reg.type == tree.constants.UNION && reg.children.length > 1) {
    for (var i = 0; i < reg.children.length; i++) {
      var idx = -1;
      for (var j = i + 1; j < reg.children.length; j++) {
        var isKleen = tree._isKLEEN(reg.children[i]);
        var isKleenNext = tree._isKLEEN(reg.children[j]);
        var equal = util.areEquivalent(reg.children[i], reg.children[j]);
        if (isKleen && equal) {
          reg.splice(j, 1);
          return true;
        } else if (isKleenNext && equal) {
          reg.splice(i, 1);
          return true;
        }
      }
    }
  }
  return false;
};

// a*a* => a*
tree._simplify_rule_equal_kleen = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    for (var i = 0; i < reg.components.length; i++) {
      var isKleen = tree._isKLEEN(reg.components[i]);
      var isKleenNext = tree._isKLEEN(reg.components[i + 1]);
      var equal = util.areEquivalent(reg.components[i], reg.components[i + 1]);
      if (isKleen && isKleenNext && equal) {
        reg.components.splice(i, 1);
        return true;
      }
    }
  }
  return false;
};

// (aa+a)* => (a)*
tree._simplify_rule_multi_eq_union = function () {
  if (reg.type == tree.constants.KLEEN &&
    reg.expression == tree.constants.UNION &&
    reg.expression.length > 1) {
    for (var i = 0; i < reg.expression.children.length; i++) {
      for (var j = 0; j < reg.children.length; j++) {
        if (i != j && reg.expression.children[j].type === tree.constants.CONCAT &&
          reg.expression.children[j].componsnets.length > 1) {
          var flag = true;
          for (var k = 0; k < reg.expression.children[j].components.length; k++) {
            if (!(util.areEquivalent(reg.expression[i],
                reg.expression.children[j].components[k]))) {
              flag = false;
              break;
            }
          }
          if (flag) {
            reg.expression.children.splice(j, 1);
            return true;
          }
        }
      }
    }
  }
  return false;
};

// (a + $)* => (a)*
tree._simplify_rule_Kleen_Union_Eps = function (reg) {
  if (reg.type == tree.constants.KLEEN &&
    reg.expression.type == tree.constants.UNION &&
    reg.expression.children.length > 1) {
    var dict = {
      type: tree.constants.EPS,
      obj: ""
    };
    var idx = tree._findIndex(reg.expression.children, dict, ['type']);
    reg.expression.children.splice(idx, 1);
    return true;
  }
  return falkse;
};

// (a()) => ()
tree._simplify_rule_null_concat = function (reg) {
  if (reg.type === tree.constants.CONCAT && reg.components.length > 2) {
    for (var i = 0; i < reg.components.length; i++) {
      var curr = reg.components[i];
      var isConcatEmpty = (curr.type == tree.constants.CONCAT && curr.components.length == 0);
      var isUnionEmpty = (curr.type == tree.constants.UNION && curr.children.length == 0);
      if (isConcatEmpty || isUnionEmpty) {
        reg.components = [];
        return true;
      }
    }
  }
  return false;
};

// ()* => ()
tree._simplify_rule_null_Kleen = function (reg) {
  if (reg.type == tree.constans.KLEEN &&
    reg.expression.type == tree.constans.CONCAT &&
    reg.expression.components.length == 0) {
    reg.type = tags.CONCAT;
    delete reg.expression;
    reg.compoentns = [];
    return true;
  }
  return false;
};

// (ab+ac) => a(b+c)
tree._simplify_rule_distributive1 = function (reg) {
  if (reg.type == tree.constants.UNION && reg.children.length > 1) {
    for (var i = 0; i < reg.children.length; i++) {
      var child1 = reg.children[i];
      if (child1.type == tree.constants.CONCAT && child1.components.length > 1) {
        for (var j = i + 1; j < reg.children.length; j++) {
          var child2 = reg.children[j];
          if (child2.type == tree.constants.CONCAT &&
            child2.components.length > 1 &&
            util.areEquivalent(child1.components[0], child2.components[0])) {
            var common = child1.components[0];
            var part1 = tree.makeConcatnation(child1.components.splice(1));
            var part2 = tree.makeConcatnation(child2.components.splice(1));
            var newUnion = tree.makeUnion([part1, part2]);
            var newConcat = tree.makeConcatnation([common, newUnion]);
            reg.children[i] = newConcat;
            reg.children.splice(j, 1);
            return true;
          }
        }
      }
    }
  }
  return false;
};

// a*aa* => aa*
tree._simplify_rule_multi_kleen_concat = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    for (var i = 1; i < reg.components.length - 1; i++) {
      var prev = reg.components[i - 1];
      var next = reg.components[i + 1];
      var isKleenPrev = prev.type == tree.constants.KLEEN;
      var isKleenNext = next.type == tree.constants.KLEEN;
      var ident1 = util.areEquivalent(prev, next);
      var ident2 = util.areEquivalent(prev.expression, reg.components[i]);
      if (isKleenPrev && isKleenNext && ident1 && ident2) {
        reg.components.splice(i - 1, 1);
        return true;
      }
    }
  }
  return false;
};

// (ab+cb) => (a+c)b
tree._simplify_rule_distributive2 = function (reg) {
  if (reg.type == tree.constants.UNION && reg.children.length > 1) {
    for (var i = 0; i < reg.children.length - 1; i++) {
      var curr = reg.children[i];
      if (curr.type == tree.constants.CONCAT && curr.components.lenght > 1) {
        for (var j = i + 1; j < reg.children.length; j++) {
          var next = reg.children[j];
          if (next.type == tree.constants.CONCAT && next.components.length > 1) {
            var common1 = curr.components[curr.components.lenght - 1];
            var common2 = next.components[next.components.length - 1];
            if (util.areEquivalent(common1, common2)) {
              var part1 = tree.makeConcatnation(curr.components.slice(0, curr.components.length - 1));
              var part2 = tree.makeConcatnation(next.components.slice(0, next.components.length - 1));
              var newUnion = tree.makeUnion([part1, part2]);
              var newConcat = tree.makeConcatnation([newUnion, common1]);
              reg.children[i] = newConcat;
              reg.children.splice(j, 1);
              return true;
            }
          }
        }
      }
    }
  }
  return false;
};

// L1+L2 => L2, L1 in L2
//tree._simplify_rule_union_subset = function (reg) {;
//  if (reg.type == tree.constants.UNION && reg.children.length > 1) {;
//    var;
//  };
//};


tree._findIndex = function (arr, dict, criteria) {
  for (var i = 0; i < arr.length; i++) {
    var satisfied = true;
    if (criteria.includes('type')) {
      satisfied = _isType(arr[i], dict.type);
    } else if (criteria.includes('type+')) {
      satisfied = _isType(arr[i], dict.type) && _isType(arr[i + 1], obj);
    } else if (criteria.includes('obj')) {
      satisfied = tree._areEquivalebt(arr[i], dict.obj);
    } else if (criteria.includes('obj+')) {
      satisfied = tree._areEquivalebt(arr[i], arr[i + 1]);
    }
    if (satisfied) return i;
  }
  return -1;
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

tree._areEquivalebt = function (obj1, obj2) {
  return util.areEquivalent(obj1, obj2);
};

tree._isType = function (obj, type) {
  return obj.type == type;
};

tree._isUNION = function (obj) {
  return obj.type == tree.constants.UNION;
};

tree._isCONCAT = function (obj) {
  return obj.type == tree.constants.CONCAT;
};

tree._isKLEEN = function (obj) {
  return obj.type == tree.constants.KLEEN;
};

tree._isELEM = function (obj) {
  return obj.type == tree.constants.ELEM;
};

tree._isEPS = function (obj) {
  return obj.type == tree.constants.EPS;
};



let regex = {
  tree: tree
};

exports.data = regex;