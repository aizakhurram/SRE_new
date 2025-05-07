// Refactored Jison Parser Generator
// Reusable methods and constructors extracted to the top

// ==== Extracted Utilities and Constructors ====



// ==== Main Execution Logic ====

// Jison, an LR(0), SLR(1), LARL(1), LR(1) Parser Generator
// Zachary Carter <zach@carter.name>
// MIT X Licensed

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
var lookaheadMixin = require('./lookaheadmixin')
var parser = require('./parser')
var lrGeneratorMixin = require('./lrgeneratormixin');
const LR0Generator = require('./lr0').LR0Generator;

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

// iterator utility
function each (obj, func) {
    if (obj.forEach) {
        obj.forEach(func);
    } else {
        var p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                func.call(obj, obj[p], p, obj);
            }
        }
    }
}

/*
 * Mixin for common LR parser behavior
 * */
//var lrGeneratorMixin = {};
//
//lrGeneratorMixin.buildTable = function buildTable () {
//    if (this.DEBUG) this.mix(lrGeneratorDebug); // mixin debug methods
//
//    this.states = this.canonicalCollection();
//    this.table = this.parseTable(this.states);
//    this.defaultActions = findDefaults(this.table);
//};
//
//lrGeneratorMixin.Item = typal.construct({
//    constructor: function Item(production, dot, f, predecessor) {
//        this.production = production;
//        this.dotPosition = dot || 0;
//        this.follows = f || [];
//        this.predecessor = predecessor;
//        this.id = parseInt(production.id+'a'+this.dotPosition, 36);
//        this.markedSymbol = this.production.handle[this.dotPosition];
//    },
//    remainingHandle: function () {
//        return this.production.handle.slice(this.dotPosition+1);
//    },
//    eq: function (e) {
//        return e.id === this.id;
//    },
//    handleToString: function () {
//        var handle = this.production.handle.slice(0);
//        handle[this.dotPosition] = '.'+(handle[this.dotPosition]||'');
//        return handle.join(' ');
//    },
//    toString: function () {
//        var temp = this.production.handle.slice(0);
//        temp[this.dotPosition] = '.'+(temp[this.dotPosition]||'');
//        return this.production.symbol+" -> "+temp.join(' ') +
//            (this.follows.length === 0 ? "" : " #lookaheads= "+this.follows.join(' '));
//    }
//});
//
//lrGeneratorMixin.ItemSet = Set.prototype.construct({
//    afterconstructor: function () {
//        this.reductions = [];
//        this.goes = {};
//        this.edges = {};
//        this.shifts = false;
//        this.inadequate = false;
//        this.hash_ = {};
//        for (var i=this._items.length-1;i >=0;i--) {
//            this.hash_[this._items[i].id] = true; //i;
//        }
//    },
//    concat: function concat (set) {
//        var a = set._items || set;
//        for (var i=a.length-1;i >=0;i--) {
//            this.hash_[a[i].id] = true; //i;
//        }
//        this._items.push.apply(this._items, a);
//        return this;
//    },
//    push: function (item) {
//        this.hash_[item.id] = true;
//        return this._items.push(item);
//    },
//    contains: function (item) {
//        return this.hash_[item.id];
//    },
//    valueOf: function toValue () {
//        var v = this._items.map(function (a) {return a.id;}).sort().join('|');
//        this.valueOf = function toValue_inner() {return v;};
//        return v;
//    }
//});
//
//lrGeneratorMixin.closureOperation = function closureOperation (itemSet /*, closureSet*/) {
//    var closureSet = new this.ItemSet();
//    var self = this;
//
//    var set = itemSet,
//        itemQueue, syms = {};
//
//    do {
//    itemQueue = new Set();
//    closureSet.concat(set);
//    set.forEach(function CO_set_forEach (item) {
//        var symbol = item.markedSymbol;
//
//        // if token is a non-terminal, recursively add closures
//        if (symbol && self.nonterminals[symbol]) {
//            if(!syms[symbol]) {
//                self.nonterminals[symbol].productions.forEach(function CO_nt_forEach (production) {
//                    var newItem = new self.Item(production, 0);
//                    if(!closureSet.contains(newItem))
//                        itemQueue.push(newItem);
//                });
//                syms[symbol] = true;
//            }
//        } else if (!symbol) {
//            // reduction
//            closureSet.reductions.push(item);
//            closureSet.inadequate = closureSet.reductions.length > 1 || closureSet.shifts;
//        } else {
//            // shift
//            closureSet.shifts = true;
//            closureSet.inadequate = closureSet.reductions.length > 0;
//        }
//    });
//
//    set = itemQueue;
//
//    } while (!itemQueue.isEmpty());
//
//    return closureSet;
//};
//
//lrGeneratorMixin.gotoOperation = function gotoOperation (itemSet, symbol) {
//    var gotoSet = new this.ItemSet(),
//        self = this;
//
//    itemSet.forEach(function goto_forEach(item, n) {
//        if (item.markedSymbol === symbol) {
//            gotoSet.push(new self.Item(item.production, item.dotPosition+1, item.follows, n));
//        }
//    });
//
//    return gotoSet.isEmpty() ? gotoSet : this.closureOperation(gotoSet);
//};
//
///* Create unique set of item sets
// * */
//lrGeneratorMixin.canonicalCollection = function canonicalCollection () {
//    var item1 = new this.Item(this.productions[0], 0, [this.EOF]);
//    var firstState = this.closureOperation(new this.ItemSet(item1)),
//        states = new Set(firstState),
//        marked = 0,
//        self = this,
//        itemSet;
//
//    states.has = {};
//    states.has[firstState] = 0;
//
//    while (marked !== states.size()) {
//        itemSet = states.item(marked); marked++;
//        itemSet.forEach(function CC_itemSet_forEach (item) {
//            if (item.markedSymbol && item.markedSymbol !== self.EOF)
//                self.canonicalCollectionInsert(item.markedSymbol, itemSet, states, marked-1);
//        });
//    }
//
//    return states;
//};
//
//// Pushes a unique state into the que. Some parsing algorithms may perform additional operations
//lrGeneratorMixin.canonicalCollectionInsert = function canonicalCollectionInsert (symbol, itemSet, states, stateNum) {
//    var g = this.gotoOperation(itemSet, symbol);
//    if (!g.predecessors)
//        g.predecessors = {};
//    // add g to que if not empty or duplicate
//    if (!g.isEmpty()) {
//        var gv = g.valueOf(),
//            i = states.has[gv];
//        if (i === -1 || typeof i === 'undefined') {
//            states.has[gv] = states.size();
//            itemSet.edges[symbol] = states.size(); // store goto transition for table
//            states.push(g);
//            g.predecessors[symbol] = [stateNum];
//        } else {
//            itemSet.edges[symbol] = i; // store goto transition for table
//            states.item(i).predecessors[symbol].push(stateNum);
//        }
//    }
//};

