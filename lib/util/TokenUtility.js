const esprima = require('esprima');
const escodegen = require('escodegen');
const JSONSelect = require('JSONSelect');
var nextVariableId = 0;
var variableTokens = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var variableTokensLength = variableTokens.length;

function tokenStackLex() {
    var token;
    token = tstack.pop() || lexer.lex() || EOF;
    if (typeof token !== 'number') {
        if (token instanceof Array) {
            tstack = token;
            token = tstack.pop();
        }
        token = self.symbols_[token] || token;
    }
    return token;
}
function addTokenStack(fn) {
    var parseFn = fn;
    try {
        var ast = esprima.parse(parseFn);
        var stackAst = esprima.parse(String(tokenStackLex)).body[0];
        stackAst.id.name = 'lex';

        var labeled = JSONSelect.match(':has(:root > .label > .name:val("_token_stack"))', ast);
        labeled[0].body = stackAst;

        return escodegen.generate(ast).replace(/_token_stack:\s?/, "").replace(/\\\\n/g, "\\n");
    } catch (e) {
        return parseFn;
    }
}
function removeErrorRecovery(fn) {
    var parseFn = fn;
    try {
        var ast = esprima.parse(parseFn);

        var labeled = JSONSelect.match(':has(:root > .label > .name:val("_handle_error"))', ast);
        var reduced_code = labeled[0].body.consequent.body[3].consequent.body;
        reduced_code[0] = labeled[0].body.consequent.body[1];
        reduced_code[4].expression.arguments[1].properties.pop();
        labeled[0].body.consequent.body = reduced_code;

        return escodegen.generate(ast).replace(/_handle_error:\s?/, "").replace(/\\\\n/g, "\\n");
    } catch (e) {
        return parseFn;
    }
}
function createVariable() {
    var id = nextVariableId++;
    var name = '$V';

    do {
        name += variableTokens[id % variableTokensLength];
        id = ~~(id / variableTokensLength);
    } while (id !== 0);

    return name;
}

module.exports = {
    addTokenStack,
    removeErrorRecovery,
    tokenStackLex,
    createVariable
};
