let logic = {};

logic.symbolp = function (x) {
    return typeof x == 'string';
}

function varp(x) {
    return typeof x === 'string' && x.length !== 0 && x[0] !== x[0].toLowerCase();
}

function constantp(x) {
    return typeof x === 'string' && x.length !== 0 && x[0] === x[0].toLowerCase();
}

function stringp(x) {
    return typeof x === 'string' && x.length > 1 && x[0] === '"' && x[x.length - 1] === '"';
}

var counter = 0;

function newvar() {
    counter++;
    return 'V' + counter;
}

function newsym() {
    counter++;
    return 'c' + counter;
}

logic.seq = function () {
    var exp = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
        exp[i] = arguments[i];
    }
    return exp;
}

function makeatom(r, x, y) {
    var exp = new Array(3);
    exp[0] = r;
    exp[1] = x;
    exp[2] = y;
    return exp;
}

function makeequality(x, y) {
    return logic.seq('equal', x, y)
}

function makenegation(p) {
    return logic.seq('not', p)
}

function makeconjunction(p, q) {
    return logic.seq('and', p, q)
}

function makedisjunction(p, q) {
    return logic.seq('or', p, q)
}

function makeclause(p, q) {
    var exp = new Array(2);
    exp[0] = 'clause';
    exp[1] = p;
    exp[2] = q;
    return exp
}

function makeimplication(head, body) {
    return logic.seq('implication', head, body)
}

function makeequivalence(head, body) {
    return logic.seq('equivalence', head, body)
}

function makeuniversal(variable, scope) {
    return logic.seq('forall', variable, scope)
}

function makeexistential(variable, scope) {
    return logic.seq('exists', variable, scope)
}

function makeclause() {
    var exp = new Array(0);
    exp[0] = 'clause';
    return exp
}

function makeclause1(p) {
    var exp = new Array(0);
    exp[0] = 'clause';
    exp[1] = p;
    return exp
}

function makeclause2(p, q) {
    var exp = new Array(0);
    exp[0] = 'clause';
    exp[1] = p;
    exp[2] = q;
    return exp
}

function makestep() {
    var exp = new Array(arguments.length + 1);
    exp[0] = 'step';
    for (var i = 0; i < arguments.length; i++) {
        exp[i + 1] = arguments[i]
    };
    return exp
}

function makeproof() {
    var exp = new Array(1);
    exp[0] = 'proof';
    return exp
}

function maksand(s) {
    if (s.length === 0) {
        return 'true'
    };
    if (s.length === 1) {
        return s[0]
    };
    return logic.seq('and').concat(s)
}

function maksor(s) {
    if (s.length === 0) {
        return 'false'
    };
    if (s.length === 1) {
        return s[0]
    };
    return logic.seq('or').concat(s)
}

function equalp(p, q) {
    if (logic.symbolp(p)) {
        if (logic.symbolp(q)) {
            return p == q
        } else {
            return false
        }
    };
    if (logic.symbolp(q)) {
        return false
    };
    if (p.length != q.length) {
        return false
    };
    for (var i = 0; i < p.length; i++) {
        if (!equalp(p[i], q[i])) {
            return false
        }
    };
    return true
}

function empty() {
    return new Array(0)
}

function rest(l) {
    var m = l.slice(1, l.length);
    return m
}

function adjoin(x, s) {
    if (!findq(x, s)) {
        s.push(x)
    };
    return s
}

function adjoinit(x, s) {
    if (find(x, s)) {
        return s
    } else {
        s[s.length] = x;
        return s
    }
}

function findq(x, s) {
    for (var i = 0; i < s.length; i++) {
        if (x == s[i]) {
            return true
        }
    };
    return false
}

function find(x, s) {
    for (var i = 0; i < s.length; i++) {
        if (equalp(x, s[i])) {
            return true
        }
    };
    return false
}

function append(l1, l2) {
    var m = l1.concat(l2);
    return m
}

function subst(x, y, z) {
    if (z === y) {
        return x
    };
    if (logic.symbolp(z)) {
        return z
    };
    if (z[0] == 'forall' && z[1] === y) {
        return z
    };
    if (z[0] == 'exists' && z[1] === y) {
        return z
    };
    var exp = new Array(z.length);
    for (var i = 0; i < z.length; i++) {
        exp[i] = subst(x, y, z[i])
    }
    return exp
}