//var NONASSOC = 0;
//lrGeneratorMixin.parseTable = function parseTable (itemSets) {
//    var states = [],
//        nonterminals = this.nonterminals,
//        operators = this.operators,
//        conflictedStates = {}, // array of [state, token] tuples
//        self = this,
//        s = 1, // shift
//        r = 2, // reduce
//        a = 3; // accept
//
//    // for each item set
//    itemSets.forEach(function (itemSet, k) {
//        var state = states[k] = {};
//        var action, stackSymbol;
//
//        // set shift and goto actions
//        for (stackSymbol in itemSet.edges) {
//            itemSet.forEach(function (item, j) {
//                // find shift and goto actions
//                if (item.markedSymbol == stackSymbol) {
//                    var gotoState = itemSet.edges[stackSymbol];
//                    if (nonterminals[stackSymbol]) {
//                        // store state to go to after a reduce
//                        //self.trace(k, stackSymbol, 'g'+gotoState);
//                        state[self.symbols_[stackSymbol]] = gotoState;
//                    } else {
//                        //self.trace(k, stackSymbol, 's'+gotoState);
//                        state[self.symbols_[stackSymbol]] = [s,gotoState];
//                    }
//                }
//            });
//        }
//
//        // set accept action
//        itemSet.forEach(function (item, j) {
//            if (item.markedSymbol == self.EOF) {
//                // accept
//                state[self.symbols_[self.EOF]] = [a];
//                //self.trace(k, self.EOF, state[self.EOF]);
//            }
//        });
//
//        var allterms = self.lookAheads ? false : self.terminals;
//
//        // set reductions and resolve potential conflicts
//        itemSet.reductions.forEach(function (item, j) {
//            // if parser uses lookahead, only enumerate those terminals
//            var terminals = allterms || self.lookAheads(itemSet, item);
//
//            terminals.forEach(function (stackSymbol) {
//                action = state[self.symbols_[stackSymbol]];
//                var op = operators[stackSymbol];
//
//                // Reading a terminal and current position is at the end of a production, try to reduce
//                if (action || action && action.length) {
//                    var sol = resolveConflict(item.production, op, [r,item.production.id], action[0] instanceof Array ? action[0] : action);
//                    self.resolutions.push([k,stackSymbol,sol]);
//                    if (sol.bydefault) {
//                        self.conflicts++;
//                        if (!self.DEBUG) {
//                            self.warn('Conflict in grammar: multiple actions possible when lookahead token is ',stackSymbol,' in state ',k, "\n- ", printAction(sol.r, self), "\n- ", printAction(sol.s, self));
//                            conflictedStates[k] = true;
//                        }
//                        if (self.options.noDefaultResolve) {
//                            if (!(action[0] instanceof Array))
//                                action = [action];
//                            action.push(sol.r);
//                        }
//                    } else {
//                        action = sol.action;
//                    }
//                } else {
//                    action = [r,item.production.id];
//                }
//                if (action && action.length) {
//                    state[self.symbols_[stackSymbol]] = action;
//                } else if (action === NONASSOC) {
//                    state[self.symbols_[stackSymbol]] = undefined;
//                }
//            });
//        });
//
//    });
//
//    if (!self.DEBUG && self.conflicts > 0) {
//        self.warn("\nStates with conflicts:");
//        each(conflictedStates, function (val, state) {
//            self.warn('State '+state);
//            self.warn('  ',itemSets.item(state).join("\n  "));
//        });
//    }
//
//    return states;
//};

