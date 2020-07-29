let home = require("./home"),
    truth = require('./truth'),
    fsm = require("./fsm");

module.exports = {
    "/": home,
    "/truth": truth,
    "/fsm": fsm
}