function substit(x, y, z) {
    if (z === y) {
        return x
    };
    if (logic.symbolp(z)) {
        return z
    };
    if (z[0] === 'forall' && (z[1] === y || amongp(z[1], x))) {
        return z
    };
    if (z[0] === 'exists' && (z[1] === y || amongp(z[1], x))) {
        return z
    };
    var exp = new Array(z.length);
    for (var i = 0; i < z.length; i++) {
        exp[i] = subst(x, y, z[i])
    }
    return exp
}

function substitute(p, q, r) {
    if (logic.symbolp(r)) {
        if (r == p) {
            return q
        } else {
            return r
        }
    };
    var exp = empty();
    for (var i = 0; i < r.length; i++) {
        exp[exp.length] = substitute(p, q, r[i])
    };
    if (equalp(exp, p)) {
        return q
    } else {
        return exp
    }
}

function substitutions(p, q, r) {
    if (logic.symbolp(r)) {
        if (r === p) {
            return logic.seq(r, q)
        } else {
            return logic.seq(r)
        }
    };
    if (r[0] === 'forall' && (amongp(r[1], p) || amongp(r[1], q))) {
        return logic.seq(r)
    };
    if (r[0] === 'exists' && (amongp(r[1], p) || amongp(r[1], q))) {
        return logic.seq(r)
    };
    return substitutionsexp(p, q, r, 0)
}

function substitutionsexp(p, q, r, n) {
    if (n == r.length) {
        return logic.seq(empty())
    };
    var firsts = substitutions(p, q, r[n]);
    var rests = substitutionsexp(p, q, r, n + 1);
    var results = empty();
    for (var i = 0; i < firsts.length; i++) {
        for (var j = 0; j < rests.length; j++) {
            exp = logic.seq(firsts[i]).concat(rests[j]);
            results[results.length] = exp;
            if (equalp(exp, p)) {
                results[results.length] = q
            }
        }
    }
    return results
}

function substitutablep(x, y, z) {
    if (logic.symbolp(z)) {
        return true
    };
    if (z[0] === 'not') {
        return substitutablep(x, y, z[1])
    };
    if (z[0] === 'and' || z[0] === 'or' || z[0] === 'implication') {
        for (var i = 1; i < z.length; i++) {
            if (!substitutablep(x, y, z[i])) {
                return false
            }
        };
        return true
    };
    if (z[0] === 'equivalence') {
        return substitutablep(x, y, z[1]) && substitutablep(x, y, z[2])
    };
    if (z[0] === 'forall') {
        return (z[1] === y || substitutablep(x, y, z[2]))
    };
    if (z[0] === 'exists') {
        return (z[1] === y || !amongp(z[1], x) && substitutablep(x, y, z[2]))
    };
    return true
}

//------------------------------------------------------------------------------
// Lists
//------------------------------------------------------------------------------

var nil = 'nil';

function nullp(l) {
    return l == 'nil'
}

function cons(x, l) {
    var cell = new Array(2);
    cell[0] = x;
    cell[1] = l;
    return cell
}

function car(l) {
    return l[0]
}

function cdr(l) {
    return l[1]
}

function memberp(x, l) {
    if (nullp(l)) {
        return false
    };
    if (car(l) == x) {
        return true
    };
    if (memberp(x, cdr(l))) {
        return true
    };
    return false
}

function amongp(x, y) {
    if (logic.symbolp(y)) {
        return x == y
    };
    for (var i = 0; i < y.length; i++) {
        if (amongp(x, y[i])) {
            return true
        }
    }
    return false
}

function acons(x, y, al) {
    return cons(cons(x, y), al)
}

function assoc(x, al) {
    if (nullp(al)) {
        return false
    };
    if (x == car(car(al))) {
        return car(al)
    };
    return assoc(x, cdr(al))
}

function nreverse(l) {
    if (nullp(l)) {
        return nil
    } else {
        return nreversexp(l, nil)
    }
}

function nreversexp(l, ptr) {
    if (cdr(l) == nil) {
        l[1] = ptr;
        return l
    } else {
        var rev = nreversexp(cdr(l), l);
        l[1] = ptr;
        return rev
    }
}

//------------------------------------------------------------------------------
// Conversion Subroutines
//------------------------------------------------------------------------------

function clauses(p) {
    p = implicationsout(p);
    p = negationsin(p);
    p = standardizer(p);
    p = existsout(p);
    p = allsout(p);
    p = distribute(p);
    return operatorsout(p)
}

