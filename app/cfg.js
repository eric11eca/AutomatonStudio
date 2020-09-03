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
        parseTable: undefined,
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
    if(grammar.parseTable == undefined){
        grammar.parseTable = cfg.generateParseTable(grammar);
    }
    var outputArr = [];
    var table = grammar.parseTable;
    var stack1 = [];
    var iteratingIndex = 0;
    stack1.push(iteratingIndex);
    for(var i = 0; i<target.length ;i++){
        var func = table.tableContent[stack1[stack1.length-1]][table.row.indexOf(target.charAt(i))];
        if(func == undefined){
            return false;
        }
        if(func.length != 2){
            throw new Error('Given grammar is incorrect');
        }
        if(func.charAt(0).localeCompare('r')){
            var tempRule = table.rulesArr[parseInt(func.charAt(1))];
            var removeNum = tempRule[1].length;
            if(stack1.length - 1 < removeNum){
                return false;
            }
            stack1.splice(stack1.length-removeNum, removeNum);
            stack1.push(table.tableContent[stack1[stack1.length-1]][table.row.indexOf(tempRule[0])]);
            outputArr.push(func.charAt(1));
            i--;
        }else if (func.charAt(0).localeCompare('s')){
            stack1.push(parseInt(func.charAt(1)));
        }
    }
    var operating = true;
    while(operating){
        var func2 = table.tableContent[stack1[stack1.length-1]][0];
        var tempRule3 = table.rulesArr[parseInt(func2.charAt(1))];
        var removeNum4 = tempRule3[1].length;
        if(func2.localeCompare('accept')){
            operating = false;
        }else{
            if(stack1.length <= removeNum4){
                return false;
            }
            stack1.splice(stack1.length-removeNum4, removeNum4);
            stack1.push(table.tableContent[stack1[stack1.length-1]][table.row.indexOf(tempRule[0])]);
            outputArr.push(parseInt(func2.charAt(1)));
        }
    }
    return outputArr;
}

cfg.generateParseTable = function(grammar){
    var transitionTable = cfg.generateTransitionTable(grammar);
    var acceptSymbolArr = ['$'];
    var row = acceptSymbolArr.concat(transitionTable.row);
    var acceptRule = ['#', [grammar.starting, '.']];
    var extend_Grammar = cfg.generateExt_Grammar(grammar.rules, transitionTable, grammar.starting, grammar.alphabet.length);
    var firstSetsGenerating = cfg.generateFirstSets(extend_Grammar.rules, extend_Grammar.nonterminalAlphabet);
    var followingSetsGenerating = cfg.generateFollowingSets(firstSetsGenerating, extend_Grammar.rules, extend_Grammar.nonterminalAlphabet, extend_Grammar.starting);
    var extend_Rules = extend_Grammar.rules;
    var column = transitionTable.column;
    var tableContent = transitionTable.tableContent;
    var tableParseContent = [];
    var mergedForms = cfg.mergeExtendRules (extend_Rules, followingSetsGenerating, new Set());
    var rulesArr = [['#', [grammar.starting]]].concat(Array.from(grammar.rules));
    for(var i = 0; i < column.length;i++){
        tableParseContent[i] = [];
        var reduceNeeds = cfg.lookForCertainItemSet(mergedForms, i);
        if(util.contains(column[i], acceptRule )){
            tableParseContent[i].push("accept");
        }else{
            if(reduceNeeds != false && reduceNeeds.followingSet.has('$')){
                tableParseContent[i].push('r'+ rulesArr.indexOf(reduceNeeds.rule));
            }else{
                tableParseContent[i].push(undefined);
            }
        }
        for(var j = 1;j<row.length; j++){
            if(j<=grammar.alphabet.length){
                if(reduceNeeds != false && reduceNeeds.followingSet.has(row[j])){
                    tableParseContent[i].push('r' + rulesArr.indexOf(reduceNeeds.rule));
                }else if(tableContent[i][j] != undefined){
                    tableParseContent[i].push('s' +tableContent[i][j]);
                }else{
                    tableParseContent.push(undefined);
                }
            }else{
                tableParseContent[i].push(tableContent[i][j]);
            }
        }
    }
    grammar.parseTable = {
        row: row,
        column: column,
        rulesArr: rulesArr,
        tableContent: tableParseContent
    }
}


cfg.lookForCertainItemSet = function(mergedRuleArrs, index){
    for(var i = 0; i<mergedRuleArrs.length; i++){
        var tempForm = mergedRuleArrs[i];
        if(tempForm[0] == index){
            return {
                followingSet: tempForm[2],
                rule: tempForm[1]
            }
        }
    }
    return false;
}

cfg.mergeExtendRules = function(rules, followSets, checked){
    var outputTuples = [];
    for(var rule of rules){
        if(!checked.has(rule)){
            outputTuples.push(cfg.constructMergedRules(rule, rules, followSets, checked));

        }
    }
    return outputTuples;
}

