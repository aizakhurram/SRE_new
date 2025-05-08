var generator = require('../generator');
var lookaheadMixin = require ('../mixins/lookaheadmixin');
var lrGeneratorMixin = require('../mixins/lrgeneratormixin')


var lr0 = generator.beget(lookaheadMixin, lrGeneratorMixin, {
    type: "LR(0)",
    afterconstructor: function lr0_afterconstructor () {
        this.buildTable();
    }
});

module.exports = lr0.construct();
//var LR0Generator = exports.LR0Generator = lr0.construct();
