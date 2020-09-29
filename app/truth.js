let logic = require('./logic').data,
	syllogist = require('./syllogist').data;

let truth = (function () {
	var queryTruthTable = function (inputs, id) {
		var result = "";
		var sentences = inputs.split('\n');
		for (var i = 0; i < sentences.length; i++) {
			if (sentences[i] != "") {
				var sentence = sentences[i].split(':');
				var tag = sentence[0];

				if (tag == 'truth_table') {
					result += dotruthtable(sentence[1]);
				} else if (tag == 'follows') {
					sentence = sentence[1].split('=>');
					var premises = sentence[0].split(',');
					var conclusion = sentence[1];
					var subproof1 = {
						assumptions: ['All x are y', 'All y are z'],
						conclusion: 'All x are z',
						rule: 'BARBARA'
					};
					var subproof2 = {
						assumptions: ['All x are y', 'All y are z'],
						conclusion: 'All x are z',
						rule: 'BARBARA'
					};
					var subproof = {
						assumptions: [subproof1, subproof2],
						conclusion: 'All x are g',
						rule: 'BARBARA'
					};

					var proof = {
						assumptions: [subproof, 'All z are g'],
						conclusion: 'All x are g',
						rule: 'BARBARA'
					};
					result += syllogist.drawProofTree(proof);
				}
			}
		}
		return result;
	};

	var dotruthtable = function (premise) {
		var pl = logic.readdata(premise);
		var cl = logic.seq();

		for (var i = 0; i < pl.length; i++) {
			cl = getconstants(pl[i], cl);
		}

		return formattruthtable(cl, pl);
	};

	var formattruthtable = function (cl, pl) {
		exp = '<table cellspacing="0" cellpadding="2" border="1">';
		exp = exp + '<tr bgcolor="#F7F4F0">';
		exp = exp + '<th colspan="' + cl.length + '">Constants</th>';

		if (pl.length > 0) {
			exp = exp + '<th colspan="' + pl.length + '">Premises</th>';
		}

		exp = exp + '</tr>';
		exp = exp + '<tr bgcolor="#F7F4F0">';
		for (var i = 0; i < cl.length; i++) {
			exp = exp + '<th style="min-width:40px">' + cl[i] + '</th>';
		}

		for (var j = 0; j < pl.length; j++) {
			exp = exp + '<th style="min-width:40px">' + logic.grind(pl[j]) + '</th>';
		}

		exp = exp + '</tr>';
		var nl = databases(cl);

		for (i = 0; i < nl.length; i++) {
			exp = exp + '<tr>';
			for (j = 0; j < cl.length; j++) {
				exp = exp + '<td align="center">' + _pretty(evaluate(cl[j], nl[i])) + '</td>';
			}

			for (j = 0; j < pl.length; j++) {
				exp = exp + '<td align="center">' + _pretty(evaluate(pl[j], nl[i])) + '</td>';
			}
			exp = exp + '</tr>';
		}

		exp = exp + '</table>';
		return exp;
	};

	var _pretty = function (val) {
		if (val) {
			return '1';
		} else {
			return '0';
		}
	};

	//------------------------------------------------------------------------------
	// Miscellaneous
	//------------------------------------------------------------------------------

	var constants = function (p) {
		return getconstants(p, logic.seq());
	};

	var getconstants = function (p, nl) {
		if (logic.symbolp(p)) {
			if (!itemp(p, nl)) {
				nl[nl.length] = p;
			}
		} else {
			for (var i = 1; i < p.length; i++) {
				nl = getconstants(p[i], nl);
			}
		}
		return nl;
	};

	var itemp = function (p, nl) {
		for (var i = 0; i < nl.length; i++) {
			if (nl[i] == p) {
				return true;
			}
		}
		return false;
	};

	var databases = function (cl) {
		var al = logic.seq();
		var nl = logic.seq();
		getdatabases(cl, 0, al, nl);
		return nl;
	};

	var getdatabases = function (cl, n, al, nl) {
		if (n === cl.length) {
			nl[nl.length] = makedatabase(cl, al);
			return true;
		}
		al[n] = true;
		getdatabases(cl, n + 1, al, nl);
		al[n] = false;
		getdatabases(cl, n + 1, al, nl);
		return true;
	};

	var makedatabase = function (cl, al) {
		var db = logic.seq();
		for (var i = 0; i < cl.length; i++) {
			if (al[i]) {
				db[db.length] = cl[i];
			}
		}
		return db;
	};

	var evaluate = function (p, facts) {
		if (logic.symbolp(p)) {
			return evalatom(p, facts);
		}
		if (p[0] == 'not') {
			return evalnot(p, facts);
		}
		if (p[0] == 'and') {
			return evaland(p, facts);
		}
		if (p[0] == 'or') {
			return evalor(p, facts);
		}
		if (p[0] == 'implication') {
			return evalimplication(p, facts);
		}
		if (p[0] == 'reduction') {
			return evalreduction(p, facts);
		}
		if (p[0] == 'equivalence') {
			return evalequivalence(p, facts);
		}
		return false;
	};

	var evalatom = function (p, facts) {
		for (var i = 0; i < facts.length; i++) {
			if (facts[i] == p) {
				return true;
			}
		}
		return false;
	};

	var evalnot = function (p, facts) {
		return !evaluate(p[1], facts);
	};

	var evaland = function (p, facts) {
		for (var i = 1; i < p.length; i++) {
			if (!evaluate(p[i], facts)) {
				return false;
			}
		}
		return true;
	};

	var evalor = function (p, facts) {
		for (var i = 1; i < p.length; i++) {
			if (evaluate(p[i], facts)) {
				return true;
			}
		}
		return false;
	};

	var evalimplication = function (p, facts) {
		for (var i = 1; i < p.length - 1; i++) {
			if (!evaluate(p[i], facts)) {
				return true;
			}
		}
		return evaluate(p[p.length - 1], facts);
	};

	var evalreduction = function (p, facts) {
		for (var i = 2; i < p.length; i++) {
			if (!evaluate(p[i], facts)) {
				return true;
			}
		}
		return evaluate(p[1], facts);
	};

	var evalequivalence = function (p, facts) {
		return (evaluate(p[1], facts) == evaluate(p[2], facts));
	};

	return {
		queryTruthTable,
		dotruthtable,
		formattruthtable,
	};

})();

exports.data = truth;