let syllogist = (function () {
  var NEG = '-';
  var POS = '+';

  var negation = function (expr) {
    if (expr.polarity == POS) {
      expr.polarity = NEG;
    } else if (expr.polarity == NEG) {
      expr.polarity = POS;
    }
  };

  var sdagger = function (Gamma, Phi) {

  };

  var makeEyes = function (Gamma) {
    for (var i = 0; i < Gamma.length; i++) {
      var expr = Gamma[i];
      if (expr[0] == 'Some') {

      }
    }
  };

  var drawProofTree = function (proof) {
    var assumptions = proof.assumptions;
    var conclusion = proof.conclusion;
    var rule = proof.rule;

    var leaves = "";
    for (var i = 0; i < assumptions.length; i++) {
      if (typeof assumptions[i] !== 'string') {
        leaves += drawProofTree(assumptions[i]);
      } else {
        leaves += '<div class="assumption">CON</div>'.replace('CON', assumptions[i]);
      }
    }
    leaves = '<div class="leaves">CON</div>'.replace('CON', leaves);
    var root = '<div class="root">CON</div>'.replace('CON', conclusion);
    var tree = '<div class="proof"><div class="tree">LEAFROOT</div><div class="rule">RULE</div></div>';
    tree = tree.replace('LEAF', leaves);
    tree = tree.replace('ROOT', root);
    tree = tree.replace('RULE', rule);
    return tree;
  };

  var preprocessAssumption = function (assumption) {
    var assump = assumption.split(" ");
    if (assump[0] == 'There' && assump[1] == 'are') {
      assump = assump.slice(2, assump.length - 1);
    } else if (assump[0] == 'At') {
      assump = [assump[0] + " " + assump[1]].concat(assump.slice(2, assump.length - 1));
    } else if (assump[1] == 'as' && assump[2] == 'many') {
      assump = [assump[0]].concat(assump.slice(3, assump.length - 1));
    } else if (assump[0] == 'more') {
      assump = ['More'].concat(assump.slice(1, assump.length - 1));
    }

    left_constant = {};
    right_constant = {};

    if (assump[1].length == 1) {
      left_constant = {
        constant: assump[1],
        polarity: POS
      };
    } else {
      left_constant = {
        constant: assump[1].slice(-1)[0],
        polarity: NEG
      };
    }

    if (assump[3].length == 1) {
      right_constant = {
        constant: assump[3],
        polarity: POS
      };
    } else {
      right_constant = {
        constant: assump[3].slice(-1)[0],
        polarity: NEG
      };
    }

    if (assump[0] == 'No') {
      assump[0] = 'All';
      right_constant = negation(right_constant);
    }
    return [assump[0], left_constant, right_constant];
  };

  var isFollowed = function (assumptions, conclusion) {
    var Gamma = [];
    for (var i = 0; i < assumptions.length; i++) {
      Gamma.push(preprocessAssumption(assumptions[i]));
    }
    var Phi = preprocessAssumption(conclusion);
  };

  return {
    isFollowed,
    drawProofTree
  };

})();

exports.data = syllogist;