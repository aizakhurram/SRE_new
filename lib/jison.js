var typal      = require('./util/typal').typal;
var version = require('../package.json').version;
var parser = require('./parser')
var parsers = require('./parsers/parser-generator');
const { getPrintFunction }=require("./util/lr");
var Jison = exports.Jison = exports;
Jison.version = version;


// detect print
Jison.print = getPrintFunction();


Jison.Parser = (function () {
    Jison.Generator = function Jison_Generator(g, options) {
        var opt = typal.mix.call({}, g.options, options);
        var GeneratorClass = parsers[opt.type] || parsers.lalr;
        return new GeneratorClass(g, opt);
    };

    return function Parser(g, options) {
        var gen = Jison.Generator(g, options);
        return gen.createParser();
    };
})();