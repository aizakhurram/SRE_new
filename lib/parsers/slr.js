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

/*
 * SLR Parser
 * */
const slr = lrLookaheadGenerator.construct({
    type: "SLR(1)",

    lookAheads: function SLR_lookAhead (state, item) {
        return this.nonterminals[item.production.symbol].follows;
    }
});

module.exports = slr;