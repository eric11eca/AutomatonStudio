let cfg = {};
let util = require("./util.js").data;



cfg.createCFG = function(){
    return{
        nonterminals: [],
        nonterminalAlphabet: [],
        alphabet: [],
        starting: undefined,
        ifchecked: false,
        ifpredefined: false,
        rules : {}
    };
};

cfg._addRule = function(arr1, arr2, obj1, obj2, arr_nonterminalAlphabet, arr_alphabet, ifpredefined, message1, message2, message3){
    if(util.contains(arr1, obj1) && util.contains(arr2, obj2)){
        throw new Error(message1);
    }

    if (obj1 == undefined){
        throw new Error(message2);
    }

    if( obj2 == undefined){
        throw new Error(message3);
    }

    if(!ifpredefined && util.contains(arr_alphabet, obj1)){
        arr_alphabet.splice(arr_alphabet.indexOf(obj1),1);
    }
    arr1.push(obj1);
    if(!util.contains(arr_nonterminalAlphabet, obj1)){
        arr_nonterminalAlphabet.push(obj1);
    }
    if(!ifpredefined){
    for (i = 0; i<obj2.length; i++){
        if(!util.contains(arr_alphabet, obj2[i]) && !util.contains(arr1,obj2[i])){
            arr_alphabet.push(obj2[i]);
        }
    }
    }   
    arr2.push(obj2);
    return true;
}

cfg.addRule = function(grammar, leftside, rightside){
    
    grammar.ifchecked = false;
    var output = cfg._addRule(grammar.nonterminals, grammar.rules, leftside, rightside, grmmar.alphabet, grammar.ifpredefined, "Repeated rule", "Empty given Leftside", "Empty given rightside");
    if (grammar.nonterminals.length == 1){
        grammar.starting = leftside;
    }
    return output;
}

cfg.preDefineAlphabet = function(grammar, arr){
    grammar.alphabet = [];
    for (i = 0; i<arr.length; i++){
        grammar.alphabet.push(arr[i]);
    }
    grammar.ifpredefined = true;
}

cfg.checkGrammar = function(grammar){
    if(grammar.ifpredefined){
        for (i = 0; i< grammar.rules.length;i++){
            var temp = grammar.rules[i];
            for (j = 0; j < grammar.rules[i].length; j++){
                if (!util.contains(grammar.alphabet, temp[j]) && !util.contains(grammar.nonterminals, temp[j])){
                    return false;
                }
            }
        }
    }else{
        var finites = [];
        var toCheck = [];
        for (i = 0;i< grammar.nonterminals.length;i++){
            if (!util.contains(toCheck, grammar.nonterminals[i])){
                toCheck.push(grammar.nonterminals[i]);
            }
        }
        for (i = 0; i< toCheck.length;i++){
            for (j = 0; j< grammar.nonterminals.length; j++){
                var loop = [];
                if(toCheck[i].localeCompare(grammar.nonterminals[j])){
                    if(grammar.rules[j].length == 1){
                        var singleOne = grammar.rules[j];
                        if(util.contains(alphabet,singleOne[0]) || util.contains(finites,singleOne[0])){
                            finites.push(toCheck[i]);
                            break;
                        }
                    }
                }
            }
        }
    }
    grammar.ifchecked = true;
    return true;
}
cfg.checkSymbol = function(nonterminals, rules, symbol){

}
cfg._eliminateEmpty = function(nonterminals, rules, nonterminalAlphabet){
    var nullables = [];
    for(i = 0; i< nonterminals.length; i++){
        if(rules[i].length == 1 && util.contains(rules[i], "Epsilon")){
            nullables.push(nonterminals[i]);
        }
    }
    var uncheckNonterminals = [];
    var uncheckRules = [];
    for (i=0;i<nonterminals.length;i++){
        if(!util.contains(nullables, nonterminals[i])){
            uncheckNonterminals.push(nonterminals[i]);
            uncheckRules.push(rules[i]);
        }
    }
    var ifAdd = true;
    while(ifAdd){
        ifAdd = false;
        for (i = 0; i<uncheckNonterminals.length;i++){
            var tempRule = uncheckRules[i];
            var ifNullable = true;
            for(j = 0; j<tempRule.length;j++){
                if(!util.contains(nullables, tempRule[j])){
                    ifNullable = false;
                    break;
                }
            }
            if(ifNullable){
                nullables.push(uncheckNonterminals[i]);
                var comparable = uncheckNonterminals[i];
                while(util.contains(uncheckNonterminals, comparable)){
                    var index = uncheckNonterminals.indexOf(comparable);
                    if(index <= i){
                        if(i>0){
                            i--;
                        }else{
                            i = -1;
                        }
                    }
                    uncheckNonterminals.splice(index,1);
                    uncheckRules.splice(index,1);
                }
                ifAdd = true;
            }
        }
    }
    var len = nonterminals.length;
    for (i=0; i<len; i++){
        if(rules[i].length > 1){
        var temp = rules[i];
        var ifDifferent = false;
        var newRule = [];
        for (j=0;j<temp.length;j++){
            if(util.contains(nullables, temp[j])){
                ifDifferent = true;
            }else{
                newRule.push(temp[j]);
            }
        }
        if(ifDifferent && newRule.length != 0 && !util.contains(rules, newRule) && !(newRule.length == 1 && newRule[0].localeCompare(nonterminals[i]))){
            nonterminals.push(nonterminals[i]);
            rules.push(newRule);
        }

    }else{
        var temp2 = rules[i];
        if(temp2.length == 1 && temp2[0].localeCompare("Epsilon")){
            nonterminals.splice(i,1);
            rules.splice(i,1);
            i--;    
        }
    }
}

}

var names = {};
name1 = "a1";
name2 = 'a2';
console.log(typeof name2);
console.log(typeof name1);
names[name1] = 5;
console.log(cfg.createCFG());