function implicationsout(p) {
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'not') {
        return makenegation(implicationsout(p[1]))
    };
    if (p[0] == 'and') {
        var result = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            result.push(implicationsout(p[i]))
        };
        return result
    };
    if (p[0] == 'or') {
        var result = logic.seq('or');
        for (var i = 1; i < p.length; i++) {
            result.push(implicationsout(p[i]))
        };
        return result
    };
    if (p[0] == 'implication') {
        return makedisjunction(makenegation(implicationsout(p[1])), implicationsout(p[2]))
    };
    if (p[0] == 'equivalence') {
        return makeconjunction(makedisjunction(implicationsout(p[1]), makenegation(implicationsout(p[2]))), makedisjunction(makenegation(implicationsout(p[1])), implicationsout(p[2])))
    };
    if (p[0] == 'forall') {
        return logic.seq('forall', p[1], implicationsout(p[2]))
    };
    if (p[0] == 'exists') {
        return logic.seq('exists', p[1], implicationsout(p[2]))
    };
    return p
}

function negationsin(p) {
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'not') {
        return negate(p[1])
    };
    if (p[0] == 'and') {
        var result = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            result.push(negationsin(p[i]))
        };
        return result
    };
    if (p[0] == 'or') {
        var result = logic.seq('or');
        for (var i = 1; i < p.length; i++) {
            result.push(negationsin(p[i]))
        };
        return result
    };
    if (p[0] == 'forall') {
        return makeuniversal(p[1], negationsin(p[2]))
    };
    if (p[0] == 'exists') {
        return makeexistential(p[1], negationsin(p[2]))
    };
    return p
}

function negate(p) {
    if (logic.symbolp(p)) {
        return makenegation(p)
    };
    if (p[0] == 'not') {
        return negationsin(p[1])
    };
    if (p[0] == 'and') {
        var result = logic.seq('or');
        for (var i = 1; i < p.length; i++) {
            result.push(negate(p[i]))
        };
        return result
    };
    if (p[0] == 'or') {
        var result = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            result.push(negate(p[i]))
        };
        return result
    };
    if (p[0] == 'forall') {
        return makeexistential(p[1], negate(p[2]))
    };
    if (p[0] == 'exists') {
        return makeuniversal(p[1], negate(p[2]))
    };
    return makenegation(p)
}

function standardizer(p) {
    return stdize(p, freevars(p, [], nil), nil)
}

function stdize(p, al, bl) {
    if (varp(p)) {
        var dum = assoc(p, bl);
        if (dum) {
            return cdr(dum)
        };
        return p
    };
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] === 'forall' || p[0] === 'exists') {
        if (find(p[1], al)) {
            var replacement = newvar();
            bl = acons(p[1], replacement, bl);
            return logic.seq(p[0], replacement, stdize(p[2], al, bl))
        };
        al.push(p[1]);
        return logic.seq(p[0], p[1], stdize(p[2], al, bl))
    };
    var out = logic.seq(p[0]);
    for (var i = 1; i < p.length; i++) {
        out.push(stdize(p[i], al, bl))
    };
    return out
}

function existsout(p) {
    return disexistentialize(p, freevariables(p, nil, nil), nil)
}

function freevariables(p, al, bl) {
    if (varp(p)) {
        if (memberp(p, al)) {
            return al
        };
        if (memberp(p, bl)) {
            return al
        };
        return cons(p, al)
    };
    if (logic.symbolp(p)) {
        return al
    };
    if (p[0] == 'forall') {
        return freevariables(p[2], al, cons(p[1], bl))
    };
    if (p[0] == 'exists') {
        return freevariables(p[2], al, cons(p[1], bl))
    };
    for (var i = 1; i < p.length; i++) {
        al = freevariables(p[i], al, bl)
    };
    return al
}

function freevars(p, al, bl) {
    if (varp(p)) {
        if (find(p, al)) {
            return al
        };
        if (memberp(p, bl)) {
            return al
        };
        return adjoin(p, al)
    };
    if (logic.symbolp(p)) {
        return al
    };
    if (p[0] == 'forall') {
        return freevars(p[2], al, cons(p[1], bl))
    };
    if (p[0] == 'exists') {
        return freevars(p[2], al, cons(p[1], bl))
    };
    for (var i = 1; i < p.length; i++) {
        al = freevars(p[i], al, bl)
    };
    return al
}