// find states with only one action, a reduction
function findDefaults (states) {
    var defaults = {};
    states.forEach(function (state, k) {
        var i = 0;
        for (var act in state) {
             if ({}.hasOwnProperty.call(state, act)) i++;
        }

        if (i === 1 && state[act][0] === 2) {
            // only one action in state and it's a reduction
            defaults[k] = state[act];
        }
    });

    return defaults;
}

// resolves shift-reduce and reduce-reduce conflicts
function resolveConflict (production, op, reduce, shift) {
    var sln = {production: production, operator: op, r: reduce, s: shift},
        s = 1, // shift
        r = 2, // reduce
        a = 3; // accept

    if (shift[0] === r) {
        sln.msg = "Resolve R/R conflict (use first production declared in grammar.)";
        sln.action = shift[1] < reduce[1] ? shift : reduce;
        if (shift[1] !== reduce[1]) sln.bydefault = true;
        return sln;
    }

    if (production.precedence === 0 || !op) {
        sln.msg = "Resolve S/R conflict (shift by default.)";
        sln.bydefault = true;
        sln.action = shift;
    } else if (production.precedence < op.precedence ) {
        sln.msg = "Resolve S/R conflict (shift for higher precedent operator.)";
        sln.action = shift;
    } else if (production.precedence === op.precedence) {
        if (op.assoc === "right" ) {
            sln.msg = "Resolve S/R conflict (shift for right associative operator.)";
            sln.action = shift;
        } else if (op.assoc === "left" ) {
            sln.msg = "Resolve S/R conflict (reduce for left associative operator.)";
            sln.action = reduce;
        } else if (op.assoc === "nonassoc" ) {
            sln.msg = "Resolve S/R conflict (no action for non-associative operator.)";
            sln.action = NONASSOC;
        }
    } else {
        sln.msg = "Resolve conflict (reduce for higher precedent production.)";
        sln.action = reduce;
    }

    return sln;
}

//lrGeneratorMixin.generate = function parser_generate (opt) {
//    opt = typal.mix.call({}, this.options, opt);
//    var code = "";
//
//    // check for illegal identifier
//    if (!opt.moduleName || !opt.moduleName.match(/^[A-Za-z_$][A-Za-z0-9_$]*$/)) {
//        opt.moduleName = "parser";
//    }
//    switch (opt.moduleType) {
//        case "js":
//            code = this.generateModule(opt);
//            break;
//        case "amd":
//            code = this.generateAMDModule(opt);
//            break;
//        default:
//            code = this.generateCommonJSModule(opt);
//            break;
//    }
//
//    return code;
//};
//
//lrGeneratorMixin.generateAMDModule = function generateAMDModule(opt){
//    opt = typal.mix.call({}, this.options, opt);
//    var module = this.generateModule_();
//    var out = '\n\ndefine(function(require){\n'
//        + module.commonCode
//        + '\nvar parser = '+ module.moduleCode
//        + "\n"+this.moduleInclude
//        + (this.lexer && this.lexer.generateModule ?
//          '\n' + this.lexer.generateModule() +
//          '\nparser.lexer = lexer;' : '')
//        + '\nreturn parser;'
//        + '\n});'
//    return out;
//};

