var typal      = require('../util/typal').typal;
var Set        = require('../util/set').Set;
var version = require('../../package.json').version;
var item= require("../lrgeneratormixin/item");
var itemSet = require("../lrgeneratormixin/itemSet")
const {commonjsMain,each,findDefaults,resolveConflict}=require("../util/lr");
const {printAction, getPrintFunction }=require("../util/PrintUtility");
var Jison = exports.Jison = exports;
Jison.version = version;
const NONASSOC = 0;


function buildTable() {
    if (this.DEBUG) this.mix(this.lrGeneratorDebug);

    this.states = canonicalCollection.call(this);
    this.table = parseTable.call(this, this.states);
    this.defaultActions = findDefaults(this.table);
}

 
 
function canonicalCollection() {
    const item1 = new this.Item(this.productions[0], 0, [this.EOF]);
    let firstState = this.closureOperation(new this.ItemSet(item1)),
        states = new Set(firstState),
        marked = 0,
        itemSet;

    states.has = {};
    states.has[firstState] = 0;

    while (marked !== states.size()) {
        itemSet = states.item(marked); marked++;
        itemSet.forEach(item => {
            if (item.markedSymbol && item.markedSymbol !== this.EOF)
                this.canonicalCollectionInsert(item.markedSymbol, itemSet, states, marked - 1);
        });
    }

    return states;
};

function parseTable(itemSets) {
    const states = [];
    const nonterminals = this.nonterminals;
    const operators = this.operators;
    const conflictedStates = {}; // array of [state, token] tuples

    itemSets.forEach((itemSet, k) => {
        const state = states[k] = {};
        let action;

        // set shift and goto actions
        for (const stackSymbol in itemSet.edges) {
            itemSet.forEach(item => {
                if (item.markedSymbol == stackSymbol) {
                    const gotoState = itemSet.edges[stackSymbol];
                    if (nonterminals[stackSymbol]) {
                        state[this.symbols_[stackSymbol]] = gotoState;
                    } else {
                        state[this.symbols_[stackSymbol]] = [1, gotoState];
                    }
                }
            });
        }

        // set accept action
        itemSet.forEach(item => {
            if (item.markedSymbol == this.EOF) {
                state[this.symbols_[this.EOF]] = [3];
            }
        });

        const allterms = this.lookAheads ? false : this.terminals;

        // set reductions and resolve potential conflicts
        itemSet.reductions.forEach(item => {
            const terminals = allterms || this.lookAheads(itemSet, item);

            terminals.forEach(stackSymbol => {
                action = state[this.symbols_[stackSymbol]];
                const op = operators[stackSymbol];

                if (action || action && action.length) {
                    const sol = resolveConflict(item.production, op, [2, item.production.id], action[0] instanceof Array ? action[0] : action);
                    this.resolutions.push([k, stackSymbol, sol]);
                    if (sol.bydefault) {
                        this.conflicts++;
                        if (!this.DEBUG) {
                            this.warn('Conflict in grammar: multiple actions possible when lookahead token is ', stackSymbol, ' in state ', k, "\n- ", printAction(sol.r, this), "\n- ", printAction(sol.s, this));
                            conflictedStates[k] = true;
                        }
                    } else {
                        action = sol.action;
                    }
                } else {
                    action = [2, item.production.id];
                }

                if (action && action.length) {
                    state[this.symbols_[stackSymbol]] = action;
                } else if (action === 0) {
                    state[this.symbols_[stackSymbol]] = undefined;
                }
            });
        });
    });

    if (!this.DEBUG && this.conflicts > 0) {
        this.warn("\nStates with conflicts:");
        each(conflictedStates, (val, state) => {
            this.warn('State ' + state);
            this.warn('  ', itemSets.item(state).join("\n  "));
        });
    }

    return states;
};

module.exports = buildTable;