function disexistentialize(p, al, bl) {
    if (varp(p)) {
        var dum = assoc(p, bl);
        if (dum != false) {
            return cdr(dum)
        } else {
            return p
        }
    };
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'not') {
        return makenegation(disexistentialize(p[1], al, bl))
    };
    if (p[0] == 'and') {
        var result = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            result.push(disexistentialize(p[i], al, bl))
        };
        return result
    };
    if (p[0] == 'or') {
        var result = logic.seq('or');
        for (var i = 1; i < p.length; i++) {
            result.push(disexistentialize(p[i], al, bl))
        };
        return result
    };
    if (p[0] == 'forall') {
        return makeuniversal(p[1], disexistentialize(p[2], cons(p[1], al), bl))
    };
    if (p[0] == 'exists') {
        return disexistentialize(p[2], al, acons(p[1], skolemterm(al), bl))
    };
    var exp = empty();
    for (var i = 0; i < p.length; i++) {
        exp[exp.length] = disexistentialize(p[i], al, bl)
    };
    return exp
}

function skolemterm(al) {
    var exp = logic.seq(newsym());
    while (!nullp(al)) {
        exp[exp.length] = car(al);
        al = cdr(al)
    }
    return exp
}

function allsout(p) {
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'not') {
        return makenegation(allsout(p[1]))
    };
    if (p[0] == 'and') {
        var result = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            result.push(allsout(p[i]))
        };
        return result
    };
    if (p[0] == 'or') {
        var result = logic.seq('or');
        for (var i = 1; i < p.length; i++) {
            result.push(allsout(p[i]))
        };
        return result
    };
    if (p[0] == 'forall') {
        return allsout(p[2])
    };
    return p
}

function distribute(p) {
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'and') {
        return distributeand(p)
    };
    if (p[0] == 'or') {
        return distributeorn(p, 1)
    };
    return p
}

function distributeand(p) {
    var exp = empty();
    exp[0] = 'and';
    for (var i = 1; i < p.length; i++) {
        var arg = distribute(p[i]);
        if (logic.symbolp(arg)) {
            exp[exp.length] = arg
        } else if (arg[0] == 'and') {
            exp = exp.concat(arg.slice(1, arg.length))
        } else
            exp[exp.length] = arg
    }
    return exp
}

function distributeorn(p, n) {
    if (n == p.length - 1) {
        return distribute(p[n])
    };
    return disjoin(distribute(p[n]), distributeorn(p, n + 1))
}

function disjoin(p, q) {
    if (logic.symbolp(p)) {
        if (logic.symbolp(q)) {
            return makedisjunction(p, q)
        };
        if (q[0] == 'or') {
            return logic.seq('or').concat(logic.seq(p), q.slice(1, q.length))
        };
        if (q[0] == 'and') {
            var exp = logic.seq('and');
            for (var i = 1; i < q.length; i++) {
                exp[i] = disjoin(p, q[i])
            };
            return exp
        };
        return makedisjunction(p, q)
    };
    if (p[0] == 'or') {
        if (logic.symbolp(q)) {
            p = p.slice(0, p.length);
            p.push(q);
            return p
        };
        if (q[0] == 'or') {
            return p.concat(q.slice(1, q.length))
        };
        if (q[0] == 'and') {
            var exp = logic.seq('and');
            for (var i = 1; i < q.length; i++) {
                exp[i] = disjoin(p, q[i])
            };
            return exp
        }
        p = p.slice(0, p.length);
        p.push(q);
        return p
    };
    if (p[0] == 'and') {
        if (logic.symbolp(q)) {
            var exp = logic.seq('and');
            for (var i = 1; i < p.length; i++) {
                exp[i] = disjoin(p[i], q)
            };
            return exp
        };
        if (q[0] == 'or') {
            var exp = logic.seq('and');
            for (var i = 1; i < p.length; i++) {
                exp[i] = disjoin(p[i], q)
            };
            return exp
        }
        if (q[0] == 'and') {
            var exp = logic.seq('and');
            for (var i = 1; i < p.length; i++) {
                for (var j = 1; j < q.length; j++) {
                    exp[exp.length] = disjoin(p[i], q[j])
                }
            };
            return exp
        }
        var exp = logic.seq('and');
        for (var i = 1; i < p.length; i++) {
            exp[i] = disjoin(p[i], q)
        };
        return exp
    }

    if (logic.symbolp(q)) {
        return makedisjunction(p, q)
    };
    if (q[0] == 'or') {
        return logic.seq('or').concat(logic.seq(p), q.slice(1, q.length))
    };
    if (q[0] == 'and') {
        var exp = logic.seq('and');
        for (var i = 1; i < q.length; i++) {
            exp[i] = disjoin(p, q[i])
        };
        return exp
    }
    return makedisjunction(p, q)
}

