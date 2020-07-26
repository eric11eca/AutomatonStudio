let home = require("./home"),
    truthTable = require('./truthTable'),
    fsm = require("./fsm");

module.exports = {
    "/": home,
    "/truth": truthTable, 
    "/fsm" : fsm
}
