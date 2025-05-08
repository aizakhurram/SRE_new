const typal = require('./typal').typal;
const Set = require('./set').Set;


const Nonterminal = typal.construct({
    constructor: function Nonterminal (symbol) {
        this.symbol = symbol;
        this.productions = new Set();
        this.first = [];
        this.follows = [];
        this.nullable = false;
    },
    toString: function Nonterminal_toString () {
        let str = this.symbol + "\n";
        str += (this.nullable ? 'nullable' : 'not nullable');
        str += "\nFirsts: " + Array.from(this.first).join(', '); // Convert Set to Array for join
        str += "\nFollows: " + Array.from(this.follows).join(', '); // Convert Set to Array for join
        str += "\nProductions:\n  " + Array.from(this.productions).join('\n  '); // Convert Set to Array for join

        return str;
    }
});

module.exports = Nonterminal;