function operatorsout(p) {
    if (logic.symbolp(p)) {
        return logic.seq(clausify(p))
    };
    if (p[0] == 'and') {
        var exp = empty();
        for (var i = 1; i < p.length; i++) {
            exp[exp.length] = clausify(p[i])
        };
        return exp
    };
    if (p[0] == 'or') {
        return logic.seq(clausify(p))
    };;
    return logic.seq(clausify(p))
}

function clausify(p) {
    if (logic.symbolp(p)) {
        return makeclause1(p)
    };
    if (p[0] == 'or') {
        var exp = p.slice(1, p.length);
        exp.unshift('clause');
        return uniquify(exp)
    };
    if (p[0] == 'clause') {
        return p
    };
    return makeclause1(p)
}

function uniquify(ins) {
    var outs = logic.seq();
    for (var i = 0; i < ins.length; i++) {
        outs = adjoinit(ins[i], outs)
    };
    return outs
}

//------------------------------------------------------------------------------
// Input and Output
//------------------------------------------------------------------------------

function read(str) {
    try {
        return fastread(str)
    } catch (err) {
        return 'error'
    }
}

logic.readdata = function (str) {
    try {
        return fastreaddata(str)
    } catch (err) {
        return logic.seq()
    }
}

function fastread(str) {
    return parse(scan(str))
}

function fastreaddata(str) {
    return parsedata(scan(str))
}

//------------------------------------------------------------------------------

var input = '';
var output = '';
var current = 0;

function scan(str) {
    input = str;
    output = new Array(0);
    var cur = 0;
    var len = input.length;
    while (cur < len) {
        var charcode = input.charCodeAt(cur);
        if (charcode <= 32) {
            cur++
        } else if (charcode === 38) {
            output[output.length] = '&';
            cur++
        } else if (charcode === 40) {
            output[output.length] = 'lparen';
            cur++
        } else if (charcode === 41) {
            output[output.length] = 'rparen';
            cur++
        } else if (charcode === 44) {
            output[output.length] = 'comma';
            cur++
        } else if (charcode === 46) {
            output[output.length] = '.';
            cur++
        } else if (charcode === 58) {
            output[output.length] = ':';
            cur++
        } else if (charcode === 60) {
            cur = scanbothsym(cur)
        } else if (charcode === 61) {
            cur = scanthussym(cur)
        } else if (charcode === 91) {
            output[output.length] = '[';
            cur++
        } else if (charcode === 93) {
            output[output.length] = ']';
            cur++
        } else if (charcode === 123) {
            output[output.length] = '{';
            cur++
        } else if (charcode === 124) {
            output[output.length] = '|';
            cur++
        } else if (charcode === 125) {
            output[output.length] = '}';
            cur++
        } else if (charcode === 126) {
            output[output.length] = '~';
            cur++
        } else if (idcharp(charcode)) {
            cur = scansymbol(cur)
        } else {
            throw 'error'
        }
    };
    return output
}

function scanbothsym(cur) {
    if (input.length > cur + 1 && input.charCodeAt(cur + 1) === 61 && input.length > cur + 2 && input.charCodeAt(cur + 2) === 62) {
        output[output.length] = '<=>';
        return cur + 3
    };
    throw 'error'
}

function scanthussym(cur) {
    if (input.length > cur + 1 && input.charCodeAt(cur + 1) === 62) {
        output[output.length] = '=>';
        return cur + 2
    };
    throw 'error'
}

function scansymbol(cur) {
    var exp = '';
    while (cur < input.length) {
        if (idcharp(input.charCodeAt(cur))) {
            exp = exp + input[cur];
            cur++
        } else
            break
    };
    if (exp != '') {
        output[output.length] = exp
    };
    return cur
}

function idcharp(charcode) {
    if (charcode >= 47 && charcode <= 56) {
        return true
    };
    if (charcode >= 65 && charcode <= 90) {
        return true
    };
    if (charcode >= 97 && charcode <= 122) {
        return true
    };
    if (charcode == 95) {
        return true
    };
    return false
}

//------------------------------------------------------------------------------

function parse(str) {
    input = str;
    current = 0;
    return parsexp('lparen', 'rparen')
}

function parsedata(str) {
    input = str;
    current = 0;
    exp = logic.seq();
    while (current < input.length) {
        if (input[current] == '.') {
            current++
        } else {
            exp[exp.length] = parsexp('lparen', 'rparen')
        }
    };
    return exp
}

function parsexp(lop, rop) {
    if (current >= input.length) {
        throw 'error'
    };
    var left = parseprefix(rop);
    while (current < input.length) {
        if (input[current] === 'lparen') {
            left = parseatom(left)
        } else if (!find(input[current], infixes)) {
            return left
        } else if (precedencep(lop, input[current])) {
            return left
        } else {
            left = parseinfix(left, input[current], rop)
        }
    };
    return left
}

