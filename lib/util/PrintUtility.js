function getPrintFunction() {
    if (typeof console !== 'undefined' && console.log) {
        return console.log;
    } else if (typeof puts !== 'undefined') {
        return function print() {
            puts([].join.call(arguments, ' '));
        };
    } else if (typeof print !== 'undefined') {
        return print;
    } else {
        return function print() {};
    }
}
function printAction (a, gen) {
    var s = a[0] == 1 ? 'shift token (then go to state '+a[1]+')' :
        a[0] == 2 ? 'reduce by rule: '+gen.productions[a[1]] :
                    'accept' ;

    return s;
}

module.exports = {
    printAction,
    getPrintFunction,

};