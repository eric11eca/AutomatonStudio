let cfg = {};
let util = require("./util.js").data;



cfg.createCFG = function(){
    return{
        nonterminals: [],
        alphabet: [],
        starting: undefined,
        ifchecked: false,
        ifpredefined: false,
        rules : []
    };
};

cfg._addRule = function(arr1, arr2, obj1, obj2, arr_alphabet, ifpredefined, message1, message2, message3){
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

var names = {};
name1 = "a1";
name2 = 'a2';
console.log(typeof name2);
console.log(typeof name1);
names[name1] = 5;
console.log(cfg.createCFG());