function parseatom(left) {
    current++;
    var exp = logic.seq(left);
    if (input[current] === 'rparen') {
        current++;
        return exp
    };
    while (current < input.length) {
        exp.push(parsexp('comma', 'rparen'));
        if (input[current] === 'rparen') {
            current++;
            return exp
        } else if (input[current] === 'comma') {
            current++
        } else {
            throw 'error'
        }
    };
    return exp
}

function parseprefix(rop) {
    var left = input[current];
    if (left === '~') {
        return parsenegation(rop)
    };
    if (left === '{') {
        return parseclause()
    };
    if (left === '[') {
        return parseskolem()
    };
    if (left === 'lparen') {
        return parseparenexp()
    };
    if (identifierp(left)) {
        current++;
        return left
    };
    throw 'error'
}

function parsenegation(rop) {
    current++;
    return makenegation(parsexp('~', rop))
}

function parseclause() {
    current++;
    var exp = logic.seq('clause');
    if (input[current] === '}') {
        current++;
        return exp
    };
    while (current < input.length) {
        exp.push(parsexp('comma', 'rparen'));
        if (input[current] === '}') {
            current++;
            return exp
        } else if (input[current] === 'comma') {
            current++
        } else {
            throw 'error'
        }
    };
    return exp
}

function parseskolem() {
    current++;
    if (input[current] === ']') {
        throw 'error'
    };
    var sk = parsexp('comma', 'comma');
    if (input[current] !== ']') {
        throw 'error'
    };
    current++;
    return logic.seq('skolem', sk)
}

function parseparenexp() {
    current++;
    var left = parsexp('lparen', 'rparen');
    current++;
    return left
}

function parseinfix(left, op, rop) {
    if (op == ':') {
        return parsequantifier(left, rop)
    };
    if (op == '&') {
        return parseand(left, rop)
    };
    if (op == '|') {
        return parseor(left, rop)
    };
    if (op == '=>') {
        return parseimplication(left, rop)
    };
    if (op == '<=>') {
        return parseequivalence(left, rop)
    };
    throw 'error'
}

function parsequantifier(left, rop) {
    current++;
    var variable = left.slice(1, left.length);
    if (left[0] === 'A' && varp(variable)) {
        return makeuniversal(variable, parsexp(':', rop))
    };
    if (left[0] === 'E' && varp(variable)) {
        return makeexistential(variable, parsexp(':', rop))
    };
    throw 'error'
}

function parseand(left, rop) {
    current++;
    return makeconjunction(left, parsexp('&', rop))
}

function parseor(left, rop) {
    current++;
    return makedisjunction(left, parsexp('|', rop))
}

function parseimplication(left, rop) {
    current++;
    return makeimplication(left, parsexp('=>', rop))
}

function parseequivalence(left, rop) {
    current++;
    return makeequivalence(left, parsexp('<=>', rop))
}

var infixes = [':', '&', '|', '=>', '<=>']

var tokens = [':', '~', '&', '|', '=>', '<=>', '[', ']', 'comma', 'lparen', 'rparen', '.', '{', '}']

function identifierp(x) {
    return !find(x, tokens)
}

var precedence = [':', '~', '&', '|', '=>', '<=>']

function precedencep(lop, rop) {
    for (var i = 0; i < precedence.length; i++) {
        if (precedence[i] === rop) {
            return false
        };
        if (precedence[i] === lop) {
            return true
        }
    };
    return false
}

function parenp(lop, op, rop) {
    return lop === op || op === rop || precedencep(lop, op) || precedencep(rop, op)
}

function smoothdata(data) {
    var exp = '';
    var n = data.length;
    for (var i = 0; i < n; i++) {
        exp = exp + smooth(data[i]) + '<br/>'
    }
    return exp
}

function smooth(p) {
    if (logic.symbolp(p)) {
        return p
    };
    var exp = p[0] + '(';
    if (p.length > 1) {
        exp = exp + smooth(p[1])
    };
    for (var i = 2; i < p.length; i++) {
        exp = exp + ',' + smooth(p[i])
    }
    exp = exp + ')';
    return exp
}

