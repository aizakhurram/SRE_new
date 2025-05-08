var generator = require('../generator');
var lookaheadMixin = require ('../mixins/lookaheadmixin');
var lrGeneratorMixin = require('../mixins/lrgeneratormixin')
var typal      = require('../util/typal').typal;
var Set        = require('../util/set').Set;

var lrLookaheadGenerator = generator.beget(lookaheadMixin, lrGeneratorMixin, {
   afterconstructor: function lr_aftercontructor () {
       this.computeLookaheads();
       this.buildTable();
   }
});
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

module.exports = lr1.construct();
