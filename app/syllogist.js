class Graph {
  constructor(num_vertices) {
    this.num_vertices = num_vertices;
    this.vertices = [];
    this.neighbors = new Map();
  }

  addVertex(v) {
    this.neighbors.set(v, []);
  }

  addEdge(v, w) {
    this.AdjList.get(v).push(w);
    this.AdjList.get(w).push(v);
  }

  printGraph() {
    var get_keys = this.AdjList.keys();
    for (var i of get_keys) {
      var get_values = this.AdjList.get(i);
      var conc = "";
      for (var j of get_values)
        conc += j + " ";
      console.log(i + " -> " + conc);
    }
  }
}
let util = require('./util').data;

let syllogist = (function () {
  var NEG = '-';
  var POS = '+';

  var variables = [];

  var _negation = function (expr) {
    if (expr.polarity == POS) {
      return {
        constant: expr.constant,
        polarity: NEG
      };
    } else if (expr.polarity == NEG) {
      return {
        constant: expr.constant,
        polarity: POS
      };
    }
  };

  var sent_neg = {
    'All': function (phi) {
      return ['Some', phi[1], negation(phi[2])];
    },
    'Some': function (phi) {
      return ['All', phi[1], negation(phi[2])];
    },
    'Al least': function (phi) {
      return ['More', phi[2], phi[1]];
    },
    'More': function (phi) {
      return ['At least', phi[2], phi[1]];
    }
  };

  var _sentence_negation = function (expr) {
    return sent_neg[expr[0]](expr);
  };

  var _simple = function (expr) {
    if (expr[1] == POS) {
      return expr[0];
    } else {
      return 'non-' + expr[0];
    }
  };

  var zeros = function (row, col) {
    var matrix = [];
    for (var i = 0; i < row; i++) {
      var vector = [];
      for (var j = 0; j < col; j++) {
        vector.push(0);
      }
      matrix.push(vector);
    }
    return matrix;
  };

  var _readGamma = function (Gamma, vertices) {
    var dim = vertices.length();
    var graph = {
      'All': zeros(dim, dim),
      'Some': zeros(dim, dim),
      'More': zeros(dim, dim),
      'At least': zeros(dim, dim)
    };

    var justification = util.clone(graph);
    var proof_length = util.clone(graph);

    var process = {
      'All': function (i, j) {
        graph.All[i][j] = 1;
        justification.All[i][j] = 2;
        proof_length.All[i][j] = 1;
      },
      'Some': function (i, j) {
        graph.Some[i][j] = 1;
        justification.Some[i][j] = 2;
        proof_length.Some[i][j] = 1;
      },
      'More': function (i, j) {
        graph.More[j][i] = 1;
        justification.More[j][i] = 2;
        proof_length.More[j][i] = 1;
      },
      'At least': function (i, j) {
        graph['At least'][j][i] = 1;
        justification['At least'][j][i] = 2;
        proof_length['At least'][j][i] = 1;
      },
    };

    for (const expr of Gamma) {
      process[expr[0]](vertices.indexOf(expr[1]), vertices.indexOf(expr[0]));
    }
    return {
      graph,
      justification,
      proof_length
    };
  };

  var makeMatrices = function (meta_Gamma) {
    var small_or_half = [];
    var large_or_half = [];
    var small = [];
    var large = [];
    var half = [];

    for (var i = 0; i < meta_Gamma.graph.All.length; i++) {
      meta_Gamma.graph.All[i][i] = 1;
      meta_Gamma.justification.All[i][i] = 1;
      meta_Gamma.proof_length.All[i][i] = 1;
    }
  };

  var cardinality = function (sets) {
    var small = sets.small,
      large = sets.large,
      small_or_half = sets.small_or_half,
      large_or_half = sets.large_or_half;

    for (var x of variables) {
      var x_pos = {
        constant: x,
        polarity: POS
      };
      var x_neg = {
        constant: x,
        polarity: NEG
      };
      var x_pos_idx = vertices.indexOf(x_pos);
      var x_neg_idx = vertices.indexOf(x_neg);

      if (!half.has(x_pos_idx) && !half.has(x_neg_idx)) {

      }
    }
  };

  var sdaggerAll = function (all_param) {
    var vertices = all_param.vertices;
    var Gamma = all_param.Gamma;
    var Phi = all_param.Phi;
    var graph = all_param.graph;

    var i = vertices.indexOf(Phi[1]);
    var j = vertices.indexOf(Phi[2]);

    if (graph[i][j] == 1) {
      does_it_follow();

    } else {
      does_not_follow();
      Gamma = Gamma.concat([_sentence_negation(Phi)]);
      var Is = [];
      var Ms = [];

    }
  };

  var sdagger = function (Gamma, Phi) {
    var polarized_variables = makeVariables(Gamma.concat(Phi));
    var digraph = new Graph(polarized_variables.length);
    var vertices = digraph.vertices;
    var neg_internal = {};
    for (var i = 0; i < vertices.length; i++) {
      neg_internal[i] = vertices.indexOf(_negation(vertices[i]));
    }

    var indices = [];
    for (i = 0; i < vertices.length; i++) {
      for (var j = 0; j < vertices.length; j++) {
        indices.push([i, j]);
      }
    }

    var mat_Gamma = _readGamma(Gamma, vertices);

    var contradict_some_all = indices.filter(x => {
      return mat_Gamma.graph.Some[x[0]][x[1]] == 1 &&
        mat_Gamma.graph.All[x[0]][neg_internal[x[1]]] == 1;
    });

    var contradict_more_least = indices.filter(x => {
      return mat_Gamma.graph.More[x[0]][x[1]] == 1 &&
        mat_Gamma.graph['At least'][x[1]][x[0]] == 1;
    });

    if (Phi[0] === 'All') {
      var x = vertices.indexOf(phi[1]);
      var y = vertices.indexOf(phi[2]);
      if (mg[x, y] == 1) {

      }
    }
  };

  var makeVariables = function (Gamma) {
    var polar_variables = [];
    for (var expr of Gamma) {
      variables.push(expr[1]);
      variables.push(expr[2]);

      polar_variables.push({
        constan: expr[1].constant,
        polarity: POS
      });

      polar_variables.push({
        constan: expr[1].constant,
        polarity: NEG
      });

      polar_variables.push({
        constan: expr[2].constant,
        polarity: POS
      });

      polar_variables.push({
        constan: expr[2].constant,
        polarity: NEG
      });
    }
    return polar_variables;
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
    var conclusion = '<div class="assumption">CON</div>'.replace('CON', proof.conclusion);
    var rule = proof.rule;
    var leaves = "";
    var assumpbox = "";

    for (var i = 0; i < assumptions.length; i++) {
      if (typeof assumptions[i] !== 'string') {
        assumpbox += drawProofTree(assumptions[i]);
      } else {
        assumpbox += '<div class="assumption">CON</div>'.replace('CON', assumptions[i]);
      }
    }

    leaves += '<div class="assumpbox">ASSUMP</div>'.replace('ASSUMP', assumpbox);
    leaves += '<div class="rule">RULE</div>'.replace('RULE', rule);

    leaves = '<div class="leaves">CON</div>'.replace('CON', leaves);
    var root = '<div class="root">CON</div>'.replace('CON', conclusion);
    var tree = '<div class="proof">LEAFROOT</div>';
    tree = tree.replace('LEAF', leaves);
    tree = tree.replace('ROOT', root);
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
      right_constant = _negation(right_constant);
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