function grindproof(proof) {
    var exp = '';
    exp = exp + '<table cellpadding="4" cellspacing="0" border="1">';
    exp = exp + '<tr bgcolor="#bbbbbb">';
    exp = exp + '<td>&nbsp;</td>';
    //exp = exp + '<td><input type="checkbox" name="Selection"/></td>';
    exp = exp + '<th>Step</th><th>Proof</th><th>Justification</th>';
    exp = exp + '</tr>';
    for (var i = 0; i < proof.length; i = i + 3) {
        exp = exp + '<tr id="0">';
        exp = exp + '<td bgcolor="#eeeeee"><input id="' + (i / 3 + 1) + '" type="checkbox"/></td>';
        exp = exp + '<td align="center" bgcolor="#eeeeee">' + (i / 3 + 1) + '</td>';
        exp = exp + '<td>' + grind(proof[i + 1]) + '</td>';
        exp = exp + '<td bgcolor="#eeeeee">' + proof[i + 2] + '</td>';
        exp = exp + '</tr>'
    };
    exp = exp + '</table>';
    return exp
}

function grinddata(data) {
    var exp = '';
    var n = data.length;
    for (var i = 0; i < n; i++) {
        exp = exp + grind(data[i]) + '<br/>'
    }
    return exp
}

function grindem(data) {
    var exp = '';
    var n = data.length;
    for (var i = 0; i < n; i++) {
        exp = exp + grind(data[i]) + '\n'
    }
    return exp
}

logic.grind = function (p) {
    return grindit(p, 'lparen', 'rparen')
}

function grindit(p, lop, rop) {
    if (logic.symbolp(p)) {
        return p
    };
    if (p[0] == 'equal') {
        return grindequality(p)
    };
    if (p[0] == 'skolem') {
        return grindskolem(p)
    };
    if (p[0] == 'not') {
        return grindnegation(p, rop)
    };
    if (p[0] == 'and') {
        return grindand(p, lop, rop)
    };
    if (p[0] == 'or') {
        return grindor(p, lop, rop)
    };
    if (p[0] == 'implication') {
        return grindimplication(p, lop, rop)
    };
    if (p[0] == 'equivalence') {
        return grindequivalence(p, lop, rop)
    };
    if (p[0] == 'clause') {
        return grindclause(p)
    };
    if (p[0] == 'forall') {
        return grinduniversal(p, lop, rop)
    };
    if (p[0] == 'exists') {
        return grindexistential(p, lop, rop)
    };
    return grindatom(p)
}

function grindequality(p) {
    return grind(p[1]) + '=' + grind(p[2])
}

function grindatom(p) {
    var n = p.length;
    var exp = p[0] + '(';
    if (n > 1) {
        exp += grind(p[1])
    };
    for (var i = 2; i < n; i++) {
        exp = exp + ',' + grind(p[i])
    }
    exp += ')';
    return exp
}

function grindskolem(p) {
    return '[' + grind(p[1]) + ']'
}

function grindnegation(p, rop) {
    return '~' + grindit(p[1], '~', rop)
}

function grindand(p, lop, rop) {
    var exp = '';
    if (p.length == 1) {
        return 'false'
    };
    if (p.length == 2) {
        return grind(p[1], lop, rop)
    };
    var parens = parenp(lop, '&', rop);
    if (parens) {
        lop = 'lparen';
        rop = 'rparen'
    };
    if (parens) {
        exp = '('
    };
    exp = exp + grindit(p[1], lop, '&');
    for (var i = 2; i < p.length - 1; i++) {
        exp = exp + ' & ' + grindit(p[i], '&', '&')
    };
    exp = exp + ' & ' + grindit(p[p.length - 1], '&', rop);
    if (parens) {
        exp = exp + ')'
    };
    return exp
}

function grindor(p, lop, rop) {
    var exp = '';
    if (p.length == 1) {
        return 'false'
    };
    if (p.length == 2) {
        return grind(p[1], lop, rop)
    };
    var parens = parenp(lop, '|', rop);
    if (parens) {
        lop = 'lparen';
        rop = 'rparen'
    };
    if (parens) {
        exp = '('
    };
    exp = exp + grindit(p[1], lop, '|');
    for (var i = 2; i < p.length - 1; i++) {
        exp = exp + ' | ' + grindit(p[i], '|', '|')
    };
    exp = exp + ' | ' + grindit(p[p.length - 1], '|', rop);
    if (parens) {
        exp = exp + ')'
    };
    return exp
}

function grindimplication(p, lop, rop) {
    var exp = '';
    var parens = parenp(lop, '=>', rop);
    if (parens) {
        lop = 'lparen';
        rop = 'rparen'
    };
    if (parens) {
        exp = '('
    };
    exp = exp + grindit(p[1], lop, '=>') + ' => ' + grindit(p[2], '=>', rop);
    if (parens) {
        exp = exp + ')'
    };
    return exp
}

