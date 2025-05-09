function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: ' + args[0] + ' FILE');
        process.exit(1);
    }
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.normalize(args[1]), "utf8");
    return require('./main-parser').parser.parse(source); // adjust path as needed
}



function each(obj, func) {
    if (obj.forEach) {
        obj.forEach(func);
    } else {
        for (let p in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, p)) {
                func.call(obj, obj[p], p, obj);
            }
        }
    }
}

function findDefaults(states) {
    const defaults = {};
    states.forEach((state, k) => {
        let i = 0;
        for (var act in state) {
            if (Object.prototype.hasOwnProperty.call(state, act)) i++;
        }
        if (i === 1 && state[act][0] === 2) {
            defaults[k] = state[act];
        }
    });
    return defaults;
}

const NONASSOC = 0;

function resolveConflict(production, op, reduce, shift) {
    const sln = { production, operator: op, r: reduce, s: shift };
    const s = 1, r = 2, a = 3;

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
    } else if (production.precedence < op.precedence) {
        sln.msg = "Resolve S/R conflict (shift for higher precedent operator.)";
        sln.action = shift;
    } else if (production.precedence === op.precedence) {
        if (op.assoc === "right") {
            sln.msg = "Resolve S/R conflict (shift for right associative operator.)";
            sln.action = shift;
        } else if (op.assoc === "left") {
            sln.msg = "Resolve S/R conflict (reduce for left associative operator.)";
            sln.action = reduce;
        } else if (op.assoc === "nonassoc") {
            sln.msg = "Resolve S/R conflict (no action for non-associative operator.)";
            sln.action = NONASSOC;
        }
    } else {
        sln.msg = "Resolve conflict (reduce for higher precedent production.)";
        sln.action = reduce;
    }

    return sln;
}


module.exports = {
    commonjsMain,
    each,
    findDefaults,
    resolveConflict,
};
