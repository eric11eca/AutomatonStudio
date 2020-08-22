let cfg = {};
let util = require("./util.js").data;



cfg.createCFG = function(){
    return{
        nonterminalAlphabet: new Set(),
        alphabet: new Set(),
        starting: undefined,
        ifchecked: false,
        ifpredefined: false,
        rules : new Set()
    };
};


cfg._addRule = function(arr1, arr2, obj1, obj2, arr_alphabet, ifpredefined, message2, message3){

    if (obj1 == undefined){
        throw new Error(message2);
    }

    if( obj2 == undefined){
        throw new Error(message3);
    }

    if(!ifpredefined && util.contains(arr_alphabet, obj1)){
        arr_alphabet.delete(obj);
    }
    arr1.add(obj1);
    if(!ifpredefined){
    for (i = 0; i<obj2.length; i++){
        if(!util.contains(arr_alphabet, obj2[i]) && !util.contains(arr1,obj2[i])){
            arr_alphabet.add(obj2[i]);
        }
    }
    }   
    arr2.add([obj1,obj2]);
    return true;
}

cfg.addRule = function(grammar, leftside, rightside){
    
    grammar.ifchecked = false;
    var output = cfg._addRule(grammar.nonterminals, grammar.rules, leftside, rightside, grmmar.alphabet, grammar.ifpredefined, "Empty given Leftside", "Empty given rightside");
    if (grammar.nonterminalAlphabet.size == 1){
        grammar.starting = leftside;
    }
    return output;
}

cfg.preDefineAlphabet = function(grammar, arr){
    grammar.alphabet = new Set();
    for (i = 0; i<arr.length; i++){
        grammar.alphabet.add(arr[i]);
    }
    grammar.ifpredefined = true;
}

cfg.checkGrammar = function(grammar){
    if(grammar.ifpredefined){
        for (var temp of grammar.rules){
            if(temp.length != 2){
                return false;
            }
            for (j = 0; j < temp[1].length; j++){
                var rightside = temp[1];
                if (!util.contains(grammar.alphabet, rightside[j]) && !util.contains(grammar.nonterminals, rightside[j])){
                    return false;
                }
            }
        }
    }else{
        var finites = new Set();
        var toCheck = util.clone(grammar.nonterminalAlphabet);
        for (var itemToCheck of toCheck){
            var loop = new Set();
            if(!util.contains(finites, itemToCheck)){
                if(!cfg.checkSymbol(toCheck, grammar.rules, itemToCheck, loop, finites)){
                    return false;
                }
            }
        }
    }
    grammar.ifchecked = true;
    return true;
}

cfg.checkSymbol = function(nonterminals, rules, symbol, looped, finites){
    for(var rule of rules){
        var currentRuleFalse = false;
        if(rule[0].localeCompare(symbol)){
            var rightside = rule[1];
            for(i = 0; i<rightside.length;i++){
                if(!(util.contains(finites, rightside[i]) || !util.contains(nonterminals, rightside[i]))){
                if(!util.contains(looped, rightside[i])){
                    looped.add(rightside[i]);
                    if(cfg.checkSymbol(nonterminals, rules, rightside[i], looped, finites)){
                        finites.add(rightside[i]);
                    }else{
                        currentRuleFalse = true;
                        break;
                    }
                }
            }
            }
            if(!currentRuleFalse){
                finites.add(symbol);
                return true;
            }
        }
    }
    return false;
}
cfg._eliminateEmpty = function(nonterminals, rules){
    var nullables = [];
    for(var ruleItem of rules){
        if(ruleItem[1].length == 1 && util.contains(ruleItem[1], "Epsilon")){
            nullables.push(ruleItem[0]);
        }
    }
    var uncheckNonterminals = [];
    var uncheckRules = [];
    for (var ruleItem1 of rules){
        if(!util.contains(nullables, ruleItem1[0])){
            if(!util.contains(uncheckNonterminals, ruleItem1[0])){
                uncheckNonterminals.push(ruleItem1[0]);
                uncheckRules.push([ruleItem1[1]]);
            }else{
                var index = uncheckNonterminals.indexOf(ruelItem[0]);
                uncheckRules[index].push(ruleItem1[1]);
            }
        }  
    }
    var ifAdd = true;
    while(ifAdd){
        ifAdd = false;
        for (i = 0; i<uncheckNonterminals.length;i++){
            var tempRule = uncheckRules[i];
            var ifNullable = true;
            for(k = 0; k<tempRule.length; k++){
                var tempRuleK = tempRule[k];
            for(j = 0; j<tempRuleK.length;j++){
                if(!util.contains(nullables, tempRuleK[j])){
                    ifNullable = false;
                    break;
                }
            }
            if(!ifNullable){
                break;
            }
        }
            if(ifNullable){
                nullables.push(uncheckNonterminals[i]);
                uncheckNonterminals.splice(i,1);
                uncheckRules.splice(i,1);
                i--;
                ifAdd = true;
            }
        }
    }
    var len = nonterminals.length;
    for (var ruleItem2 of rules){
        if(ruleItem2[1].length > 1){
        var temp = ruleItem2[1];
        var ifDifferent = false;
        var nullableIndexes = [];
        for (j=0;j<temp.length;j++){
            if(util.contains(nullables, temp[j])){
                ifDifferent = true;
                nullableIndexes.push(j);
            }
        }
        if(ifDifferent){
            for(k = 0;k<nullableIndexes.length;k++){
                var addRule = util.clone(temp).splice(nullableIndexes[k], 1);
                rules.add([ruleItem2[0], addRule]);
            }
            //cfg.modifyRule(temp, rules, nonterminals, nonterminals[i], nullableIndexes);
        }

    }else{
        var temp2 = ruleItem2[1];
        if(temp2.length == 1 && temp2[0].localeCompare("Epsilon")){
            rules.delete(ruleItem2);    
        }
    }
}

}

