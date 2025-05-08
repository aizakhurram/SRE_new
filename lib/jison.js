var typal      = require('./util/typal').typal;
var version = require('../package.json').version;
var parser = require('./parser')
var LR0Generator = require('./parsers/lr0');
var LR1Generator = require('./parsers/lr1');
var SLRGenerator = require('./parsers/slr');
var LALRGenerator = require('./parsers/lalr');
var LLGenerator = require('./parsers/ll');


var Jison = exports.Jison = exports;
Jison.version = version;

// detect print

if (typeof console !== 'undefined' && console.log) {
    Jison.print = console.log;
} else if (typeof puts !== 'undefined') {
    Jison.print = function print () { puts([].join.call(arguments, ' ')); };
} else if (typeof print !== 'undefined') {
    Jison.print = print;
} else {
    Jison.print = function print () {};
}

Jison.Parser = (function () {


Jison.Generator = function Jison_Generator (g, options) {
    var opt = typal.mix.call({}, g.options, options);
    switch (opt.type) {
        case 'lr0':
           return new LR0Generator(g, opt);
        case 'slr':
            return new SLRGenerator(g, opt);
        case 'lr':
            return new LR1Generator(g, opt);
        case 'll':
            return new LLGenerator(g, opt);
        default:
            return new LALRGenerator(g, opt);
    }
};

return function Parser (g, options) {
        var gen = Jison.Generator(g, options);
        return gen.createParser();
    };

})();