cfg.constructMergedRules = function(rule, rules, followSets, checked){
    var rightSideGivenRule = rule[1];
    var outputForm = [];
    outputForm.push(rightSideGivenRule[rightSideGivenRule.length-1].charAt(2));
    for(var ruleCurrent of rules){
        var rightSideCurrent = ruleCurrent[1];
        if(rightSideCurrent[rightSideCurrent.length-1].charAt(2).localeCompare(rightSideGivenRule[rightSideGivenRule.length-1].charAt(2))){
            var originalRule = cfg.compareOriginalRuleFrom(rule, ruleCurrent);
            if(originalRule != false){
                if(!(util.contains(checked, ruleCurrent) || util.areEquivalent(rule, ruleCurrent))){
                    checked.add(ruleCurrent);
                    if(outputForm.length == 1){
                        outputForm.push(originalRule);
                        outputForm.push(util.Union(followSets[ruleCurrent[0]], followSets[rule[0]]));
                    }else{
                        outputForm[2] = util.Union(outputForm[2], followSets[ruleCurrent[0]]);
                    }
                }
            }
        }
    }
    return outputForm;
}

cfg.compareOriginalRuleFrom = function (ext_rule1, ext_rule2){
    var originalRuleOutput = [];
    if(ext_rule1[0].charAt(1).localeCompare(ext_rule2[0].charAt(1))){
        originalRuleOutput.push(ext_rule1[0].charAt(1));
        var rightSideExt1 = ext_rule1[1];
        var rightSideExt2 = ext_rule2[1];
        if(rightSideExt1.length == rightSideExt2.length){
            for(var i = 0;i<rightSideExt2.length;i++){
                if(!rightSideExt1[i].charAt(1).localeCompare(rightSideExt2[i].charAt(1))){
                    return false;
                }
                if(orignalRuleOutput.length == 1){
                    orignalRuleOutput[1] = [];
                }
                orignalRuleOutput[1].push(rightSideExt1[i].charAt(1));
            }
        }
    }

    return originalRuleOutput;

}



cfg.generateFollowingSets = function(firstSets, rules, nonterminals, startSymbol){
    var followingSets = [];
    follwingSets[startSymbol] = new Set();
    follwingSets[startSymbol].add('$');
    for(var rule of rules){
        var rightSide = rule[1];
        for(var i = 0;i<rightSide.length;i++){
            if(util.contains(nonterminals, rightSide[i])){
                if(followingSets[rightSide[i]] == undefined){
                    followingSets[rightSide[i]] = new Set();
                }
                for(var j = i+1; j<rightSide.length;j++){
                    if(util.contains(nonterminals, rightSide[j])){
                        if(firstSets[rightSide[j]] == undefined){
                            throw new Error ("first sets are not corresponding with following sets function");
                        }
                        followingSets[rightSide[i]].add(firstSets[rightSide[j]]);
                        if(!util.contains(firstSets[rightSide[j]], "Epsilon")){
                            break;
                        }
                    }else{
                        followingSets.push(rightSide[j]);
                        break;
                    }
                }
            }
        }
    }

    for(var rule1 of rules){
        var rightSide1 = rule1[1];
        if(util.contains(nonterminals, rightSide1[rightSide1.length-1])){
            if(rule1[0] == undefined){
                followingSets[rule1[0]] = new Set();
            }else{
                followingSets[rightSide1[rightSide1.length-1]].add(followingSets[rule1[0]]);   
            }
        }
    }
    for(var nonterminalIter1 of nonterminals){
        if(followingSets[nonterminalIter1] == undefined){
            throw new Error("Given grammar is incorrect");
        }
        util.flat(followingSets[nonterminalIter1]);
    }
}



cfg.generateFirstSets = function(rules, nonterminals){
    var symbolRules = cfg.orderRules(rules);
    var firstSets = [];
    for (var nonterminal of nonterminals){
        var tempSymbolRules = symbolRules[nonterminal];
        for (var i = 0; i<symbolRules[nonterminal].length; i++){
            var tempSymbolRule = tempSymbolRules[i];
            var rightSides = tempSymbolRule[1];
            if(!util.contains(nonterminals, rightSides[0])){
                if(rightSides[0].localeCompare("Epsilon") && rightSides.length != 1){
                    throw new Error ("wrong right side of rule");
                }
                if(firstSets[nonterminal] == undefined){
                    firstSets[nonterminal] = [rightSides[0]];
                }else{
                    firstSets[nonterminal].push(rightSides[0]);
                }
            }
        }
    }
    for (var nonterminal1 of nonterminals){
        cfg.generateFirst(symbolRules, nonterminal1, nonterminals, firstSets);
    }
    
    return firstSets;
}
 