//lrGeneratorMixin.generateCommonJSModule = function generateCommonJSModule (opt) {
//    opt = typal.mix.call({}, this.options, opt);
//    var moduleName = opt.moduleName || "parser";
//    var out = this.generateModule(opt)
//        + "\n\n\nif (typeof require !== 'undefined' && typeof exports !== 'undefined') {"
//        + "\nexports.parser = "+moduleName+";"
//        + "\nexports.Parser = "+moduleName+".Parser;"
//        + "\nexports.parse = function () { return "+moduleName+".parse.apply("+moduleName+", arguments); };"
//        + "\nexports.main = "+ String(opt.moduleMain || commonjsMain) + ";"
//        + "\nif (typeof module !== 'undefined' && require.main === module) {\n"
//        + "  exports.main(process.argv.slice(1));\n}"
//        + "\n}";
//
//    return out;
//};
//
//lrGeneratorMixin.generateModule = function generateModule (opt) {
//    opt = typal.mix.call({}, this.options, opt);
//    var moduleName = opt.moduleName || "parser";
//    var out = "/* parser generated by jison " + version + " */\n"
//        + "/*\n"
//        + "  Returns a Parser object of the following structure:\n"
//        + "\n"
//        + "  Parser: {\n"
//        + "    yy: {}\n"
//        + "  }\n"
//        + "\n"
//        + "  Parser.prototype: {\n"
//        + "    yy: {},\n"
//        + "    trace: function(),\n"
//        + "    symbols_: {associative list: name ==> number},\n"
//        + "    terminals_: {associative list: number ==> name},\n"
//        + "    productions_: [...],\n"
//        + "    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),\n"
//        + "    table: [...],\n"
//        + "    defaultActions: {...},\n"
//        + "    parseError: function(str, hash),\n"
//        + "    parse: function(input),\n"
//        + "\n"
//        + "    lexer: {\n"
//        + "        EOF: 1,\n"
//        + "        parseError: function(str, hash),\n"
//        + "        setInput: function(input),\n"
//        + "        input: function(),\n"
//        + "        unput: function(str),\n"
//        + "        more: function(),\n"
//        + "        less: function(n),\n"
//        + "        pastInput: function(),\n"
//        + "        upcomingInput: function(),\n"
//        + "        showPosition: function(),\n"
//        + "        test_match: function(regex_match_array, rule_index),\n"
//        + "        next: function(),\n"
//        + "        lex: function(),\n"
//        + "        begin: function(condition),\n"
//        + "        popState: function(),\n"
//        + "        _currentRules: function(),\n"
//        + "        topState: function(),\n"
//        + "        pushState: function(condition),\n"
//        + "\n"
//        + "        options: {\n"
//        + "            ranges: boolean           (optional: true ==> token location info will include a .range[] member)\n"
//        + "            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)\n"
//        + "            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)\n"
//        + "        },\n"
//        + "\n"
//        + "        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),\n"
//        + "        rules: [...],\n"
//        + "        conditions: {associative list: name ==> set},\n"
//        + "    }\n"
//        + "  }\n"
//        + "\n"
//        + "\n"
//        + "  token location info (@$, _$, etc.): {\n"
//        + "    first_line: n,\n"
//        + "    last_line: n,\n"
//        + "    first_column: n,\n"
//        + "    last_column: n,\n"
//        + "    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)\n"
//        + "  }\n"
//        + "\n"
//        + "\n"
//        + "  the parseError function receives a 'hash' object with these members for lexer and parser errors: {\n"
//        + "    text:        (matched text)\n"
//        + "    token:       (the produced terminal token, if any)\n"
//        + "    line:        (yylineno)\n"
//        + "  }\n"
//        + "  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {\n"
//        + "    loc:         (yylloc)\n"
//        + "    expected:    (string describing the set of expected tokens)\n"
//        + "    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)\n"
//        + "  }\n"
//        + "*/\n";
//    out += (moduleName.match(/\./) ? moduleName : "var "+moduleName) +
//            " = " + this.generateModuleExpr();
//
//    return out;
//};