function grindequivalence(p, lop, rop) {
    var exp = '';
    var parens = parenp(lop, '<=>', rop);
    if (parens) {
        lop = 'lparen';
        rop = 'rparen'
    };
    if (parens) {
        exp = '('
    };
    exp = exp + grindit(p[1], lop, '<=>') + ' <=> ' + grindit(p[2], '<=>', rop);
    if (parens) {
        exp = exp + ')'
    };
    return exp
}

function grinduniversal(p, lop, rop) {
    return 'A' + grindit(p[1], lop, ':') + ':' + grindit(p[2], ':', rop)
}

function grindexistential(p, lop, rop) {
    return 'E' + grindit(p[1], lop, ':') + ':' + grindit(p[2], ':', rop)
}

function grindclause(p) {
    var exp = '{';
    if (p.length > 1) {
        exp = exp + grind(p[1])
    };
    for (var i = 2; i < p.length; i++) {
        exp = exp + ',' + grind(p[i])
    };
    exp = exp + '}';
    return exp
}

function grindalist(al) {
    var exp = '';
    if (al == false) {
        return 'false'
    };
    for (var l = al; !nullp(l); l = cdr(l)) {
        exp = exp + car(car(l)) + ' = ' + grind(cdr(car(l))) + '\n'
    }
    return exp
}

function displayproof(proof) {
    var exp = '';
    exp = exp + '<table cellpadding="4" cellspacing="0" border="1">';
    exp = exp + '<tr bgcolor="#bbbbbb">';
    exp = exp + '<td><input type="checkbox" onClick="doselectall()"/></td>';
    exp = exp + '<th>Step</th><th>Proof</th><th>Justification</th>';
    exp = exp + '</tr>';
    for (var i = 1; i < proof.length; i++) {
        exp = exp + '<tr id="0">';
        exp = exp + '<td bgcolor="#eeeeee"><input id="' + i + '" type="checkbox"/></td>';
        exp = exp + '<td align="center" bgcolor="#eeeeee">' + i + '</td>';
        exp = exp + '<td>' + grind(proof[i][1]) + '</td>';
        exp += '<td bgcolor="#eeeeee">';
        exp += prettify(proof[i][2]);
        if (proof[i].length > 3) {
            exp += ': ' + proof[i][3];
            for (var j = 4; j < proof[i].length; j++) {
                exp += ', ' + proof[i][j]
            }
        };
        exp += '</td>';
        exp = exp + '</tr>'
    };
    exp = exp + '</table>';
    return exp
}

function prettify(str) {
    return str.replace('_', ' ')
}

function printseq(p) {
    if (p === true) {
        return 'true'
    };
    if (p === false) {
        return 'false'
    };
    if (typeof p == 'number') {
        return p
    };
    if (typeof p == 'string') {
        return '"' + p + '"'
    };
    var n = p.length;
    var exp = '(';
    if (n > 0) {
        exp += printseq(p[0])
    };
    for (var i = 1; i < n; i++) {
        exp = exp + ' ' + printseq(p[i])
    }
    exp += ')';
    return exp
}

function doxml() {
    var win = window.open();
    //win.document.open('text/html');
    win.document.writeln('&lt;?xml version="1.0"?&gt;<br/>\n');
    //win.document.writeln('&lt;?xml-stylesheet type="text/xsl" href="../stylesheets/proof.xsl"?&gt;<br/>\n');
    win.document.write(xmlproof());
    win.document.close()
}

function xmlproof() {
    var exp = '';
    exp += '&lt;proof&gt;<br/>\n';
    for (var i = 1; i < proof.length; i++) {
        exp += '  &lt;step&gt;<br/>';
        exp += '    &lt;number&gt;' + i + '&lt;/number&gt;<br/>\n';
        exp += '    &lt;sentence&gt;' + grind(proof[i][1]) + '&lt;/sentence&gt;<br/>\n';
        exp += '    &lt;justification&gt;' + prettify(proof[i][2]) + '&lt;/justification&gt;<br/>\n';
        for (var j = 3; j < proof[i].length; j++) {
            exp += '    &lt;antecedent&gt;' + proof[i][j] + '&lt;/antecedent&gt;<br/>\n'
        };
        exp += '  &lt;/step&gt;<br/>\n'
    };
    exp += '&lt;/proof&gt;<br/>\n';
    return exp
}

function xmlify(str) {
    str = str.replace('&', '&amp;');
    str = str.replace('<=>', '&lt;=&gt;');
    return str
}

exports.data = logic;