cfg.generateFirst = function(symbolRules, symbol, nonterminals, firstSets){
    var cfgFirstSet = new Set();
    if(firstSets[symbol] != undefined){
        cfgFirstSet = firstSets[symbol];
    }
    for(var symbolRule of symbolRules[symbol]){
        var rightSide1 = symbolRule[1];
        for(var i = 0; i<rightSide1;i++){

            if(nonterminals.has(rightSide1[i])){
                if(firstSets[rightSide1[i]] == undefined){
                    firstSets[rightSide1[i]] = new Set();
                }
                cfgFirstSet.add(firstSets[rightSide1[i]]);
                if(!firstSets[rightSide1[i]].has("Epsilon")){
                    break;
                }else{
                    if(i == rightSide1.length-1){
                        cfgFirstSet.add("Epsilon");
                    }
                }
            }else{
                if(i==0){
                    if(firstSets[symbol] == undefined || !firstSets[symbol].has(rightSide1[0]) ){
                        throw new Error ('func cfg.generateFirst receives wrong firstSets'); 
                    }
                }else{
                    cfgFirstSet.add(rightSide1[i]);
                    break;
                }
            }
        }
    }
    firstSets[symbol] = util.flat(cfgFirstSet);
}

cfg.loadFirsts = function(firstSet, loadingSet){
    for(var loadingItem of loadingSet){
        if(!loadingItem.localeCompare("Epsilon")){
            firstSet.add(loadingItem);
        }
    }
}


cfg.orderRules = function(rules){
    var orderedRules = [];
    for(var ruleIter2 of rules){
        if(orderedRules[ruleIter2[0]] == undefined){
            orderedRules[ruleIter2[0]] = [ruleIter2];
        }else{
            orderedRules[ruleIter2[0]].push(ruleIter2);
        }
    }
    return orderedRules;
}

cfg.generateExt_Grammar = function (rules, transitionTable, startSymbol, startIndex){
    var ext_rules = [];
    var row = transitionTable.row;
    var column = transitionTable.column;
    var content = transitionTable.tableContent;
    var ext_Grammar = cfg.createCFG();
    ext_rules.push(cfg.constructExt_Rule(['#',[startSymbol]], 0, row.indexOf(startSymbol)));
    for (var i = startIndex; i<row.length;i++){
        var ruleSet = cfg.gatherRuleSet(rules, row[i]);
        for(var j = 0;j<column.length;j++){
            if(content[j][i] != undefined){
                for (var ruleIter of ruleSet){
                    var ruleToAdd = cfg.constructExt_Rule(ruleIter, j, i);
                    ext_rules.push(ruleToAdd);
                    cfg.addRule(ext_Grammar, ruleToAdd[0], ruleToAdd[1]);
                }
            }
        }
    }
    return ext_Grammar;
}

cfg.constructExt_Rule = function(rule, rowIndex, columnIndex, tableContent, row){
    var rightSide = [];
    var originalRightSide = rule[1];
    var startIndex = rowIndex;
    for (var i = 0;i<rule[1].length;i++){
        var symbolColumnIndex = row.indexOf(originalRightSide[i]);
        if(tableContent[startIndex][symbolColumnIndex] == undefined){
            throw new Error("Wrong transition table");
        }else{
            rightSide.push(startIndex+originalRightSide[i]+tableContent[startIndex][symbolColumnIndex]);
            startIndex = tableContent[startIndex][symbolColumnIndex];
        }
    }
    return [rowIndex+rule[0]+tableContent[rowIndex][columnIndex], rightSide];
}

cfg.gatherRuleSet = function (rules, symbol){
    var ruleSet = new Set();
    for(var ruleItem2 of rules){
        if(ruleItem2[0].localeCompare(symbol)){
            ruleSet.add(ruleItem2);
        }
    }
    return ruleSet;
}

cfg.generateTransitionTable = function(grammar){
    var itemSets = [];
    var initSet = cfg.generateZeroSet (['#', ['.', grammar.starting]], grammar.alphabet, symbolLooped, grammar.rules);
    itemSets.push(initSet);
    var symbolArray = Array.from(grammar.alphabet);
    symbolArray.concat(Array.from(grammar.nonterminalAlphabet));
    var outputTable = [];
    for(var i = 0;i<itemSets.length;i++){
        outputTable.push(cfg.generateTransitionRow(itemSets[i], Array.from(grammar.alphabet).concat(Array.from(grammar.nonterminalAlphabet)), itemSets));    
    }
    return {
        row: symbolArray,
        column: itemSets,
        tableContent: outputTable
    };
}

cfg.generateTransitionRow = function (itemSet, symbols, itemSets){
    var output = [];
    for (var i = 0; i< symbols;i++){
        var tempResult = cfg.itemSetSimulate(itemSet, symbols[i]);
        if(util.areEquivalent(tempResult, [])){
            rowElement.push(undefined);
        }else{
            if(!util.contains(itemSets, tempResult)){
                itemSets.push(tempResult);
                output.push(itemSets.length-1);
            }else{
                output.push(itemSets.indexOf(tempResult));
            }
        }
        
    }
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
var logs = new Set();
logs['c'] = 2;
console.log(logs['c']);
console.log(logs['a']);