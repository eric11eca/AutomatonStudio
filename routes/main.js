let home = require("./home"),
    truth = require('./truth'),
    fsm = require("./fsm"),
    cfg = require("./cfg");

module.exports = {
    "/": home,
    "/truth": truth,
    "/fsm": fsm,
    "/cfg": cfg
}