//done
lrGeneratorMixin.generateModuleExpr = function generateModuleExpr () {
    var out = '';
    var module = this.generateModule_();

    out += "(function(){\n";
    out += module.commonCode;
    out += "\nvar parser = "+module.moduleCode;
    out += "\n"+this.moduleInclude;
    if (this.lexer && this.lexer.generateModule) {
        out += this.lexer.generateModule();
        out += "\nparser.lexer = lexer;";
    }
    out += "\nfunction Parser () {\n  this.yy = {};\n}\n"
        + "Parser.prototype = parser;"
        + "parser.Parser = Parser;"
        + "\nreturn new Parser;\n})();";

    return out;
};

function addTokenStack (fn) {
    var parseFn = fn;
    try {
        var ast = esprima.parse(parseFn);
        var stackAst = esprima.parse(String(tokenStackLex)).body[0];
        stackAst.id.name = 'lex';

        var labeled = JSONSelect.match(':has(:root > .label > .name:val("_token_stack"))', ast);

        labeled[0].body = stackAst;

        return escodegen.generate(ast).replace(/_token_stack:\s?/,"").replace(/\\\\n/g,"\\n");
    } catch (e) {
        return parseFn;
    }
}

// lex function that supports token stacks
function tokenStackLex() {
    var token;
    token = tstack.pop() || lexer.lex() || EOF;
    // if token isn't its numeric value, convert
    if (typeof token !== 'number') {
        if (token instanceof Array) {
            tstack = token;
            token = tstack.pop();
        }
        token = self.symbols_[token] || token;
    }
    return token;
}

// returns parse function without error recovery code
function removeErrorRecovery (fn) {
    var parseFn = fn;
    try {
        var ast = esprima.parse(parseFn);

        var labeled = JSONSelect.match(':has(:root > .label > .name:val("_handle_error"))', ast);
        var reduced_code = labeled[0].body.consequent.body[3].consequent.body;
        reduced_code[0] = labeled[0].body.consequent.body[1];     // remove the line: error_rule_depth = locateNearestErrorRecoveryRule(state);
        reduced_code[4].expression.arguments[1].properties.pop(); // remove the line: 'recoverable: error_rule_depth !== false'
        labeled[0].body.consequent.body = reduced_code;

        return escodegen.generate(ast).replace(/_handle_error:\s?/,"").replace(/\\\\n/g,"\\n");
    } catch (e) {
        return parseFn;
    }
}

// Generates the code of the parser module, which consists of two parts:
// - module.commonCode: initialization code that should be placed before the module
// - module.moduleCode: code that creates the module object
lrGeneratorMixin.generateModule_ = function generateModule_ () {
    var parseFn = String(parser.parse);
    if (!this.hasErrorRecovery) {
      parseFn = removeErrorRecovery(parseFn);
    }

    if (this.options['token-stack']) {
      parseFn = addTokenStack(parseFn);
    }

    // Generate code with fresh variable names
    nextVariableId = 0;
    var tableCode = this.generateTableCode(this.table);

    // Generate the initialization code
    var commonCode = tableCode.commonCode;

    // Generate the module creation code
    var moduleCode = "{";
    moduleCode += [
        "trace: " + String(this.trace || parser.trace),
        "yy: {}",
        "symbols_: " + JSON.stringify(this.symbols_),
        "terminals_: " + JSON.stringify(this.terminals_).replace(/"([0-9]+)":/g,"$1:"),
        "productions_: " + JSON.stringify(this.productions_),
        "performAction: " + String(this.performAction),
        "table: " + tableCode.moduleCode,
        "defaultActions: " + JSON.stringify(this.defaultActions).replace(/"([0-9]+)":/g,"$1:"),
        "parseError: " + String(this.parseError || (this.hasErrorRecovery ? traceParseError : parser.parseError)),
        "parse: " + parseFn
        ].join(",\n");
    moduleCode += "};";

    return { commonCode: commonCode, moduleCode: moduleCode }
};

