def ina():
    var('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r')


def inb():
    var('s', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R')


def inc():
    var('S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'All', 'Some', 'new', 'non',
        'frogs', 'animals', 'insects', 'mammals')


def ind():
    var('skunks', 'rabbits', 'quadrupeds', 'deer', 'pests',
        'beautiful_creatures', 'ugly_creatures', 'birds', 'bats', 'horses',
        'ducks', 'pos', 'neg')


def initialize():
    ina()
    inb()
    inc()
    ind()


initialize()

## 1 axioms 'all x are x',
## 2 assumption in both justification and justificationc  NOT ON LIST
## 3 antitone for subsets
## 4 zero
## 5 one
## 6 subsets have smaller cardinality
## 7 antitone for card
## 8 card mix
## 9 the half rule
#####  1   At least as many   (q, pos)   as   (q, neg)     Assumption
#####  2   At least as many   (p, pos)   as   (p, neg)     Assumption
#####  3   At least as many   (p, pos)   as   (q, neg)     Half   1   2

## 10 the maj rule
#####  1   At least as many   (x, pos)     as    (x, neg)       Assumption
#####  2   At least as many   (y, pos)     as    (y, neg)       Assumption
#####  3   Some               ('non', x)   are   ('non', y)     Assumption
#####  4   Some               x            are   y              Maj   1   2   3
## 11 Barbara
## 12 cardinality transitivity
## 13 conversion for some
## 14 'some' rule
## 15 Darii
## 16 Some/Card
## 17 More-Some
## 18 More==>At least
## 19 TIPPING IS GONE:  there are more x than x',
##there are at least as many y as y' ===> some x is a y
## NOTE THAT TIPPING IS DERIVABLE FROM Strict Half and More-Some
####  1   At least as many   (y, pos)   as     (y, neg)     Assumption
####  2   There are more     (x, pos)   than   (x, neg)     Assumption
####  3   There are more     (x, pos)   than   (y, neg)     Strict Half   1 2
####  4   Some               x          are    y            More-Some   3

## 20 More-Left in connection with At Least transitivity
## 21 More-Right in connection with At Least transitivity

## only one of 20 /21 is needed!!

## 22 MORE-ANTI
## 23 MORE   some i is not a j,   all j are i ==> more i's than j's
## 24 INT  Some i exists and the j's are at least 1/2 ==> some j exists
## 25 Half-strict
####  1   At least as many   (y, pos)   as     (y, neg)     Assumption
####  2   There are more     (x, pos)   than   (x, neg)     Assumption
####  3   There are more     (x, pos)   than   (y, neg)     Strict Half   1 2


def cmp_to_key(mycmp):
    'Convert a cmp= function into a key= function'
    class K:
        def __init__(self, obj, *args):
            self.obj = obj
        def __lt__(self, other):
            return mycmp(self.obj, other.obj) < 0
        def __gt__(self, other):
            return mycmp(self.obj, other.obj) > 0
        def __eq__(self, other):
            return mycmp(self.obj, other.obj) == 0
        def __le__(self, other):
            return mycmp(self.obj, other.obj) <= 0
        def __ge__(self, other):
            return mycmp(self.obj, other.obj) >= 0

        def __ne__(self, other):
            return mycmp(self.obj, other.obj) != 0

    return K


def maxx(list_arg):
    if len(list_arg) == 0:
        return 0
    else:
        return max(list_arg)


def ssup(list):
    list2 = map(lambda x: x + 1, list)
    return maxx(list2)


def last(v):
    return (v[len(v) - 1])


def elementwise(operator, M, N):
    assert (M.parent() == N.parent())
    nc, nr = M.ncols(), M.nrows()
    A = copy(M.parent().zero_element())
    for r in xrange(nr):
        for c in xrange(nc):
            A[r, c] = operator(M[r, c], N[r, c])
    return A


def make_variables(Gamma):
    global variables
    global polarized_variables
    global pvars
    polarities = [pos, neg]
    vset = Set([])
    for item in Gamma:
        vset = vset.union(Set([item[1][0], item[2][0]]))
    variables = list(vset)
    variables.sort()
    # there had been a sorting line here, removed due to an apparent problem
    polarized_variables = list(cartesian_product([variables, polarities]))
    pvars = map(tuple, polarized_variables)


def make_eyes(Gamma):
    global Is
    global Ms
    for item in Gamma:
        if item[0] == 'Some':
            Is.append((tuple(item[1]), tuple(item[2])))
        elif item[0] == 'More':
            Ms.append((tuple(item[1]), tuple(item[2])))
            Is.append((tuple(item[1]), negation(tuple(item[2]))))


def Apply_using_numbers():
    global mg
    global mgc
    global mgmore
    global proven
    global g
    global g_c
    global zeros
    global ones
    global small_or_half
    global large_or_half
    global large_or_half_original
    global small
    global large
    global half
    global edgeset
    global cedgeset

    global lis

    mgtemp = (mg * mg).apply_map(sgn)  ## BARBARA
    for i in range(n):
        for j in range(n):
            if justification[i, j] == 0:
                #v1 = mg.row(i)
                #v2 = mg.column(j)
                #w1 = justification.column(i)
                #w2 = justification.column(j)
                #x1 = [((1 + w1[entry]+w2[entry]) * v1[entry] * v2[entry]) for entry in range(n)]
                #k_found = -1
                #shortest_length = -1
                #for entry in range(n):
                #    if (x1[entry] > 0  ) and ((x1[entry] < shortest_length) or (shortest_length == -1)):
                #        k_found = entry
                #        shortest_length = x1[entry]
                #if k_found > -1:
                #    mg[i,j] = 1
                #    justification[i,j] = 11
                #    proof_length[i,j] = shortest_length
                #    Barbara_cut_premise[i,j] = k_found
                k_found = exists(range(n), lambda k:
                                 (mg[i, k] == 1 and mg[k, j] == 1))
                if k_found[0] == True:
                    k = k_found[1]
                    justification[i, j] = 11
                    mg[i, j] = 1
                    proof_length[i,
                                 j] = 1 + proof_length[i, k] + proof_length[k,
                                                                            j]
                    Barbara_cut_premise[i, j] = k


## CARD TRANSITIVITY
    for i in range(n):
        for j in range(n):
            if mgc[i, j] == 0:
                k_found = exists(range(n), lambda k:
                                 (mgc[i, k] == 1 and mgc[k, j] == 1))
                if k_found[0] == True:
                    k = k_found[1]
                    justificationc[i, j] = 12
                    mgc[i, j] = 1
                    proof_lengthc[
                        i, j] = 1 + proof_lengthc[i, k] + proof_lengthc[k, j]
                    card_transitivity_cut_premise[i, j] = k

    for i in range(n):  ## DARII
        for j in range(n):
            if mgsome[i, j] == 0:
                k_found = exists(
                    range(n), lambda k: (mg[k, j] == 1 and mgsome[i, k] == 1))
                if k_found[0] == True:
                    k = k_found[1]
                    mgsome[i, j] = 1
                    justificationsome[i, j] = 15
                    proof_lengthsome[
                        i, j] = 1 + proof_length[k, j] + proof_lengthsome[i, k]
                    Darii_missing[i, j] = k

    for i in range(n):  ## CONVERSION
        for j in range(n):
            if mgsome[i, j] == 1 and mgsome[j, i] == 0:
                mgsome[j, i] = 1
                justificationsome[j, i] = 13
                proof_lengthsome[j, i] = 1 + proof_lengthsome[i, j]

    for i in range(n):  ## SOME RULE
        for j in range(n):
            if mgsome[i, j] == 1 and mgsome[i, i] == 0:
                mgsome[i, i] = 1
                justificationsome[i, i] = 14
                proof_lengthsome[i, i] = 1 + proof_lengthsome[i, j]
                Some_rule_missing_premise[0, i] = j

    for i in range(n):  ## ANTI
        for j in range(n):
            k = neg_internal[i]
            l = neg_internal[j]
            if mg[l, k] == 0 and mg[i, j] == 1:
                mg[l, k] = 1
                justification[l, k] = 3
                proof_length[l, k] = 1 + proof_length[i, j]

    zeros = [i for i in range(n) if mg[i, neg_internal[i]] == 1]
    ones = [i for i in range(n) if mg[neg_internal[i], i] == 1]
    #half = [i for i in range(n) if mgc[i,neg_internal[i]] == 1 and  mgc[neg_internal[i],i] == 1]
    small_or_half = [i for i in range(n) if mgc[i, neg_internal[i]] == 1]
    large_or_half = [i for i in range(n) if mgc[neg_internal[i], i] == 1]
    large_or_half_original = large_or_half
    small = list(Set(small_or_half).difference(Set(large_or_half)))
    large = list(Set(large_or_half).difference(Set(small_or_half)))
    half = list(Set(small_or_half).intersection(Set(large_or_half)))

    for zero in zeros:
        for i in range(n):
            if mg[zero, i] == 0:
                #proven.append([['All', zero, pvar],'zero',
                #[['All', zero, negation(zero)]]])
                mg[zero, i] = 1
                justification[zero, i] = 4
                proof_length[zero,
                             i] = 1 + proof_length[zero, neg_internal[zero]]

    for one in ones:  ## ONE
        for i in range(n):
            if mg[i, one] == 0:
                mg[i, one] = 1
                justification[i, one] = 5
                proof_length[i, one] = 1 + proof_length[neg_internal[one], one]

    for i in range(n):  ## SUBSET CARD
        for j in range(n):
            if (mg[i, j] == 1) and (mgc[i, j] == 0):
                mgc[i, j] = 1
                justificationc[i, j] = 6
                proof_lengthc[i, j] = 1 + proof_length[i, j]

    for i in range(n):  ## MORE-CARD
        for j in range(n):
            if (justificationmore[i, j] != 0) and (justificationc[i, j] == 0):
                mgc[i, j] = 1
                justificationc[i, j] = 18
                proof_lengthc[i, j] = 1 + proof_lengthmore[i, j]

    for i in range(n):  ## MORE-SOME
        for j in range(n):
            jneg = neg_internal[j]
            if (mgmore[j, i] == 1) and (mgsome[i, jneg] == 0):
                mgsome[i, jneg] = 1
                justificationsome[i, jneg] = 17
                proof_lengthsome[i, jneg] = 1 + proof_lengthmore[i, j]

    for i in range(
            n
    ):  ##  24 INT  Some i exists and the j's are at least 1/2 ==> some j exists
        for j in range(n):
            jneg = neg_internal[j]
            if (mgsome[j, j] == 0) and (mgsome[i, i] == 1) and (mgc[jneg, j]
                                                                == 1):
                mgsome[j, j] = 1
                justificationsome[j, j] = 24
                proof_lengthsome[
                    j, j] = 1 + proof_lengthc[jneg, j] + proof_lengthsome[i, i]
                Int_rule_missing_premise[0, j] = i

    for i in range(
            n):  # some i is not a j,   all j are i ==> more i's than j's
        for j in range(n):
            jneg = neg_internal[j]
            if (mgmore[j,i] == 0) \
            and (mgsome[i,jneg] == 1) and (mg[j,i] ==1):
                mgmore[j, i] = 1
                justificationmore[j, i] = 23
                proof_lengthmore[j,i] = \
                1 + proof_lengthsome[i,jneg] + proof_length[j,i]

    for i in range(n):  ## CARD-SOME
        if mgsome[i, i] == 0:
            k_list = exists(
                range(n),
                lambda num: mgsome[num, num] == 1 and mgc[num, i] == 1)
            if k_list[0] == True:
                k1 = k_list[1]
                mgsome[i, i] = 1
                justificationsome[i, i] = 16
                proof_lengthsome[
                    i, i] = 1 + proof_lengthsome[k1, k1] + proof_lengthc[k1, i]
                Card_Some_missing[i, i] = k1

    for i in range(n):  ## CARD ANTI
        for j in range(n):
            k = neg_internal[i]
            l = neg_internal[j]
            if mgc[l, k] == 0 and mgc[i, j] == 1:
                mgc[l, k] = 1
                justificationc[l, k] = 7
                proof_lengthc[l, k] = 1 + proof_lengthc[i, j]

    for i in range(n):  ## MORE ANTI
        for j in range(n):
            k = neg_internal[i]
            l = neg_internal[j]
            if mgmore[l, k] == 0 and mgmore[i, j] == 1:
                mgmore[l, k] = 1
                justificationmore[l, k] = 22
                proof_lengthmore[l, k] = 1 + proof_lengthmore[i, j]

    for i in range(n):  ## CARD MIX
        for j in range(n):
            if mg[j, i] == 0 and mg[i, j] == 1 and mgc[j, i] == 1:
                mg[j, i] = 1
                justification[j, i] = 8
                proof_length[j,
                             i] = 1 + proof_length[i, j] + proof_lengthc[j, i]

    for i in range(n):  ## THE HALF RULE
        for j in range(n):
            if mgc[i,neg_internal[i]] == 1 and \
               mgc[neg_internal[j],j] ==1 and mgc[i,j] == 0:
                mgc[i, j] = 1
                justificationc[i, j] = 9
                proof_lengthc[i, j] = 1 + proof_lengthc[
                    i, neg_internal[i]] + proof_lengthc[neg_internal[j], j]

    for i in range(n):  ## THE STRICT HALF RULE
        for j in range(n):
            if mgc[i,neg_internal[i]] == 1 and \
            mgmore[neg_internal[j],j] and mgmore[i,j] == 0:
                mgmore[i, j] = 1
                justificationmore[i, j] = 25
                proof_lengthmore[i, j] = 1 + proof_lengthc[
                    i, neg_internal[i]] + proof_lengthmore[neg_internal[j], j]

    # MAJ
    #['At least', (i,pos), (i,neg)],['At least', (j, pos), (j, neg)],
    #['Some', (i, neg), (j, neg)]]
    # conclusion ['Some', (i, pos), (j, pos)]

    for i in range(n):  ## THE MAJ RULE
        for j in range(n):
            if mgc[neg_internal[i],i] ==1 and \
                mgc[neg_internal[j],j] ==1 and \
                    mgsome[neg_internal[i],neg_internal[j]] ==1  and \
                    mgsome[i,j] == 0:
                mgsome[i, j] = 1
                justificationsome[i, j] = 10
                proof_lengthsome[i, j] = 1 + proof_lengthmore[
                    neg_internal[i], i] + proof_lengthc[neg_internal[j], j]

    for i in range(n):  ## MORE-RIGHT
        for j in range(n):
            if mgmore[i, j] == 0:
                k_found = exists(
                    range(n), lambda k: (mgc[k, j] == 1 and mgmore[i, k] == 1))
                if k_found[0] == True:
                    k = k_found[1]
                    mgmore[i, j] = 1
                    justificationmore[i, j] = 21
                    proof_lengthmore[
                        i,
                        j] = 1 + proof_lengthc[k, j] + proof_lengthmore[i, k]
                    More_Right_cut_premise[i, j] = k

    for i in range(n):  ## MORE-LEFT
        for j in range(n):
            if mgmore[i, j] == 0:
                k_found = exists(
                    range(n), lambda k: (mgc[i, k] == 1 and mgmore[k, j] == 1))
                if k_found[0] == True:
                    k = k_found[1]
                    mgmore[i, j] = 1
                    justificationmore[i, j] = 20
                    proof_lengthmore[
                        i,
                        j] = 1 + proof_lengthc[i, k] + proof_lengthmore[j, k]
                    More_Left_cut_premise[i, j] = k

    # tree form:  [ [word, noun1, noun2], leaf/interior, subtree1, subtree2 (possibly), rule name]


def tree_by_numbers(i, j):
    if justification[i, j] == 1:
        return [['All', i, j], 'Axiom']
    if justification[i, j] == 2:
        return [['All', i, j], 'Assumption']
    if justification[i, j] == 3:
        k = neg_internal[i]
        l = neg_internal[j]
        return [['All', i, j], tree_by_numbers(l, k), 'Antitone']
    if justification[i, j] == 4:
        return [['All', i, j], tree_by_numbers(i, neg_internal[i]), 'Zero']
    if justification[i, j] == 5:
        return [['All', i, j], tree_by_numbers(neg_internal[j], j), 'One']
    if justification[i, j] == 8:
        return [['All', i, j],
                tree_by_numbers(j, i),
                tree_by_numbersc(i, j), 'Card Mix']
    if justification[i, j] == 11:
        k = Barbara_cut_premise[i, j]
        return [['All', i, j],
                tree_by_numbers(i, k),
                tree_by_numbers(k, j), 'Barbara']
    else:
        return "Problem in the justification for", i, "and", j


def tree_by_numbersc(i, j):
    if justificationc[i, j] == 2:
        return [['At least', j, i], 'Assumption']
    if justificationc[i, j] == 6:
        return [['At least', j, i], tree_by_numbers(i, j), 'Subset Card']
    if justificationc[i, j] == 7:
        k = neg_internal[i]
        l = neg_internal[j]
        return [['At least', j, i], tree_by_numbersc(l, k), 'Card Antitone']
    if justificationc[i, j] == 9:
        return [['At least', j, i],
                tree_by_numbersc(i, neg_internal[i]),
                tree_by_numbersc(neg_internal[j], j), 'Half']
    if justificationc[i, j] == 12:
        k = card_transitivity_cut_premise[i, j]
        return [['At least', j, i],
                tree_by_numbersc(k, j),
                tree_by_numbersc(i, k), 'Card Trans']
    if justificationc[i, j] == 18:
        return [['At least', j, i], tree_by_numbersmore(i, j), 'More-Card']
    else:
        return "Problem in the cardinality justification for", i, "and", j


def tree_by_numberssome(i, j):
    if justificationsome[i, j] == 2:
        return [['Some', i, j], 'Assumption']
    if justificationsome[i, j] == 13:
        return [['Some', i, j], tree_by_numberssome(j, i), 'Conversion']
    if justificationsome[i, j] == 14:
        k = Some_rule_missing_premise[0, i]
        return [['Some', i, i], tree_by_numberssome(i, k), 'Some Rule']
    if justificationsome[i, j] == 15:
        k = Darii_missing[i, j]
        return [['Some', i, j],
                tree_by_numbers(k, j),
                tree_by_numberssome(i, k), 'Darii']
    if justificationsome[i, j] == 16:
        k = Card_Some_missing[i, j]
        return [['Some', i, j],
                tree_by_numberssome(k, k),
                tree_by_numbersc(k, i), 'Card-Some']
    if justificationsome[i, j] == 17:
        jneg = neg_internal[j]
        return [['Some', i, j], tree_by_numbersmore(jneg, i), 'More-Some']
    # tipping is gone
    if justificationsome[i, j] == 10:
        jneg = neg_internal[j]
        ineg = neg_internal[i]
        return [['Some', i, j],
                tree_by_numbersc(neg_internal[i], i),
                tree_by_numbersc(neg_internal[j], j),
                tree_by_numberssome(neg_internal[i], neg_internal[j]), 'Maj']
    if justificationsome[i, j] == 24:
        k = Int_rule_missing_premise[0, i]
        return [['Some', i, i],
                tree_by_numberssome(k, k),
                tree_by_numbersc(neg_internal[i], i), 'Integer']
    else:
        return "Problem in the justification for", 'some', i, "are", j


def tree_by_numbersmore(i, j):
    if justificationmore[i, j] == 2:
        return [['More', j, i], 'Assumption']
    if justificationmore[i, j] == 21:
        k = More_Right_cut_premise[i, j]
        return [['More', j, i],
                tree_by_numbersc(k, j),
                tree_by_numbersmore(i, k), 'More-Right']
    if justificationmore[i, j] == 20:
        k = More_Left_cut_premise[i, j]
        return [['More', j, i],
                tree_by_numbersmore(k, j),
                tree_by_numbersc(i, k), 'More-Left']
    if justificationmore[i, j] == 22:
        k = neg_internal[i]
        l = neg_internal[j]
        return [['More', j, i], tree_by_numbersmore(l, k), 'More Antitone']
    if justificationmore[i, j] == 23:
        l = neg_internal[i]
        return [['More', j, i],
                tree_by_numbers(i, j),
                tree_by_numberssome(j, l), 'More']
    if justificationmore[i, j] == 25:
        return [['More', j, i],
                tree_by_numbersc(i, neg_internal[i]),
                tree_by_numbersmore(neg_internal[j], j), 'Strict Half']
    else:
        return "Problem in the MORE justification for", i, "and", j


def size(t):
    if last(t) == 'Assumption' or last(t) == "Axiom":
        return 1
    else:
        smallt = t[1:len(t) - 1]
        return 1 + sum(map(size, smallt))


def negation(pvar):
    if pvar[1] == pos:
        return tuple([pvar[0], neg])
    if pvar[1] == neg:
        return tuple([pvar[0], pos])


def sentence_negation(phi):
    if phi[0] == 'All':
        return ['Some', phi[1], negation(phi[2])]
    if phi[0] == 'Some':
        return ['All', phi[1], negation(phi[2])]
    if phi[0] == 'At least':
        return ['More', phi[2], phi[1]]
    if phi[0] == 'More':
        return ['At least', phi[2], phi[1]]


def simple(pvar):
    if pvar[1] == pos:
        return pvar[0]
    else:
        #return (non,pvar[0])
        return 'non-' + pvar[0]


def spell(word, first, second):  # word is either 'All' or 'Some' or 'At least'
    pvar1 = lis[first]
    pvar2 = lis[second]
    if pvar1[1] == pos and pvar2[1] == neg and word == 'All':
        return ['No', simple(pvar1), 'are', simple(negation(pvar2))]
    elif word == 'At least':
        return ['At least as many', simple(pvar1), 'as', simple(pvar2)]
    elif word == 'More':
        return ['There are more', simple(pvar1), 'than', simple(pvar2)]
    elif word == 'All' or word == 'Some':
        return [word, simple(pvar1), 'are', simple(pvar2)]
    #if pvar1[1] == pos and pvar2[1] == pos and (word == 'All' or  word == 'Some'):
    #    return [word, pvar1[0], 'are', pvar2[0]]

    #if pvar1[1] == pos and pvar2[1] == neg and word == 'Some':
    #    return ['Some', pvar1[0], 'are', ('non',pvar2[0])]
    #if pvar1[1] == neg and pvar2[1] == pos:
    #    return [word, ('non',pvar1[0]), 'are', pvar2[0]]
    #if pvar1[1] == neg and pvar2[1] == neg:
    #    return [word, ('non',pvar1[0]), 'are', ('non',pvar2[0])]
    else:
        print("error in spell")


def flatten(t, i):
    # flattens a proof tree into a list
    # the cases depend on the number of premises: 0,1,2, or 3
    if last(t) == 'Axiom' or last(t) == 'Assumption':
        return ([[1 + i] + spell(t[0][0], t[0][1], t[0][2]) +
                 [table([last(t)])]])
    elif last(t) == 'Antitone' or last(t) == 'Zero' or last(t) == 'One' or last(t) == 'Subset Card' \
        or last(t) == 'Card Antitone' or last(t) == 'Conversion' or last(t)== 'Some Rule' \
        or last(t)== 'More-Some'  or last(t)== 'More-Card' or last(t)== 'More Antitone':
        return (flatten(t[1], i) +
                [[size(t) + i] + spell(t[0][0], t[0][1], t[0][2]) +
                 [table([last(t), size(t) + i - 1])]])

    elif last(t) == 'Card Mix' or last(t) == 'Barbara' or last(t) == 'Card Trans' \
        or last(t) == 'Darii'  or last(t) == 'Half' or last(t) == 'Card-Some' \
        or last(t)== 'More-Left' or last(t)== 'More-Right' or last(t) == 'Strict Half' \
        or last(t) == 'Tipping' or last(t) == 'More' or last(t) == 'Integer':
        return (flatten(t[1],i) + \
                 flatten(t[2],i+size(t[1]))  +\
                 [[i + size(t)] + spell(t[0][0],t[0][1],t[0][2]) +  [table([last(t),size(t[1])+i,size(t)+i-1])]] \
                )
    elif last(t) == 'Maj':
        return (flatten(t[1],i) + \
                 flatten(t[2],i+size(t[1]))  +\
                 flatten(t[3],i+size(t[1]) + size(t[2])) +\
                 [[i + size(t)] + spell(t[0][0],t[0][1],t[0][2]) + \
                  [table([last(t),size(t[1])+i,i+size(t[1]) + size(t[2]), size(t)+i-1])]] \
                )


def read(Gamma):
    global mg
    global mgc
    global mgsome
    global mgmore
    global justification
    global justificationc
    global justificationsome
    global justificationmore
    global proof_length
    global proof_lengthc
    global proof_lengthsome
    global proof_lengthmore
    global Barbara_cut_premise
    global card_transitivity_cut_premise
    global Some_rule_missing_premise
    global Int_rule_missing_premise
    global Card_Some_missing
    global Darii_missing
    global More_Left_cut_premise
    global More_Right_cut_premise
    global dim
    global n
    global lis
    mg = matrix(n, n, 0)
    mgc = matrix(ZZ, n, n, 0)
    mgsome = matrix(ZZ, n, n, 0)
    mgmore = matrix(ZZ, n, n, 0)
    justification = matrix(ZZ, n, n, 0)
    justificationc = matrix(ZZ, n, n, 0)
    justificationsome = matrix(ZZ, n, n, 0)
    justificationmore = matrix(ZZ, n, n, 0)
    proof_length = matrix(ZZ, n, n, 0)
    proof_lengthc = matrix(ZZ, n, n, 0)
    proof_lengthsome = matrix(ZZ, n, n, 0)
    proof_lengthmore = matrix(ZZ, n, n, 0)
    Barbara_cut_premise = matrix(ZZ, n, n, 0)
    card_transitivity_cut_premise = matrix(ZZ, n, n, 0)
    Card_Some_missing = matrix(ZZ, n, n, 0)
    More_Left_cut_premise = matrix(ZZ, n, n, 0)
    More_Right_cut_premise = matrix(ZZ, n, n, 0)
    Some_rule_missing_premise = matrix(ZZ, 1, n, 0)
    Darii_missing = matrix(ZZ, n, n, 0)
    Int_rule_missing_premise = matrix(ZZ, 1, n, 0)
    for item in Gamma:
        if item[0] == 'All':
            i = lis.index(item[1])
            j = lis.index(item[2])
            mg[i, j] = 1
            justification[i, j] = 2
            proof_length[i, j] = 1
        elif item[0] == 'At least':
            ## At least as many i as j  ===>   mgc[j,i] = 1
            ## That is, bigger sets are the targets
            i = lis.index(item[1])
            j = lis.index(item[2])
            mgc[j, i] = 1
            justificationc[j, i] = 2
            proof_lengthc[j, i] = 1
        elif item[0] == 'Some':
            i = lis.index(item[1])
            j = lis.index(item[2])
            mgsome[i, j] = 1
            justificationsome[i, j] = 2
            proof_lengthsome[i, j] = 1

        elif item[0] == 'More':
            i = lis.index(item[1])
            j = lis.index(item[2])
            mgmore[j, i] = 1
            justificationmore[j, i] = 2
            proof_lengthmore[j, i] = 1

        else:
            print("ERROR READING GAMMA")
        #print "mgc here is"
        #print mgc
        n = len(lis)


def make_matrices(Gamma):
    #global mgc
    #global mgsome
    #global mgmore
    global small_or_half
    small_or_half = []
    global large_or_half
    large_or_half = []
    global large_or_half_original
    large_or_half_original = []
    global small
    small = []
    global large
    large = []
    global half
    half = []
    for i in range(n):
        mg[i, i] = 1
        justification[i, i] = 1
        proof_length[i, i] = 1

    old_max = -1
    new_max = 0

    while old_max < new_max:
        old_max = new_max
        Apply_using_numbers()
        m1 = proof_length.height()
        m2 = proof_lengthc.height()
        m3 = proof_lengthsome.height()
        m4 = proof_lengthmore.height()
        new_max = max([m1, m2, m3, m4])
        #time_limit = len(pvars)
        #for tick in range(time_limit):
        #Apply_using_numbers()
        #Rule_filter(10) #
        ## checked for 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25

    if verbosity >= 3:
        print("The sets called small, large, and half start out as:")
        print("small")
        print([lis[ind] for ind in small])
        print("large")
        print([lis[ind] for ind in large])
        print("half")
        print([lis[ind] for ind in half])
        print("")


def rule_filter(num):
    global mg
    global mgc
    global mgsome
    global mgmore
    global justification
    global justificationc
    global justificationsome
    global justificationmore
    if (num == 10) or (num == 13) or (num == 17) or (num == 14) or (num == 15)\
     or (num == 16) or (num == 24) or (num == 19):
        for i in range(n):
            for j in range(n):
                if justificationsome[i, j] == num:
                    justificationsome[i, j] = 0
                    mgsome[i, j] = 0
    if (num == 7) or (num == 9) or (num == 12) or (num == 18) or (
            num == 20) or (num == 21) or (num == 18):
        for i in range(n):
            for j in range(n):
                if justificationc[i, j] == num:
                    justificationc[i, j] = 0
                    mgc[i, j] = 0
    if (num == 20) or (num == 21) or (num == 23) or (num == 25):
        for i in range(n):
            for j in range(n):
                if justificationmore[i, j] == num:
                    justificationmore[i, j] = 0
                    mgmore[i, j] = 0
    if (num == 8) or (num == 11):
        for i in range(n):
            for j in range(n):
                if justification[i, j] == num:
                    justification[i, j] = 0
                    mg[i, j] = 0


def sdagger(Gamma,
            phi):  ## works for Gamma and phi sentences in 'All' and 'At least'

    global variables
    global polarized_variables
    global pvars
    global Is
    Is = []
    global Ms
    Ms = []
    make_eyes(Gamma)

    global edgeset_pre

    global zeros
    global ones
    global pre_points
    global outtree

    global firstlist
    global secondlist
    global thirdlist
    global fourthlist
    global n
    make_variables(Gamma + [phi])
    global g
    global g_c
    global lis
    global lis_c

    g = DiGraph({var: Set([var]) for var in pvars})
    g_c = DiGraph({var: Set([var]) for var in pvars})
    lis = g.vertices()
    n = len(lis)
    lis_c = g_c.vertices()
    global neg_internal
    neg_internal = {i: lis.index(negation(lis[i])) for i in range(n)}
    dim = len(g.vertices())

    read(Gamma)
    make_matrices(Gamma)

    cp = cartesian_product([range(n), range(n)])
    badlist = [
        item for item in cp
        if mgsome[item[0], item[1]] == 1 and mg[item[0],
                                                neg_internal[item[1]]] == 1
    ]
    badlist2 = [
        item for item in cp
        if mgmore[item[0], item[1]] == 1 and mgc[item[1], item[0]] == 1
    ]

    if badlist2 != []:
        if verbosity >= 1:
            print(
                "The assumptions are inconsistent due to cardinality problems."
            )
            if verbosity >= 2:
                print("So the conclusion follows from a contradiction:")
                print("")
                qq = range(len(badlist2))
                lengths = list(map(
                    lambda it: proof_lengthmore[badlist2[it][1], badlist2[it][
                        0]] + proof_lengthc[badlist2[it][0], badlist2[it][1]],
                    qq))
                MIN = min(lengths)
                found_index = [ind for ind in qq if lengths[ind] == MIN][0]
                num0 = badlist2[found_index][0]
                num1 = badlist2[found_index][1]
                tree_non_strict = tree_by_numbersc(num0, num1)
                tree_strict = tree_by_numbersmore(num1, num0)
                size_of_tree_non_strict = size(tree_non_strict)
                size_of_tree_strict = size(tree_strict)
                size_total = size_of_tree_non_strict + size_of_tree_strict
                flattened_tree_strict = flatten(tree_strict, 0)
                flattened_tree_non_strict = flatten(tree_non_strict,
                                                    size_of_tree_strict)
                conclusion = [
                    [size_total + 1] +
                    spell(phi[0], lis.index(phi[1]), lis.index(phi[2])) +
                    [table(['X', size_of_tree_strict, size_total])]
                ]
                flattened_tree = flattened_tree_strict + flattened_tree_non_strict + conclusion
                print(table(flattened_tree))

    elif badlist != []:
        if verbosity >= 1:
            print("The assumptions are inconsistent.")
            print("So the conclusion follows from a contradiction:")
            print("")
            if verbosity >= 2:
                qq = range(len(badlist))
                lengths = map(lambda it: proof_lengthsome[badlist[it][0],
                badlist[it][1]] + \
                proof_length[badlist[it][0],neg_internal[badlist[it][1]]],qq)
                MIN = min(lengths)
                found_index = [ind for ind in qq if lengths[ind] == MIN][0]
                num0 = badlist[found_index][0]
                num1 = badlist[found_index][1]
                tree_some = tree_by_numberssome(num0, num1)
                tree_no = tree_by_numbers(num0, neg_internal[num1])
                size_of_tree_some = size(tree_some)
                size_of_tree_no = size(tree_no)
                size_total = size_of_tree_some + size_of_tree_no
                flattened_tree_some = flatten(tree_some, 0)
                flattened_tree_no = flatten(tree_no, size_of_tree_some)
                conclusion = [
                    [size_total + 1] +
                    spell(phi[0], lis.index(phi[1]), lis.index(phi[2])) +
                    [table(['X', size_of_tree_some, size_total])]
                ]
                flattened_tree = flattened_tree_some + flattened_tree_no + conclusion
                print(table(flattened_tree))

    elif phi[0] == 'All':
        i = lis.index(phi[1])
        j = lis.index(phi[2])
        if mg[i, j] == 1:
            if verbosity >= 1:
                does_it_follow()
            if verbosity >= 2:
                print(table(flatten(tree_by_numbers(i, j), 0)))

        else:
            does_not_follow()
            Gamma = Gamma + [sentence_negation(phi)]
            Is = []
            Ms = []
            make_eyes(Gamma + [sentence_negation(phi)])
            read(Gamma)
            make_matrices(Gamma + [sentence_negation(phi)])
            cardinality_helpers()
            builder()
    elif phi[0] == 'At least':
        i = lis.index(phi[1])
        j = lis.index(phi[2])
        if mgc[j, i] == 1:
            if verbosity >= 1:
                does_it_follow()
            if verbosity >= 2:
                print(table(flatten(tree_by_numbersc(j, i), 0)))
        else:
            does_not_follow()
            make_eyes(Gamma + [sentence_negation(phi)])
            read(Gamma + [sentence_negation(phi)])
            make_matrices(Gamma + [sentence_negation(phi)])
            cardinality_helpers()
            builder()

    elif phi[0] == 'Some':
        i = lis.index(phi[1])
        j = lis.index(phi[2])
        if mgsome[i, j] == 1:
            if verbosity >= 1:
                does_it_follow()
            if verbosity >= 2:
                print(table(flatten(tree_by_numberssome(i, j), 0)))
        else:
            does_not_follow()
            Is = []
            Ms = []
            make_eyes(Gamma + [sentence_negation(phi)])
            read(Gamma + [sentence_negation(phi)])
            make_matrices(Gamma + [sentence_negation(phi)])
            cardinality_helpers()
            builder()
    elif phi[0] == 'More':
        i = lis.index(phi[1])
        j = lis.index(phi[2])
        if mgmore[j, i] == 1:
            if verbosity >= 1:
                does_it_follow()
            if verbosity >= 2:
                print(table(flatten(tree_by_numbersmore(j, i), 0)))
        else:
            does_not_follow()
            Is = []
            Ms = []
            make_eyes(Gamma + [sentence_negation(phi)])
            read(Gamma + [sentence_negation(phi)])
            make_matrices(Gamma + [sentence_negation(phi)])
            cardinality_helpers()
            builder()


def cardinality_helpers():
    global small
    global large
    global small_or_half
    global large_or_half
    if verbosity >= 3:
        print(
            "At this point, we need to divide the set of polarized variables")
        print(
            "into three subsets called small, large, and half.  Before we do that, we have:"
        )
        print("")
        print("small:")
        print([lis[index] for index in small])
        print("large:")
        print([lis[index] for index in large])
        print("half:")
        print([lis[index] for index in half])
        print("")
    for x in variables:
        x_pos_as_number = lis.index((x, pos))
        x_neg_as_number = lis.index((x, neg))
        if not (x_pos_as_number in half) and not (x_neg_as_number in half):
            if exists(large_or_half, lambda y: mgc[y][x_pos_as_number])[0]:
                large = list(Set(large).union(Set([x_pos_as_number])))
                small = list(Set(small).union(Set([x_neg_as_number])))
            else:
                large = list(Set(large).union(Set([x_neg_as_number])))
                small = list(Set(small).union(Set([x_pos_as_number])))
            large_or_half = list(Set(large).union(Set(half)))
    small_or_half = list(Set(small).union(Set(half)))
    if verbosity >= 3:
        print("The algorithm completes the division, giving")
        print("small:")
        print([lis[index] for index in small])
        print("large:")
        print([lis[index] for index in large])
        print("half:")
        print([lis[index] for index in half])
        print("")


def builder():
    ## builds a model of a list of Is, respecting graph1 but not leq information
    global pre_points
    global iterator1
    global preliminary_model  ## maybe delete this global declaration

    global N
    N = len(Is)
    #print "Is", Is, "N",N
    from sage.misc.lazy_list import lazy_list
    from itertools import count
    #mpp = lazy_list(count(),start=N)
    # the line above was taken out on May 9
    mpp = lazy_list(N + i for i in count())
    iterator1 = iter(mpp)
    #print "the iterators starts at",N
    pre_points = {i: Set([Is[i][0], Is[i][1]]) for i in range(N)}
    for i in range(N):
        for var in variables:
            if exists(pre_points[i], lambda xvar:\
                 mg[lis.index(xvar)][lis.index((var,pos))] == 1)[0]:
                pre_points.update({i: pre_points[i].union(Set([(var, pos)]))})
            else:
                pre_points.update({i: pre_points[i].union(Set([(var, neg)]))})
    #print "pre_points at the first semantics:"
    #for index in range(N):
    #    print index, pre_points[index]
    #print ""
    semantics = {
        var: Set([i for i in range(N) if (var, pos) in pre_points[i]])
        for var in variables
    }
    M = Set(range(N))
    if verbosity == 3:
        print("The first semantics, based on the existential assumptions:")
        print(
            table(
                list([[x, semantics[x],
                       M.difference(semantics[x])] for x in variables])))
        print("The universe is")
        print(M)
        print("")

    def f(x):
        return Set([i for i in range(N) if lis[x] in pre_points[i]])

    global s_or_h
    s_or_h = small_or_half
    #print "s_or_h is:",s_or_h
    preliminary_model = {xx: f(xx) for xx in s_or_h}

    global G1
    G1 = DiGraph(
        {x: Set([y for y in s_or_h if mg[x][y] == 1])
         for x in s_or_h})
    #print "G1:", G1.edges()
    #print ""
    G2 = DiGraph(
        {x: Set([y for y in s_or_h if mgc[x][y] == 1])
         for x in s_or_h})
    #print "G2:",G2.edges()
    #print ""
    G3 = DiGraph(
        {x: Set([y for y in s_or_h if mgmore[x][y] == 1])
         for x in s_or_h})
    model_builder(G1, s_or_h, G2, G3, preliminary_model)


def model_builder(G, vars, cgraph, mgr, preliminary_model):
    from sage.misc.lazy_list import lazy_list
    from itertools import count

    m = len(vars)
    global Goal
    Goal = preliminary_model

    Include = {xx: Set([yy for yy in vars if mg[yy, xx] == 1]) for xx in vars}
    ## it had been     (mg[y,x]==1 and mg[x][y]==0)
    #print "Include = "
    #print Include
    #print ""
    V = [Set(x) for x in G.strongly_connected_components()]
    #print "G.strongly_connected_components"
    #print G.strongly_connected_components()
    #print ""
    #print "V = "
    #print V
    #print ""
    #print "cgraph.strongly_connected_components_digraph().topological_sort()"
    #print cgraph.strongly_connected_components_digraph().topological_sort()
    #print ""
    A = [[vvv for vvv in V if not(vvv.intersection(p).is_empty())] \
        for p in cgraph.strongly_connected_components_digraph().topological_sort()]
    #print "A = "
    #print A
    #print ""

    k = 0
    for i in range(len(A)):
        for F in A[i]:
            for v in F:
                #print ""
                #print "starting work on",v,lis[v], "which is now", Goal[v]
                for x in Include[v]:
                    Goal.update({v: Goal[v].union(Goal[x])})
                Make_me_at_least_as_big_as = \
                    [x for x in vars if v in cgraph.neighbors_out(x)]
                #print "Make_me_at_least_as_big_as", Make_me_at_least_as_big_as
                for x in Make_me_at_least_as_big_as:
                    #print x
                    #print Goal[x]
                    #print Goal[x].cardinality()
                    xval = Goal[x].cardinality()
                    vval = Goal[v].cardinality()
                    if xval > vval:
                        import itertools
                        Goal.update({
                            v:
                            Goal[v].union(
                                Set(itertools.islice(iterator1, xval - vval)))
                        })
                Make_me_bigger_than= \
                    [x for x in vars if v in mgr.neighbors_out(x)]
                #print "Make_me_bigger_than =", Make_me_bigger_than
                for x in Make_me_bigger_than:
                    #print x, "here"
                    #print Goal[x]
                    #print Goal[x].cardinality()
                    xval = Goal[x].cardinality()
                    vval = Goal[v].cardinality()
                    if xval >= vval:
                        import itertools
                        Goal.update({
                            v:
                            Goal[v].union(
                                Set(
                                    itertools.islice(iterator1,
                                                     xval - vval + 1)))
                        })
                #print "done with work on",v, "which is now", Goal[v]
    #print "Goal at this point:",Goal
    #
    max_around = max([maxx(Goal[v]) for v in Goal.keys()] + [N - 1])

    global uni
    if N == 0:
        uni = Set([])
        #print "We are here.  No numbers have been used so far."
        #print
    else:
        uni = Set(range(max_around + 1))

    #print "The largest number used so far is", max_around

    global sem
    sem = {lis[i]: Goal[i] for i in small_or_half}
    if verbosity == 3:
        print(
            "The next model, reflecting the sizes and sets among 'small' and 'half':"
        )
        print("The universe is" + uni)
        keys = sem.keys()
        print(table(list([[key, sem[key]] for key in keys])))
        print("")
    half_fixer()
    model_checker(Gamma, phi)


def half_fixer():
    import pandas as pd
    import numpy as np
    global sem
    global uni
    #print "variables", variables
    half = [
        i for i in range(n)
        if mgc[i, neg_internal[i]] == 1 and mgc[neg_internal[i], i] == 1
    ]
    small = [
        i for i in range(n)
        if mgc[i, neg_internal[i]] == 1 and mgc[neg_internal[i], i] == 0
    ]
    global half_by_variables
    half_by_variables = [lis[i] for i in half]
    #print "half", half, "half_by_variables=", half_by_variables
    #print "universe at the start of the half_fixer", uni
    keys = sem.keys()

    vih = [
        var for var in variables  ## vih stands for "variables in half"
        if ((var, pos) in half or (var, neg) in half_by_variables)
    ]
    # stands for 'variables in half'
    #print "vih",vih

    #print "universe", uni
    if is_odd(uni.cardinality()) and half != []:
        ## make sure that the cardinality of the universe is even if there are 'halves'
        new = 1 + maxx(uni)
        uni = uni.union(Set([new]))
        for var in vih:
            if is_odd(sem[(var,pos)].cardinality() - sem[(var,neg)].cardinality()):
                sem.update({(var,pos):sem[(var,pos)].union(Set([new]))})
        if verbosity == 3:
            print(
                "We make an addition to the universe to give an even cardinality. It's now"
            )
            print(uni)
            print("")
    for var in vih:  ## divvy un-unused elements
        used = sem[(var, pos)].union(sem[(var, neg)])
        extras = list(uni.difference(used))
        #print var, "used", used, "extras", extras
        first_half = extras[:len(extras) / 2]
        second_half = extras[len(extras) / 2:]
        #print first_half, second_half, "Red handed?"
        sem.update({(var, pos): sem[(var, pos)].union(Set(first_half))})
        sem.update({(var, neg): sem[(var, neg)].union(Set(second_half))})

    vect = [
        sem[(var, pos)].cardinality() - sem[(var, neg)].cardinality()
        for var in vih
    ]
    #print "vect = size differences, pos - neg",vect
    vect2 = list(map(lambda xx: abs(xx), vect))
    #print "absolute values", vect2
    need_to_add = maxx(vect2)
    new_values = range(1 + maxx(uni), 1 + maxx(uni) + need_to_add)
    #print new_values
    #print [new_values[0:vect[vih.index(var)]/2] for var in vih]
    add_to_pos = [new_values[0:max(0, -vect[vih.index(var)])] for var in vih]
    add_to_neg = [new_values[0:max(0, vect[vih.index(var)])] for var in vih]
    sharing = [new_values[vect2[vih.index(var)]:] for var in vih]
    #print "sharing",sharing
    lengths = [len(sharing[vih.index(var)]) for var in vih]
    #print "lengths",lengths
    sharing_to_pos = [
        sharing[vih.index(var)][0:lengths[vih.index(var)] / 2] for var in vih
    ]
    sharing_to_neg = [
        sharing[vih.index(var)][lengths[vih.index(var)] / 2:] for var in vih
    ]
    for var in vih:
        ww = vih.index(var)
        vp = (var, pos)
        sem.update({
            vp:
            sem[vp].union(Set(add_to_pos[ww])).union(Set(sharing_to_pos[ww]))
        })
        vn = (var, neg)
        sem.update({
            vn:
            sem[vn].union(Set(add_to_neg[ww])).union(Set(sharing_to_neg[ww]))
        })
    ## we fix the properly_large ones THIS MIGHT NEED PUMPING
    properly_large = [xx for xx in large if not xx in half]
    #print "properly_large", properly_large, [lis[i] for i in properly_large]
    for i in properly_large:
        sem.update({lis[i]: uni.difference(sem[negation(lis[i])])})
    sem2 = sem
    sem = {var: sem[(var, pos)] for var in variables}
    ## RECONCILIATION FOR HALF variables that are negations
    for v1 in range(len(vih)):
        for v2 in range(len(vih)):
            if v1 < v2 and mg[lis.index((vih[v1], pos)),
                              lis.index((vih[v2], neg))] == 1:
                #print (v1, v2)
                sem[vih[v2]] = uni.difference(sem[vih[v1]])
    global score
    score = 0
    for sentence in Gamma + [sentence_negation(phi)]:
        if satisfies(sentence) == False:
            t1 = term(sentence, 1)
            t2 = term(sentence, 2)
            #print sentence, t1, t2, "old score", score
            if sentence[0] == 'At least':
                score = max(score, t2.cardinality() - t1.cardinality())
                #print"card differences:", t2.cardinality() - t1.cardinality()
            if sentence[0] == 'More':
                #print "card differences + 1", t2.cardinality() - t1.cardinality() + 1
                score = max(score, t2.cardinality() - t1.cardinality() + 1)
    if is_odd(score):
        score = score + 1
    #print "score", score
    need_to_add = score
    new_values = range(1 + maxx(uni), 1 + maxx(uni) + need_to_add)
    #print "new values to add are:", new_values
    add_to_pos = new_values[:need_to_add // 2]
    add_to_neg = new_values[need_to_add // 2:]
    #print add_to_pos, add_to_neg
    keys = sem2.keys()
    #print table(list([[key,sem2[key]] for key in keys]))
    #print "HERE IS variables_in_half", vih

    for var in vih:
        ww = vih.index(var)
        vp = (var, pos)
        sem2.update({vp: sem2[vp].union(Set(add_to_pos))})
        vn = (var, neg)
        sem2.update({vn: sem2[vn].union(Set(add_to_neg))})
    #print "after adding again"
    #print table(list([[key,sem2[key]] for key in keys]))

    sem = {var: sem2[(var, pos)] for var in variables}
    if verbosity == 3:
        print(
            "The semantics before bumping for cardinality problems in the large sets:"
        )
        print(
            table(
                list([[var, sem[var], uni.difference(sem[var])]
                      for var in variables])))
        print("")

    largelist = [lis[xx] for xx in large if not xx in half]
    #print "largelist", largelist
    for var in variables:
        if (var, pos) in largelist:
            sem.update({var: sem[var].union(Set(new_values))})
    uni = uni.union(Set(new_values))

    ## RECONCILIATION FOR HALF variables that are negations
    for v1 in range(len(vih)):
        for v2 in range(len(vih)):
            if v1 < v2 and mg[lis.index((vih[v1], pos)),
                              lis.index((vih[v2], neg))] == 1:
                #print (v1, v2)
                sem[vih[v2]] = uni.difference(sem[vih[v1]])
    #for sent in Gamma:
    #    print sent
    if verbosity >= 1:
        printmd("We take the universe of the model to be " + str(uni) + ".")
        printmd("")
        #print "The nouns are interpreted as follows:"
        if uni.cardinality() < 20:
            global tbl
            global qqq
            tbl = table(
                list([["noun", "semantics", "complement"]] +
                     [[str(var),
                       str(sem[var]),
                       str(uni.difference(sem[var]))] for var in variables]),
                header_row=True)
            display(tbl)
            #ppp = {'interpretation': [sem[var] for var in variables],'complement': [uni.difference(sem[var]) for var in variables]}
            #qqq = pd.DataFrame(data = ppp, index=variables,columns = ['interpretation','complement'])
            #display(qqq)

        else:
            for var in variables:
                printmd("interpretation of " + str(var) + ": " + str(sem[var]))
                printmd("size of interpretation: " +
                        str(sem[var].cardinality()))
                printmd("complement: " + str(uni.difference(sem[var])))
                printmd("size of complement: " +
                        str(uni.difference(sem[var]).cardinality()))
                printmd("")


def term(sentence, i):
    ter = sem[sentence[i][0]]
    if sentence[i][1] == pos:
        return ter
    else:
        return uni.difference(ter)


def theory_sat(sentence_list):
    return forall(sentence_list, lambda psi: satisfies(psi))


def does_it_follow():
    if verbosity >= 1:
        print("")
        printmdcolor("The conclusion follows from the assumptions.",
                     color='blue')
        printmd("Here is a formal proof in our system:")
        printmd("")


def does_not_follow():
    if verbosity >= 1:
        print("")
        printmdcolor("The conclusion does not follow from the assumptions.",
                     color='red')
        printmd("Here is a counter-model.")


def satisfies(sentence):
    t1 = term(sentence, 1)
    t2 = term(sentence, 2)
    if sentence[0] == 'All':
        return t1.issubset(t2)
    if sentence[0] == 'Some':
        return not (t1.intersection(t2).is_empty())
    if sentence[0] == 'At least':
        return t1.cardinality() >= t2.cardinality()
    if sentence[0] == 'More':
        return t1.cardinality() > t2.cardinality()


def model_checker(assumptions, conclusion):

    tv = theory_sat(assumptions)[0] and not satisfies(conclusion)
    if tv == True:
        if verbosity >= 4:
            print("")
            print("The model checks out!")

    else:
        print("PROBLEM WITH THIS MODEL with the following sentences:")
        for sentence in Gamma:
            if satisfies(sentence) == False:
                print(sentence)
        print("The conclusion is" + conclusion)
        if satisfies(conclusion) == 1:
            print("the conclusion" + conclusion +
                  "should be false, but it's true.")
        print("Again, Gamma is the set")
        for x in Gamma:
            print(x)


# latex.add_to_preamble('\\usepackage{proof}')
from string import Template


def process(lis):
    if len(lis) == 2:
        t = Template(r"\infer[Ass]{${conclusion}}{}")
        return t.substitute(conclusion=lis[0])
    elif len(lis) == 3:
        tag = last(lis)
        root = lis[0]
        only_premise = process(lis[1])
        t = Template(r'\infer[${rulename}]{${conclusion}}{${premise}}')
        return t.substitute(conclusion=root,
                            premise=only_premise,
                            rulename=tag)
    elif len(lis) == 4:
        tag = last(lis)
        root = lis[0]
        p1 = process(lis[1])
        p2 = process(lis[2])
        t = Template(
            r'\infer[${rulename}]{${conclusion}}{${premise1} & ${premise2}}')
        return t.substitute(conclusion=root,
                            premise1=p1,
                            premise2=p2,
                            rulename=tag)


def examples():
    print("Here are some examples of queries which we could ask the system.")
    print("")
    print("follows(['Some x are x','No y are y'], 'There are more x than y')")
    print("")
    print(
        "follows(['All non-x are x', 'Some non-y are z'],'There are more x than y')"
    )
    print("")
    print("assumptions= ['All non-e are b',")
    print("'There are more e than non-b', 'There are more non-e than non-b',")
    print("'There are at least as many non-d as e',")
    print("'There are at least as many non-d as non-a']")
    print("conc = 'All d are e'")
    print("follows(assumptions,conc)")
    print("")
    print("as = ['All non-a are a', 'There are at least as many non-h as h',")
    print("'Some b are b']")
    print("conc = 'There are more a than h'")
    print("follows(As,conc)")
    print("")
    print("hypotheses = ['There are more a than b',")
    print("'There are more non-b than non-c', 'There are more non-c than d']")
    print("conclusion = 'Some non-b are non-a'")
    print("follows(hypotheses,conclusion)")
    print("")
    print("follows([")
    print("'There are more d than a',")
    print("'There are at least as many non-b as c',")
    print("'There are more non-e than b',")
    print("'Some non-b are non-f',")
    print("'No a are b',")
    print("'There are more c than non-d',")
    print("'There are at least as many non-a as f'")
    print("],")
    print("'All x are y')")
    print("")
    print("For each of these, enter it into a text box and press 'evaluate'.")


def syntax():
    print("Here is how to enter queries:")
    print("Variables are lower-case Roman letters a, b, . . . , z")
    print("Sentences may be of one of the following forms:")
    print("")
    print("            All (non-)x are (non-)y")
    print("            Some (non-)x are (non-)y")
    print("            (There are) more (non-)x than (non-)y")
    print("            (There are) at least (as many) (non-)z as (non-)y")
    print("")
    print("We also have")
    print("            No (non-)x are y")
    print("")
    print("as an abbreviation of 'All (non-)x are non-y'")
    print("")
    print("The main query is")
    print("")
    print("            follows(assumptions,conclusion)")
    print("")
    print("where 'assumptions' is a list (of assumptions),")
    print("and conclusion is a sentence.")
    print("")
    print("One may name the assumptions and conclusion pretty much anything.")
    print("")
    print("When we enter the query, we either get a derivation in our system")
    print("of the conclusion from the assumptions, or else a counter-model:")
    print(
        "a finite model where all the assumptions are true but the conclusion fails."
    )
    print("")
    print(
        "Here is an example which you can copy into a cell and then evaluate.")
    print("")
    print("assumptions = ['All x are non-y', 'Some z are w']")
    print("conclusion = 'There are more x than a'")
    print("follows(assumptions,conclusion)")
    print("")
    print("The derivation might use a sligthly different syntax than we")
    print("described above for your entry.")
    print("")
    print("Here is another example:")
    print("")
    print("follows(['All non-x are x', 'Some z are non-y'],")
    print("'There are more x than y')")
    print("")
    print("More examples may be found by entering examples().")
    print("")
    print("You can also adjust the amount of information the system")
    print("reports back.  There are four settings:")
    print("")
    print("mute().  This is silent, except if the model builder")
    print("finds an error.  Please let me know if this happens!")
    print("")
    print("taciturn().  This only reports back success or failure.")
    print("")
    print("talkative().  This is the 'normal' setting, showing")
    print("derivations and counter-models.")
    print("")
    print("garrulous().  This gives the gory details on the")
    print("construction of counter-models.")


def instructions():
    printmd("Welcome to our evaluator of some syllogistic arguments.")
    printmd(
        "The basic syntax which we handle includes the standard syllogistic repertoire: 'All x are y', 'Some x are y', and 'No x are y'. We allow negation on nouns.   We extend the system to include 'There are at least as many x as y' and 'There are more x than y'. The semantics for these are what one would expect. The goal is to study semantic consequence on finite models, to do proof search and counter-model construction."
    )
    printmd(
        "The logical system is studied in the paper 'Syllogistic inference with cardinality comparisons',in the the book 'J. Michael Dunn on information based logics', Springer 2016."
    )
    printmd(" ")
    printmd(
        "Type 'examples( )' for examples of queries. You might want to copy them into text boxes and then enter them to get an answer."
    )
    printmd(
        "Type 'syntax( )' for the general syntax of queries and other things you can enter."
    )
    printmd("Type 'rules( )' for the full set of proof rules of the system.")


def pre_process(assumption):
    v = assumption.split(" ")
    if v[0] == 'There' and v[1] == 'are':
        v = v[2:]
    if v[0] == 'At':
        v = [v[0] + " " + v[1]] + v[2:]
    if v[0] == 'at':
        v = ['At' + " " + v[1]] + v[2:]
    if v[1] == 'as' and v[2] == 'many':
        v = [v[0]] + v[3:]
    if v[0] == 'more':
        v = ['More'] + v[1:]
    if len(v[1]) == 1:
        aa = v[1]
        bb = (aa, pos)
    else:
        bb = (last(v[1]), neg)
    if len(v[3]) == 1:
        cc = v[3]
        dd = (cc, pos)
    else:
        dd = (last(v[3]), neg)
    if v[0] == 'No':
        v[0] = 'All'
        dd = negation(dd)
    return [v[0], bb, dd]


def follows(a_list, concluding_sent):
    global ass_list
    global concl
    concl = concluding_sent
    ass_list = a_list
    global Gamma
    global phi
    Gamma = []
    for ass in a_list:
        Gamma = Gamma + [pre_process(ass)]
    phi = pre_process(concl)
    sdagger(Gamma, phi)


def print_rule(number):
    if number == 1:
        print("")
        print("------------ axiom")
        print("All x are x")
    if number == 3:
        print("All x are y")
        print("------------------- antitone")
        print("All non-y are non-x")
    if number == 4:
        print("All x are non-x")
        print("---------------- zero")
        print("All x are y")
    if number == 5:
        print("All non-x are x")
        print("---------------- one")
        print("All y are x")
    if number == 6:
        print("All y are x")
        print("---------------------------------- subset card")
        print("There are at least as many x as y")
    if number == 7:
        print("There are at least as many x as y")
        print("------------------------------------------ card anti")
        print("There are at least as many non-y as non-x")
    if number == 8:
        print("All x are y")
        print("There are at least as many x as y")
        print("----------------------------------- card mix")
        print("All y are x")
    if number == 9:
        print("There are at least as many x as non-x")
        print("There are at least as many y as non-y")
        print("--------------------------------------- half")
        print("There are at least as many x as non-y")
    if number == 10:
        print("There are at least as many x as non-x")
        print("There are at least as many y as non-y")
        print("Some non-x are non-y")
        print("--------------------------------------- maj")
        print("Some x are y")
    if number == 11:
        print("All x are y")
        print("All y are z")
        print("------------- Barbara")
        print("All x are z")
    if number == 12:
        print("There are at least as many x as y")
        print("There are at least as many y as z")
        print("---------------------------------- card trans")
        print("There are at least as many x as z")
    if number == 13:
        print("Some x are y")
        print("------------- conversion")
        print("Some y are x")
    if number == 14:
        print("Some x are y")
        print("------------- Some")
        print("Some x are x")
    if number == 15:
        print("All x are y")
        print("Some x are z")
        print("------------- Darii")
        print("Some y are z")
    if number == 16:
        print("Some y are y")
        print("There are at least as many x as y")
        print("----------------------------------  card-some")
        print("Some x are x")
    if number == 17:
        print("There are more x than y")
        print("----------------------- more-some")
        print("Some x are non-y")
    if number == 18:
        print("There are more x than y")
        print("---------------------------------- more-card")
        print("There are at least as many x as y")
    if number == 20:
        print("There are more x than y")
        print("There are at least as many y as z")
        print("--------------------------------------- more left")
        print("There are more x than z")
    if number == 21:
        print("Some x are non-y")
        print("All y are x")
        print("-------------------------------------- more")
        print("There are more x than y")
    if number == 24:
        print("Some x are x")
        print("There are at least as many y as non-y")
        print("-------------------------------------- integer")
        print("Some y are y")
    if number == 25:
        print("There are at least as many x as non-x")
        print("There are more y than non-y")
        print("--------------------------------------- more right")
        print("There are more x than z")
    if number == 22:
        print("There are more x than y")
        print("-------------------------------- more anti")
        print("There are more non-y than non-x")
    if number == 23:
        print("Some x are non-y")
        print("--------------------------------------- strict half")
        print("There are more y than non-x")


def rules():
    printmdcolor("Here is the full set of proof rules of the logic:",
                 color='blue')
    for i in [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            20, 21, 22, 23, 24, 25
    ]:
        print_rule(i)
        print("")
    printmd("The system does not have Reductio ad Absurdum,")
    printmd("since we only need Ex Falso Quodlibet:")
    print("")
    printmd("Some x are y               There are more x than y")
    printmd("No x are y                 There are at least as many y as x")
    printmd("------------- X            --------------------------------- X")
    print("S                          S")
    print("")
    printmd(
        "The system is complete: all valid consequences can be proved in it.")
    printmdcolor("In fact, X is only needed at the end of derivations.",
                 color='red')


def mute():
    global verbosity
    verbosity = 0


def taciturn():
    global verbosity
    verbosity = 1


def talkative():
    global verbosity
    verbosity = 2


def garrulous():
    global verbosity
    verbosity = 3


from IPython.display import Markdown, display


def printmdcolor(string, color=None):
    colorstr = "<span style='color:{}'>{}</span>".format(color, string)
    display(Markdown(colorstr))


def printmd(string):
    colorstr = "<span>{}</span>".format(string)
    display(Markdown(colorstr))


instructions()
talkative()
#END
