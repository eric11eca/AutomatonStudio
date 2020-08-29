const e = require("express");

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

    if(!ifpredefined && util.containsInSet(arr_alphabet, obj1)){
        arr_alphabet.delete(obj1);
    }
    arr1.add(obj1);
    if(!ifpredefined){
    for (var i = 0; i<obj2.length; i++){
        if(!util.containsInSet(arr_alphabet, obj2[i]) && !util.containsInSet(arr1,obj2[i])){
            arr_alphabet.add(obj2[i]);
        }
    }
    }
    arr2.add([obj1,obj2]);
    return true;
}

cfg.addRule = function(grammar, leftside, rightside){
    
    grammar.ifchecked = false;
    var output = cfg._addRule(grammar.nonterminalAlphabet, grammar.rules, leftside, rightside, grammar.alphabet, grammar.ifpredefined, "Empty given Leftside", "Empty given rightside");
    if (grammar.nonterminalAlphabet.size == 1){
        grammar.starting = leftside;
    }
    return output;
}

cfg.preDefineAlphabet = function(grammar, arr){
    grammar.alphabet = new Set();
    for (var i = 0; i<arr.length; i++){
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
            for (var j = 0; j < temp[1].length; j++){
                var rightside = temp[1];
                if (!util.containsInSet(grammar.alphabet, rightside[j]) && !util.containsInSet(grammar.nonterminals, rightside[j])){
                    return false;
                }
            }
        }
    }else{
        var finites = new Set();
        var toCheck = util.clone(grammar.nonterminalAlphabet);
        for (var itemToCheck of toCheck){
            var loop = new Set();
            if(!util.containsInSet(finites, itemToCheck)){
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
            for(var i = 0; i<rightside.length;i++){
                if(!(util.containsInSet(finites, rightside[i]) || !util.containsInSet(nonterminals, rightside[i]))){
                if(!util.containsInSet(looped, rightside[i])){
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
        for (var i = 0; i<uncheckNonterminals.length;i++){
            var tempRule = uncheckRules[i];
            var ifNullable = true;
            for(var k = 0; k<tempRule.length; k++){
                var tempRuleK = tempRule[k];
            for(var j = 0; j<tempRuleK.length;j++){
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
        for (var j=0;j<temp.length;j++){
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
    for (var i = 0;i<indexes.length;i++){
        var arr1 = util.clone(indexes);
        for(var j = i+1;j<arr1.length;j++){
            arr1[j] = arr1[j] - 1;
        }
        nonterminals.push(symbol);
        arr1.splice(i,1);
        var ruleNext = util.clone(rule);
        ruleNext.splice(arr1[i],1);
        if(!util.containsInSet(arr, ruleNext) && !(ruleNext.length == 1 && ruleNext[0].localeCompare(symbol))){
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
                for(var j = 0; j< nonterminals.length;j++){
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
    for(var i = 0; i< terminalsArray.length; i++){
        var tempName = capChar.concat(terminalsArray[i].toLowerCase());
        terminalNames.push(tempName);
        rules.add([terminalsArray[i], tempName]);
    }
    for(var ruleToModify of rules){
        if(ruleToModify[1].length > 1){
            var rightSideRule = ruleToModify[1];
            for(var j = 0; j < rightSideRule.length; j++){
                if(util.containsInSet(terminals, rightSideRule[j])){
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

cfg.parseInputIn = function(ruleArray, grammar){
    for(var k = 0; k<ruleArray.length; k++){
        var leftSideCorrect = false;
        var rightSideCorrect = false;
        var ruleArr = ruleArray[k].split('->');
        if(ruleArr.length != 2){
            throw new Error("One Side is incorrect");
        }
        var leftSide = cfg.removeSpace(ruleArr[0]);
        var rightSide = cfg.removeSpace(ruleArr[1]);
        if(leftSide.length != 1){
            throw new Error("Left Side length wrong");
        }
        if(rightSide.length == 0){
            throw new Error('Right Side Empty');
        }
        rightSideArray = [];
        for(var j = 0; j< rightSide.length; j++){
            if(rightSide[j] == '$'){
                rightSideArray.push('Epsilon');
            }else{
                rightSideArray.push(rightSide[j]);
            }
        }
        
        cfg.addRule(grammar, leftSide, rightSideArray);
    }
}

cfg.removeSpace = function(objString){
    var output = "";
    for(var i = 0; i<objString.length;i++){
        if(objString[i] != ' '){
            output += objString[i];
        }
    }
    return output;
}

cfg.LRParsing = function(grammar, target){
    var table = cfg.parseTable;
}

cfg.generateItemSets = function(grammar){
    var itemSets = [];
    var initSet = cfg.generateZeroSet (['#', ['.', grammar.starting]], grammar.alphabet, symbolLooped, grammar.rules);
    itemSets.push(initSet);
    var symbolArray = [];
    var firstRow = [];
    var outPutTable = [];
    for(var nonterminal of grammar.nonterminalAlphabet){
        symbolArray.push(nonterminal);
        var tempResult = cfg.itemSetSimulate(initSet, nonterminal);
        if(util.areEquivalent(tempResult, [])){
            firstRow.push(undefined);
        }else{
            if(!util.contains(itemSets, tempResult)){
                itemSets.push(tempResult);
                firstRow.push(itemSets.length-1);
           }else{
               firstRow.push(itemSets.indexOf(tempResult));
           }
        }
    }
    for(var terminal of grammar.terminal){
        symbolArray.push(terminal);
        var tempResult = cfg.itemSetSimulate(initSet, terminal);
        if(util.areEquivalent(tempResult, [])){
            firstRow.push(undefined);
        }else{
            if(!util.contains(itemSets, tempResult)){
                itemSets.push(tempResult);
                firstRow.push(itemSets.length-1);
            }else{
                firstRow.push(itemSets.indexOf(tempResult));
            }
        }
    }
    outPutTable.push(firstRow);
    for (var i = 1;i<itemSets.length;i++){
        var rowElement = [];
        for(var j  = 0;j<symbolArray.length;j++){
            var tempResult = cfg.itemSetSimulate(initSet, terminal);
            if(util.areEquivalent(tempResult, [])){
                rowElement.push(undefined);
            }else{
                if(!util.contains(itemSets, tempResult)){
                    itemSets.push(tempResult);
                    rowElement.push(itemSets.length-1);
                }else{
                    rowElement.push(itemSets.indexOf(tempResult));
                }
            }
        }
        outPutTable.push(rowElement);
    }
    return rowElement;
}

cfg.generateZeroSet = function(rule, alphabet, looped, rules){
    var startSymbol = cfg.findNextSymbol(rule[1]);
    var result = [];
    if(util.contains(looped, startSymbol)){
        result.push(rule);
        return result;
    }else{
        looped.push(startSymbol);
    }
    if(util.contains(alphabet, startSymbol)){
        result.push(rule);
        return result;
    }else{
        for(var ruleInSet1 of rules){
            if(ruleInSet1[0].localeCompare(startSymbol)){
                var rightSideCopy = util.clone(ruleInSet1[1]);
                var dot = ['.'];
                result = result.concat(cfg.generateZeroSet (dot.concat(rightSideCopy), alphabet, looped, rules));
            }
        }

    }
    return result;
}

cfg.findNextSymbol =  function(ruleRightSide){
    for(var i = 0;i< ruleRightSide.length;i++){
        if(ruleRightSide[i].localeCompare('.')){
            if(ruleRightSide.length == (i+1)){
                throw new Error('No next Symbol');
            }else{
                return ruleRightSide[i+1];
            }
        }
    }
    throw new Error('No dot symbol');
}

cfg.itemSetSimulate = function(itemSet, input){
    var output = [];
    for(var i = 0;i<itemSet.length;i++){
        var tempRule = itemSet[i];
        if(input.localeCompare(cfg.findNextSymbol(tempRule[1]))){
            output.push(tempRule);
        }
    }
    return cfg.moveDot(output);
}

cfg.moveDot = function(itemSet){
    var output = [];
    for(var i = 0; i<itemSet.length;i++){
        var target = util.clone(itemSet[i]);
        var tempRule = target[1].splice(target[1].indexOf('.')+2,0,'.');
        tempRule.splice(tempRule.indexOf('.'),1);
        output.push(tempRule);
    }
    return output;
}

exports.data = cfg;
var names = {};
name1 = "a1";
name2 = 'a2';
//console.log(typeof name2);
//console.log(typeof name1);
names[name1] = 5;
//console.log(cfg.createCFG());
