let truth = {},
	logic = require('./logic');

logic = logic.data;

truth.queryTruthTable = function (premises) {
	var result = "";
	var sentences = premises.split('\n');
	for (var i = 0; i < sentences.length; i++) {
		if (sentences[i] != "") {
			result += truth.dotruthtable(sentences[i]);
		}
	}
	return result;
}

truth.dotruthtable = function (premise) {
	var pl = logic.readdata(premise);
	var cl = logic.seq();

	for (var i = 0; i < pl.length; i++) {
		cl = truth.getconstants(pl[i], cl);
	}

	return truth.formattruthtable(cl, pl);
}

truth.formattruthtable = function (cl, pl) {
	exp = '<table cellspacing="0" cellpadding="2" border="1">';
	exp = exp + '<tr bgcolor="#455767">';
	exp = exp + '<th colspan="' + cl.length + '">Constants</th>';
	exp = exp + '<td></td>';

	if (pl.length > 0) {
		exp = exp + '<th colspan="' + pl.length + '">Premises</th>';
	}

	exp = exp + '<td></td>';
	exp = exp + '</tr>';
	exp = exp + '<tr bgcolor="#455767">';
	for (var i = 0; i < cl.length; i++) {
		exp = exp + '<th style="min-width:40px">' + cl[i] + '</th>';
	}

	exp = exp + '<td></td>';
	for (var j = 0; j < pl.length; j++) {
		exp = exp + '<th style="min-width:40px">' + logic.grind(pl[j]) + '</th>';
	}

	exp = exp + '<td></td>';
	exp = exp + '</tr>';
	var nl = truth.databases(cl);

	for (var i = 0; i < nl.length; i++) {
		exp = exp + '<tr>';
		for (var j = 0; j < cl.length; j++) {
			exp = exp + '<td align="center">' + truth._pretty(truth.evaluate(cl[j], nl[i])) + '</td>';
		}

		exp = exp + '<td></td>';
		for (var j = 0; j < pl.length; j++) {
			exp = exp + '<td align="center">' + truth._pretty(truth.evaluate(pl[j], nl[i])) + '</td>';
		}
		exp = exp + '</tr>';
	}

	exp = exp + '</table></center>';
	return exp
}

truth._pretty = function (val) {
	if (val) {
		return '1';
	} else {
		return '0';
	}
}

//------------------------------------------------------------------------------
// Miscellaneous
//------------------------------------------------------------------------------

truth.constants = function (p) {
	return truth.getconstants(p, logic.seq());
}

truth.getconstants = function (p, nl) {
	if (logic.symbolp(p)) {
		if (!truth.itemp(p, nl)) {
			nl[nl.length] = p;
		}
	} else {
		for (var i = 1; i < p.length; i++) {
			nl = truth.getconstants(p[i], nl);
		}
	}
	return nl;
}

truth.itemp = function (p, nl) {
	for (var i = 0; i < nl.length; i++) {
		if (nl[i] == p) {
			return true;
		}
	}
	return false;
}

truth.databases = function (cl) {
	var al = logic.seq();
	var nl = logic.seq();
	truth.getdatabases(cl, 0, al, nl);
	return nl;
}

truth.getdatabases = function (cl, n, al, nl) {
	if (n === cl.length) {
		nl[nl.length] = truth.makedatabase(cl, al);
		return true;
	}
	al[n] = true;
	truth.getdatabases(cl, n + 1, al, nl);
	al[n] = false;
	truth.getdatabases(cl, n + 1, al, nl);
	return true;
}

truth.makedatabase = function (cl, al) {
	var db = logic.seq();
	for (var i = 0; i < cl.length; i++) {
		if (al[i]) {
			db[db.length] = cl[i]
		};
	}
	return db;
}

truth.evaluate = function (p, facts) {
	if (logic.symbolp(p)) {
		return truth.evalatom(p, facts)
	}
	if (p[0] == 'not') {
		return truth.evalnot(p, facts)
	}
	if (p[0] == 'and') {
		return truth.evaland(p, facts)
	}
	if (p[0] == 'or') {
		return truth.evalor(p, facts)
	}
	if (p[0] == 'implication') {
		return truth.evalimplication(p, facts)
	}
	if (p[0] == 'reduction') {
		return truth.evalreduction(p, facts)
	}
	if (p[0] == 'equivalence') {
		return truth.evalequivalence(p, facts)
	}
	return false;
}

truth.evalatom = function (p, facts) {
	for (var i = 0; i < facts.length; i++) {
		if (facts[i] == p) {
			return true;
		}
	}
	return false;
}

truth.evalnot = function (p, facts) {
	return !truth.evaluate(p[1], facts);
}

truth.evaland = function (p, facts) {
	for (var i = 1; i < p.length; i++) {
		if (!truth.evaluate(p[i], facts)) {
			return false;
		}
	}
	return true;
}

truth.evalor = function (p, facts) {
	for (var i = 1; i < p.length; i++) {
		if (truth.evaluate(p[i], facts)) {
			return true;
		}
	};
	return false;
}

truth.evalimplication = function (p, facts) {
	for (var i = 1; i < p.length - 1; i++) {
		if (!truth.evaluate(p[i], facts)) {
			return true;
		}
	}
	return truth.evaluate(p[p.length - 1], facts);
}

truth.evalreduction = function (p, facts) {
	for (var i = 2; i < p.length; i++) {
		if (!truth.evaluate(p[i], facts)) {
			return true;
		}
	}
	return truth.evaluate(p[1], facts);
}

truth.evalequivalence = function (p, facts) {
	return (truth.evaluate(p[1], facts) == truth.evaluate(p[2], facts));
}

exports.data = truth;