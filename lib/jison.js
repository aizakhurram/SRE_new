var typal      = require('./util/typal').typal;
var Set        = require('./util/set').Set;
var Lexer      = require('jison-lex');
var ebnfParser = require('ebnf-parser');
var JSONSelect = require('JSONSelect');
var esprima    = require('esprima');
var escodegen  = require('escodegen');
var Production = require('./util/Production');
var Nonterminal = require('./util/Nonterminal');
var generator = require('./generator');
var version = require('../package.json').version;
var lookaheadMixin = require('./mixins/lookaheadmixin')
var parser = require('./parser')
var LR0Generator = require('./parsers/lr0');
var LR1Generator = require('./parsers/lr1');
var SLRGenerator = require('./parsers/slr');
var LALRGenerator = require('./parsers/lalr');
var LLGenerator = require('./parsers/ll');
var lrGeneratorMixin = require('./mixins/lrgeneratormixin');
const {commonjsMain,each,printAction,findDefaults,resolveConflict}=require("./util/lr");
const { addTokenStack , removeErrorRecovery , createVariable } = require('./util/TokenUtility');
const { lalrGeneratorDebug, lrGeneratorDebug } = require('./generator-debug');

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