// Generate code that represents the specified parser table
lrGeneratorMixin.generateTableCode = function (table) {
    var moduleCode = JSON.stringify(table);
    var variables = [createObjectCode];

    // Don't surround numerical property name numbers in quotes
    moduleCode = moduleCode.replace(/"([0-9]+)"(?=:)/g, "$1");

    // Replace objects with several identical values by function calls
    // e.g., { 1: [6, 7]; 3: [6, 7], 4: [6, 7], 5: 8 } = o([1, 3, 4], [6, 7], { 5: 8 })
    moduleCode = moduleCode.replace(/\{\d+:[^\}]+,\d+:[^\}]+\}/g, function (object) {
        // Find the value that occurs with the highest number of keys
        var value, frequentValue, key, keys = {}, keyCount, maxKeyCount = 0,
            keyValue, keyValues = [], keyValueMatcher = /(\d+):([^:]+)(?=,\d+:|\})/g;

        while ((keyValue = keyValueMatcher.exec(object))) {
            // For each value, store the keys where that value occurs
            key = keyValue[1];
            value = keyValue[2];
            keyCount = 1;

            if (!(value in keys)) {
                keys[value] = [key];
            } else {
                keyCount = keys[value].push(key);
            }
            // Remember this value if it is the most frequent one
            if (keyCount > maxKeyCount) {
                maxKeyCount = keyCount;
                frequentValue = value;
            }
        }
        // Construct the object with a function call if the most frequent value occurs multiple times
        if (maxKeyCount > 1) {
            // Collect all non-frequent values into a remainder object
            for (value in keys) {
                if (value !== frequentValue) {
                    for (var k = keys[value], i = 0, l = k.length; i < l; i++) {
                        keyValues.push(k[i] + ':' + value);
                    }
                }
            }
            keyValues = keyValues.length ? ',{' + keyValues.join(',') + '}' : '';
            // Create the function call `o(keys, value, remainder)`
            object = 'o([' + keys[frequentValue].join(',') + '],' + frequentValue + keyValues + ')';
        }
        return object;
    });

    // Count occurrences of number lists
    var list;
    var lists = {};
    var listMatcher = /\[[0-9,]+\]/g;

    while (list = listMatcher.exec(moduleCode)) {
        lists[list] = (lists[list] || 0) + 1;
    }

    // Replace frequently occurring number lists with variables
    moduleCode = moduleCode.replace(listMatcher, function (list) {
        var listId = lists[list];
        // If listId is a number, it represents the list's occurrence frequency
        if (typeof listId === 'number') {
            // If the list does not occur frequently, represent it by the list
            if (listId === 1) {
                lists[list] = listId = list;
            // If the list occurs frequently, represent it by a newly assigned variable
            } else {
                lists[list] = listId = createVariable();
                variables.push(listId + '=' + list);
            }
        }
        return listId;
    });

    // Return the variable initialization code and the table code
    return {
        commonCode: 'var ' + variables.join(',') + ';',
        moduleCode: moduleCode
    };
};
// Function that extends an object with the given value for all given keys
// e.g., o([1, 3, 4], [6, 7], { x: 1, y: 2 }) = { 1: [6, 7]; 3: [6, 7], 4: [6, 7], x: 1, y: 2 }
var createObjectCode = 'o=function(k,v,o,l){' +
    'for(o=o||{},l=k.length;l--;o[k[l]]=v);' +
    'return o}';

// Creates a variable with a unique name
function createVariable() {
    var id = nextVariableId++;
    var name = '$V';

    do {
        name += variableTokens[id % variableTokensLength];
        id = ~~(id / variableTokensLength);
    } while (id !== 0);

    return name;
}

var nextVariableId = 0;
var variableTokens = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var variableTokensLength = variableTokens.length;

// default main method for generated commonjs modules
function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
}

// debug mixin for LR parser generators

function printAction (a, gen) {
    var s = a[0] == 1 ? 'shift token (then go to state '+a[1]+')' :
        a[0] == 2 ? 'reduce by rule: '+gen.productions[a[1]] :
                    'accept' ;

    return s;
}