cfg.eliminateEmpty = function(grammar){
    return cfg._eliminateEmpty(grammar.nonterminalAlphabet, grammar.rules);
}

cfg.modifyRule = function(rule, arr, nonterminals, symbol, indexes){
    for (i = 0;i<indexes.length;i++){
        var arr1 = util.clone(indexes);
        for(j = i+1;j<arr1.length;j++){
            arr1[j] = arr1[j] - 1;
        }
        nonterminals.push(symbol);
        arr1.splice(i,1);
        var ruleNext = util.clone(rule);
        ruleNext.splice(arr1[i],1);
        if(!util.contains(arr, ruleNext) && !(ruleNext.length == 1 && ruleNext[0].localeCompare(symbol))){
            arr.push(ruleNext);
            if(ruleNext.length>1 && arr1.length != 0){
            cfg.modifyRule(ruleNext, arr, nonterminals, symbol, arr1);
            }
        }
    }
}

cfg.removeUnit = function(rules, nonterminals){
    var ifUnitProductionExists = true;
    var removedRules = [];
    while(ifUnitProductionExists){
        ifUnitProductionExists = false;
        for(var rule1 of rules){
            var tempRule = util.clone(rule1[1]);
            if(tempRule.length == 1 && !tempRule[0].localeCompare("Epsilon")){
                ifUnitProductionExists = true;
                removedRules.push([rule1[0], tempRule]);
                for(j = 0; j< nonterminals.length;j++){
                    if(nonterminals[j].localeCompare(tempRule[0])){
                        if(!util.contains(removedRules, [nonterminals[j], tempRule])){
                            rules.add([nonterminals[j], tempRule]);
                        }
                    }
                }
            }
        }
    }
}

cfg.removeMixed = function(rules, terminals){
    var terminalsArray = Array.from(terminals);
    var capChar = "T";
    var terminalNames = [];
    for(i = 0; i< terminalsArray.length; i++){
        var tempName = capChar.concat(terminalsArray[i].toLowerCase());
        terminalNames.push(tempName);
        rules.add([terminalsArray[i], tempName]);
    }
    for(var ruleToModify of rules){
        if(ruleToModify[1].length > 1){
            var rightSideRule = ruleToModify[1];
            for(j = 0; j < rightSideRule.length; j++){
                if(util.contains(terminals, rightSideRule[j])){
                    rightSideRule[j] = terminalNames[terminalsArray.indexOf(rightSideRule[j])];
                }
            }
        }
    }

}

cfg.removeLong = function(rules){
    var index = "1";
    var symbolName = "Lr";
    for(var longRule of rules){
            cfg.addSize2Rule(rules, longRule[1], symbolName, index);
    }
}

cfg.addSize2Rule = function(rules, rule, symbolName, indexString){
    if(rule[1].length>2){
        var ruleRightSide = util.clone(rule[1]);
        var itemIndexZero = ruleRightSide[0];
        ruleRightSide = ruleRightSide.splice(0,1);
        rules.add([rule[0], [itemIndexZero, symbolName.concat(indexString)]]);
        rules.delete(rule);
        indexString = parseInt(indexString);
        indexString++;
        indexString = indexString.toString();
        cfg.addSize2Rule(rules, [symbolName.concat(indexString), ruleRightSide], symbolName, indexString);
    }
}

cfg.convertToChomskyNormalForm = function(grammar){
    cfg.eliminateEmpty(grammar);
    cfg.removeUnit(grammar.rules, grammar.nonterminalAlphabet);
    cfg.removeMixed(grammar.rules, grammar.alphabet);
    cfg.removeLong(grammar.rules);
}

var names = {};
name1 = "a1";
name2 = 'a2';
//console.log(typeof name2);
//console.log(typeof name1);
names[name1] = 5;
//console.log(cfg.createCFG());
