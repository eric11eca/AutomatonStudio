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

function copyAndDeleteProperties(o1, o2) {
  var p;

  for (p in o1) {
    if (o1.hasOwnProperty(p)) {
      delete o1[p];
    }
  }

  for (p in o2) {
    if (o2.hasOwnProperty(p)) {
      o1[p] = o2[p];
    }
  }
}

// $* => $
tree._simplify_rule_eps = function (reg) {
  if (tree._isKLEEN(reg) && util.areEquivalent(reg.expression, tree.makeEpsilon())) {
    reg.type = reg.expression.type;
    delete reg.expression;
    return true;
  }
  return false;
};

// $a => a
tree._simplify_rule_eps_concat = function (reg) {
  if (tree._isCONCAT(reg) && reg.components.length > 1) {
    for (var i = 0; i < reg.components.length; i++) {
      if (reg.components[i].type == tree.constants.EPS) {
        reg.components.splice(i, 1);
        return true;
      }
    }
  }
  return false;
};

// (a) => a
tree._simplify_single = function (reg) {
  if (tree._isUNION(reg) && reg.children.length == 1) {
    reg.type = reg.children[0].type;
    copyAndDeleteProperties(reg, reg.children[0]);
    return true;
  } else if (tree._isCONCAT(reg) && reg.components.length == 1) {
    reg.type = reg.components[0].type;
    copyAndDeleteProperties(reg, reg.components[0]);
    return true;
  }
  return false;
};

// (a*)* => a*
tree._simplify_rule_kleen_1 = function (reg) {
  if (tree._isKLEEN(reg) && tree._isKLEEN(reg.expression)) {
    reg.expression = reg.expression.expression;
    return true;
  }

  return false;
};