var lrGeneratorDebug = {
    beforeparseTable: function () {
        this.trace("Building parse table.");
    },
    afterparseTable: function () {
        var self = this;
        if (this.conflicts > 0) {
            this.resolutions.forEach(function (r, i) {
                if (r[2].bydefault) {
                    self.warn('Conflict at state: ',r[0], ', token: ',r[1], "\n  ", printAction(r[2].r, self), "\n  ", printAction(r[2].s, self));
                }
            });
            this.trace("\n"+this.conflicts+" Conflict(s) found in grammar.");
        }
        this.trace("Done.");
    },
    aftercanonicalCollection: function (states) {
        var trace = this.trace;
        trace("\nItem sets\n------");

        states.forEach(function (state, i) {
            trace("\nitem set",i,"\n"+state.join("\n"), '\ntransitions -> ', JSON.stringify(state.edges));
        });
    }
};

/*
 * Simple LR(0)
 * */
var lr0 = generator.beget(lookaheadMixin, lrGeneratorMixin, {
    type: "LR(0)",
    afterconstructor: function lr0_afterconstructor () {
        this.buildTable();
    }
});

var LR0Generator = exports.LR0Generator = lr0.construct();

/*
 * Simple LALR(1)
 * */

var lalr = generator.beget(lookaheadMixin, lrGeneratorMixin, {
    type: "LALR(1)",

    afterconstructor: function (grammar, options) {
        if (this.DEBUG) this.mix(lrGeneratorDebug, lalrGeneratorDebug); // mixin debug methods

        options = options || {};
        this.states = this.canonicalCollection();
        this.terms_ = {};

        var newg = this.newg = typal.beget(lookaheadMixin,{
            oldg: this,
            trace: this.trace,
            nterms_: {},
            DEBUG: false,
            go_: function (r, B) {
                r = r.split(":")[0]; // grab state #
                B = B.map(function (b) { return b.slice(b.indexOf(":")+1); });
                return this.oldg.go(r, B);
            }
        });
        newg.nonterminals = {};
        newg.productions = [];

        this.inadequateStates = [];

        // if true, only lookaheads in inadequate states are computed (faster, larger table)
        // if false, lookaheads for all reductions will be computed (slower, smaller table)
        this.onDemandLookahead = options.onDemandLookahead || false;

        this.buildNewGrammar();
        newg.computeLookaheads();
        this.unionLookaheads();

        this.table = this.parseTable(this.states);
        this.defaultActions = findDefaults(this.table);
    },

    lookAheads: function LALR_lookaheads (state, item) {
        return (!!this.onDemandLookahead && !state.inadequate) ? this.terminals : item.follows;
    },
    go: function LALR_go (p, w) {
        var q = parseInt(p, 10);
        for (var i=0;i<w.length;i++) {
            q = this.states.item(q).edges[w[i]] || q;
        }
        return q;
    },
    goPath: function LALR_goPath (p, w) {
        var q = parseInt(p, 10),t,
            path = [];
        for (var i=0;i<w.length;i++) {
            t = w[i] ? q+":"+w[i] : '';
            if (t) this.newg.nterms_[t] = q;
            path.push(t);
            q = this.states.item(q).edges[w[i]] || q;
            this.terms_[t] = w[i];
        }
        return {path: path, endState: q};
    },
    // every disjoint reduction of a nonterminal becomes a produciton in G'
    buildNewGrammar: function LALR_buildNewGrammar () {
        var self = this,
            newg = this.newg;

        this.states.forEach(function (state, i) {
            state.forEach(function (item) {
                if (item.dotPosition === 0) {
                    // new symbols are a combination of state and transition symbol
                    var symbol = i+":"+item.production.symbol;
                    self.terms_[symbol] = item.production.symbol;
                    newg.nterms_[symbol] = i;
                    if (!newg.nonterminals[symbol])
                        newg.nonterminals[symbol] = new Nonterminal(symbol);
                    var pathInfo = self.goPath(i, item.production.handle);
                    var p = new Production(symbol, pathInfo.path, newg.productions.length);
                    newg.productions.push(p);
                    newg.nonterminals[symbol].productions.push(p);

                    // store the transition that get's 'backed up to' after reduction on path
                    var handle = item.production.handle.join(' ');
                    var goes = self.states.item(pathInfo.endState).goes;
                    if (!goes[handle])
                        goes[handle] = [];
                    goes[handle].push(symbol);

                    //self.trace('new production:',p);
                }
            });
            if (state.inadequate)
                self.inadequateStates.push(i);
        });
    },
    unionLookaheads: function LALR_unionLookaheads () {
        var self = this,
            newg = this.newg,
            states = !!this.onDemandLookahead ? this.inadequateStates : this.states;

        states.forEach(function union_states_forEach (i) {
            var state = typeof i === 'number' ? self.states.item(i) : i,
                follows = [];
            if (state.reductions.length)
            state.reductions.forEach(function union_reduction_forEach (item) {
                var follows = {};
                for (var k=0;k<item.follows.length;k++) {
                    follows[item.follows[k]] = true;
                }
                state.goes[item.production.handle.join(' ')].forEach(function reduction_goes_forEach (symbol) {
                    newg.nonterminals[symbol].follows.forEach(function goes_follows_forEach (symbol) {
                        var terminal = self.terms_[symbol];
                        if (!follows[terminal]) {
                            follows[terminal]=true;
                            item.follows.push(terminal);
                        }
                    });
                });
                //self.trace('unioned item', item);
            });
        });
    }
});