// (a+b*)* => (a+b)*
tree._simplify_rule_kleen_2 = function (reg) {
  if (tree._isKLEEN(reg) && tree._isUNION(reg.expression)) {
    for (var i = 0; i < reg.expression.children.length; i++) {
      if (tree._isKLEEN(reg.expression.children[i].type)) {
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
      if (reg.expression.components[i].type != tree.constants.KLEEN) {
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
tree._simplify_rule_union_parent = function (reg) {
  if (tree._isUNION(reg) && reg.children.length > 1) {
    var unionIdx = tree._findIndex(reg.children, tree.constants.UNION);
    if (unionIdx >= 0) {
      var child = reg.children[unionIdx];
      reg.children.splice(unionIdx, 1);
      for (i = 0; i < child.children.length; i++) {
        reg.children.splice(unionIdx + i, 0, child.children[i]);
      }
      return true;
    }
  }
};

// ab(cd) => abcd
tree._simplify_rule_concat_parent = function (reg) {
  if (reg.type == tree.constants.CONCAT && reg.components.length > 1) {
    var concatIdx = tree._findIndex(reg.components, tree.constants.CONCAT);
    if (concatIdx >= 0) {
      var component = reg.components[concatIdx];
      reg.components.splice(concatIdx, 1);
      for (var i = 0; i < component.components.length; i++) {
        reg.components.splice(concatIdx + i, 0, component.components[i]);
      }
      return true;
    }
  }
  return false;
};

tree._findIndex = function (arr, type) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].type == type) {
      return i;
    }
  }
  return -1;
};

// a+a => a
tree._simplify_rule_equal_union = function (reg) {
  if (tree._isUNION(reg) && reg.children.length > 1) {
    for (var i = 0; i < reg.children.length - 1; i++) {
      var found = -1;
      for (var j = i + 1; j < reg.children.length; j++) {
        if (util.areEquivalent(reg.children[i], reg.children[j])) {
          found = j;
          break;
        }
      }
      if (found >= 0) {
        reg.children.splice(j, 1);
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
  if (tree._isCONCAT(reg) && reg.components.length > 1) {
    for (var i = 0; i < reg.components.length - 1; i++) {
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
tree._simplify_rule_multi_eq_union = function (reg) {
  if (tree._isKLEEN(reg) && tree._isUNION(reg.expression) && reg.expression.length > 1) {
    for (var i = 0; i < reg.expression.children.length; i++) {
      for (var j = 0; j < reg.children.length; j++) {
        if (i != j && reg.expression.children[j].type === tree.constants.CONCAT &&
          reg.expression.children[j].components.length > 1) {
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

// (a+$)* => (a)*
tree._simplify_rule_Kleen_Union_Eps = function (reg) {
  if (reg.type == tree.constants.KLEEN &&
    reg.expression.type == tree.constants.UNION &&
    reg.expression.children.length > 1) {
    var idx = tree._findIndex(reg.expression.children, tree.constants.EPS);
    if (idx >= 0) {
      reg.expression.children.splice(idx, 1);
      return true;
    }
  }
  return false;
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
  if (tree._isKLEEN(reg) && tree._isCONCAT(reg.expression) &&
    reg.expression.components.length == 0) {
    reg.type = tags.CONCAT;
    delete reg.expression;
    reg.components = [];
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
      if (curr.type == tree.constants.CONCAT && curr.components.length > 1) {
        for (var j = i + 1; j < reg.children.length; j++) {
          var next = reg.children[j];
          if (next.type == tree.constants.CONCAT && next.components.length > 1) {
            var common1 = curr.components[curr.components.length - 1];
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

// a*($+b(a+b)*) => (a+b)*
tree._simplify_kleen_contain1 = function (reg) {
  if (tree._isCONCAT(reg) && reg.components.length > 1) {
    for (var i = 0; i < reg.components.length - 1; i++) {
      if (tree._isKLEEN(reg.components[i]) && tree._isUNION(reg.components[i + 1]) &&
        reg.components[i + 1].children.length == 2) {
        var epsiloc = reg.components[i + 1].children.indexOf(tree.makeEpsilon());
        if (epsiloc > -1) {
          var child = epsiloc == 0 ? reg.components[i + 1].children[1] : reg.components[i + 1].children[0];
          if (tree._isCONCAT(child) && child.components.length == 2) {
            var conditions = tree._isKLEEN(child.components[1]) &&
              tree._isUNION(child.components[1].expression) &&
              child.components[1].expression.children.length == 2 &&
              util.contains(child.components[1].expression.children, reg.components[i].expression);
            if (conditions) {
              if (util.contains(child.components[1].expression.children, child.components[0])) {
                reg.components[i + 1] = child.components[1];
                reg.components.splice(i, 1);
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

// ($+(a+b)*a)b* => (a+b)*
tree._simplify_kleen_contain2 = function (reg) {
  if (tree._isCONCAT(reg) && reg.components.length > 1) {
    for (var i = 1; i < reg.components.length; i++) {
      if (tree._isKLEEN(reg.components[i]) && tree._isUNION(reg.components[i - 1]) &&
        reg.components[i - 1].children.length == 2) {
        var epsiloc = reg.components[i - 1].children.indexOf(tree.makeEpsilon());
        if (epsiloc > -1) {
          var child = epsiloc == 0 ? reg.components[i - 1].children[1] : reg.components[i - 1].children[0];
          if (tree._isCONCAT(child) && child.components.length == 2) {
            var conditions = tree._isKLEEN(child.components[0]) &&
              tree._isUNION(child.components[0].expression) &&
              child.components[0].expression.children.length == 2 &&
              util.contains(child.components[0].expression.children, reg.components[i].expression);
            if (conditions) {
              if (util.contains(child.components[0].expression.children, child.components[1])) {
                reg.components[i - 1] = child.components[0];
                reg.components.splice(i, 1);
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

tree._processSubset = function (arr, iterator, kleen, fsmCache) {
  for (var i = 0; i < iterator.length - 1; i++) {
    for (var j = i + 1; j < iterator.length; j++) {
      if (fsms.length <= j) {
        if (kleen) {
          fsms.push(getOrCreateFsm(
            tree.makeKleenStar(iterator[j]), fsmCache));
        } else {
          fsms.push(getOrCreateFsm(iterator[j], fsmCache));
        }
      }

      if (fsm.isSubset(fsms[i], fsms[j])) {
        arr.splice(j, 1);
        return true;
      }

      if (fsm.isSubset(fsms[j], fsms[i])) {
        arr.splice(i, 1);
        return true;
      }
    }
  }
};

// L1+L2 => L2, if L1 is in L2
tree._simplify_rule_union_subset = function (reg, fsmCache) {
  if (tree._isUNION(reg) && reg.children.length > 1) {
    var fsms = [];
    fsms.push(getOrCreateFsm(reg.children[0], fsmCache));
    return tree._processSubset(reg.children, reg.children, false, fsmCache);
  }
  return false;
};

// (L1+L2)* => L2*, if L1* is subset of L2*
tree._simplify_rule_union_kleen_subset = function (reg, fsmCache) {
  if (tree._isKLEEN(reg) && tree._isUNION(reg.expression) && tree.expression.children.length > 1) {
    var fsms = [];
    fsms.push(tree.getOrCreateFsm(tree.makeKleenStar(reg.expression.children[0]), fsmCache));
    return tree._processSubset(reg.expression.children, reg.expression.children, true, fsmCache);
  }
  return false;
};

// L1*L2* => L2, if L1* is subset of L2*
tree._simplify_rule_kleen_subset = function (reg, fsmCache) {
  if (tree._isCONCAT(reg) && reg.components.length > 1) {
    var fsms = [];
    fsms.push(getOrCreateFsm(reg.components[0], fsmCache));

    for (var i = 0; i < reg.components.length - 1; i++) {
      fsms.push(getOrCreateFsm(reg.components[i + 1], fsmCache));

      if (tree._isKLEEN(reg.components[i]) && tree._isKLEEN(reg.components[i + 1])) {

        if (fsm.isSubset(fsms[i], fsms[i + 1])) {
          reg.components.splice(i + 1, 1);
          return true;
        }

        if (fsm.isSubset(fsms[i + 1], fsms[i])) {
          reg.components.splice(i, 1);
          return true;
        }
      }
    }
  }
  return false;
};

// $+L => L, if L contains $
tree._simplify_eps_langauge = function (reg, fsmCache) {
  if (tree._isUNION(reg) && reg.children.length > 1) {
    var epsLoc = reg.children.findIndex(tree._isEPS);

    if (epsLoc > -1) {
      for (var i = 0; i < reg.children.length; i++) {
        if (!(tree._isEPS(reg.children[i]))) {
          var fsm = getOrCreateFsm(reg.children[i], fsmCache);
          if (fsm.isAcceptingState(fsm, fsm.starting)) {
            tree.choices.splice(epsLoc, 1);
            return true;
          }
        }
      }
    }
  }
  return false;
};

tree.atomic_simplification_rules = {
  "$* => $": tree._simplify_rule_eps,
  "$a => a": tree._simplify_rule_eps_concat,
  "(a) => a": tree._simplify_single,
  "(a*)* => a*": tree._simplify_rule_kleen_1,
  "(a+b*)* => (a+b)*": tree._simplify_rule_kleen_2,
  "$+a* => a*": tree._simplify_rule_eps_kleen_union,
  "(a*b*)* => (a*+b*)*": tree._simplify_rule_kleen_3,
  "(a+(b+c)) => a+b+c": tree._simplify_rule_union_parent,
  "ab(cd) => abcd": tree._simplify_rule_concat_parent,
  "a+a* => a*": tree._simplify_rule_union_kleen,
  "a*a* => a*": tree._simplify_rule_equal_kleen,
  "(aa+a)* => (a)*": tree._simplify_rule_multi_eq_union,
  "(a+$)* => (a)*": tree._simplify_rule_Kleen_Union_Eps,
  "(a()) => ()": tree._simplify_rule_null_concat,
  "()* => ()": tree._simplify_rule_null_Kleen,
  "(ab+ac) => a(b+c)": tree._simplify_rule_distributive1,
  "a*aa* => aa*": tree._simplify_rule_multi_kleen_concat,
  "(ab+cb) => (a+c)b": tree._simplify_rule_distributive2,
  "a*($+b(a+b)*) => (a+b)*": tree._simplify_kleen_contain1,
  "($+(a+b)*a)b* => (a+b)*": tree._simplify_kleen_contain2,
  "a+a => a": tree._simplify_rule_equal_union
};

tree.complex_simplification_rules = {
  "L1+L2 => L2": tree._simplify_rule_union_subset,
  "(L1+L2)* => L2*": tree._simplify_rule_union_kleen_subset,
  "L1*L2* => L2": tree._simplify_rule_kleen_subset,
  "$+L => L": tree._simplify_eps_langauge,
};

tree.nestedExpr = {
  "union": function (reg) {
    return reg.children;
  },
  'concatnation': function (reg) {
    return reg.components;
  },
  'kleene_star': function (reg) {
    return [reg.expression];
  }
};

tree.applyAllSimplificationRules = function (reg, fsmCache, isComplex) {
  var rule = function () {};
  var simplified = false;

  for (const key in tree.atomic_simplification_rules) {
    rule = tree.atomic_simplification_rules[key];
    simplified = tree.applySimplificationRule(reg, rule, fsmCache);
    if (simplified) {
      return key;
    }
  }

  if (isComplex) {
    for (const key in tree.complex_simplification_rules) {
      rule = tree.complex_simplification_rules[key];
      simplified = tree.applySimplificationRule(reg, rule, fsmCache);
      if (simplified) {
        return key;
      }
    }
  }

  return null;
};

tree.applySimplificationRule = function (reg, rule, fsmCache) {
  var simplified = rule(reg, fsmCache);
  if (simplified) {
    return true;
  }

  var expression = [];
  if (tree.nestedExpr.hasOwnProperty(reg.type)) {
    expression = tree.nestedExpr[reg.type](reg);
  }

  if (expression.length > 0) {
    for (var i = 0; i < expression.length; i++) {
      simplified = tree.applySimplificationRule(expression[i], rule, fsmCache);
      if (simplified) {
        return true;
      }
    }
  }

  return false;
};

tree.simplify = function (reg, isComplex) {
  var treeClone = util.clone(reg);
  var appliedPattern = "";
  //var iterCount = 0;
  var fsmCache = {};
  var applied = {};

  while (appliedPattern != null) {
    //console.log("BATCH: ", iterCount);
    appliedPattern = tree.applyAllSimplificationRules(treeClone, fsmCache, isComplex);
    if (appliedPattern != null) {
      //console.log("Pattern: ", appliedPattern);
      if (applied.hasOwnProperty(appliedPattern)) {
        applied[appliedPattern] += 1;
      } else {
        applied[appliedPattern] = 1;
      }
    }
    //var arr = [];
    //tree.linearFormat(treeClone, arr);
    //console.log(linear.toString(arr));
    //iterCount += 1;
    //console.log("**************************");
  }
  return treeClone;
};

function getOrCreateFsm(reg, fsms) {
  if (fsms.hasOwnProperty(reg)) {
    return fsms[reg];
  }

  var fsm = fsm.minimize(tree.toAutomaton(reg));
  fsms[reg] = fsm;
  return fsm;
}

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


var linearWrap = function (outter, inner, arr, length) {

  if (linear.scope[outter.type] >= linear.scope[inner.type] && length > 1) {
    //console.log("Parent: ", outter.type);
    //console.log("Child: ", inner);
    //console.log("Length: ", length);
    //console.log("Before: ", arr.join(""));
    arr.push(linear.symbol.LEFTP);
    tree.linearFormat(inner, arr);
    arr.push(linear.symbol.RIGHTP);
    //console.log("After: ", arr.join(""));
  } else {
    tree.linearFormat(inner, arr);
  }
};

var epsilonToLinear = function (reg, arr) {
  arr.push(linear.symbol.EPS);
};

var elementToLinear = function (reg, arr) {
  arr.push(reg.obj);
};

var kleenToLinear = function (reg, arr) {
  linearWrap(reg, reg.expression, arr, 2);
  arr.push(linear.symbol.KLEEN);
};

var unionToLinear = function (reg, arr) {
  for (var i = 0; i < reg.children.length; i++) {
    if (i > 0) {
      arr.push(linear.symbol.UNION);
    }
    linearWrap(reg, reg.children[i], arr, reg.children.length);
  }
};

var concatToLinear = function (reg, arr) {
  reg.components.forEach(child => {
    linearWrap(reg, child, arr, reg.components.length);
  });
};

tree.linearFormatter = {
  'union': unionToLinear,
  'concatnation': concatToLinear,
  'kleene_star': kleenToLinear,
  'element': elementToLinear,
  'epsilon': epsilonToLinear
};

tree.linearFormat = function (reg, arr) {
  tree.linearFormatter[reg.type](reg, arr);
};

tree.toLinear = function (reg) {
  reg = tree.simplify(reg, false);
  var arr = [];
  tree.linearFormat(reg, arr);

  return arr;
};

let linear = {};

linear.scope = {
  'union': 0,
  'concatnation': 1,
  'kleene_star': 2,
  'element': 3,
  'epsilon': 3
};

linear.symbol = {
  UNION: '+',
  KLEEN: '*',
  EPS: '$',
  LEFTP: '(',
  RIGHTP: ')',
};

linear.toString = function (reg) {
  var expression = [];
  for (var i = 0; i < reg.length; i++) {
    var sigma = reg[i];
    if (sigma.length != 1) {
      throw error("Conversion failed, not a single char at " + i, i);
    }
    expression.push(sigma);
  }
  return expression.join("");
};


let regex = {
  tree: tree,
  linear: linear
};

exports.data = regex;