var LALRGenerator = exports.LALRGenerator = lalr.construct();

// LALR generator debug mixin

var lalrGeneratorDebug = {
    trace: function trace () {
        Jison.print.apply(null, arguments);
    },
    beforebuildNewGrammar: function () {
        this.trace(this.states.size()+" states.");
        this.trace("Building lookahead grammar.");
    },
    beforeunionLookaheads: function () {
        this.trace("Computing lookaheads.");
    }
};

/*
 * Lookahead parser definitions
 *
 * Define base type
 * */
var lrLookaheadGenerator = generator.beget(lookaheadMixin, lrGeneratorMixin, {
   afterconstructor: function lr_aftercontructor () {
       this.computeLookaheads();
       this.buildTable();
   }
});

/*
 * SLR Parser
 * */
var SLRGenerator = exports.SLRGenerator = lrLookaheadGenerator.construct({
    type: "SLR(1)",

    lookAheads: function SLR_lookAhead (state, item) {
        return this.nonterminals[item.production.symbol].follows;
    }
});


/*
 * LR(1) Parser
 * */
var lr1 = lrLookaheadGenerator.beget({
    type: "Canonical LR(1)",

    lookAheads: function LR_lookAheads (state, item) {
        return item.follows;
    },
    Item: lrGeneratorMixin.Item.prototype.construct({
        afterconstructor: function () {
            this.id = this.production.id+'a'+this.dotPosition+'a'+this.follows.sort().join(',');
        },
        eq: function (e) {
            return e.id === this.id;
        }
    }),

    closureOperation: function LR_ClosureOperation (itemSet /*, closureSet*/) {
        var closureSet = new this.ItemSet();
        var self = this;

        var set = itemSet,
            itemQueue, syms = {};

        do {
        itemQueue = new Set();
        closureSet.concat(set);
        set.forEach(function (item) {
            var symbol = item.markedSymbol;
            var b, r;

            // if token is a nonterminal, recursively add closures
            if (symbol && self.nonterminals[symbol]) {
                r = item.remainingHandle();
                b = self.first(item.remainingHandle());
                if (b.length === 0 || item.production.nullable || self.nullable(r)) {
                    b = b.concat(item.follows);
                }
                self.nonterminals[symbol].productions.forEach(function (production) {
                    var newItem = new self.Item(production, 0, b);
                    if(!closureSet.contains(newItem) && !itemQueue.contains(newItem)) {
                        itemQueue.push(newItem);
                    }
                });
            } else if (!symbol) {
                // reduction
                closureSet.reductions.push(item);
            }
        });

        set = itemQueue;
        } while (!itemQueue.isEmpty());

        return closureSet;
    }
});

var LR1Generator = exports.LR1Generator = lr1.construct();

/*
 * LL Parser
 * */
var ll = generator.beget(lookaheadMixin, {
    type: "LL(1)",

    afterconstructor: function ll_aftercontructor () {
        this.computeLookaheads();
        this.table = this.parseTable(this.productions);
    },
    parseTable: function llParseTable (productions) {
        var table = {},
            self = this;
        productions.forEach(function (production, i) {
            var row = table[production.symbol] || {};
            var tokens = production.first;
            if (self.nullable(production.handle)) {
                Set.union(tokens, self.nonterminals[production.symbol].follows);
            }
            tokens.forEach(function (token) {
                if (row[token]) {
                    row[token].push(i);
                    self.conflicts++;
                } else {
                    row[token] = [i];
                }
            });
            table[production.symbol] = row;
        });

        return table;
    }
});

var LLGenerator = exports.LLGenerator = ll.construct();

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
