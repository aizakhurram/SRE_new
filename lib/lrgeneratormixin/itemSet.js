// item-set.js

const Item = require('./item');

function ItemSet(items = []) {
    this.items = Array.isArray(items) ? items : [items];
    this.reductions = [];
    this.shifts = false;
    this.inadequate = false;
}

ItemSet.prototype.push = function (item) {
    this.items.push(item);
};

ItemSet.prototype.forEach = function (cb) {
    this.items.forEach(cb);
};

ItemSet.prototype.concat = function (set) {
    this.items = this.items.concat(set.items);
};

ItemSet.prototype.contains = function (item) {
    return this.items.some(i => i.production === item.production && i.dotPosition === item.dotPosition);
};

ItemSet.prototype.isEmpty = function () {
    return this.items.length === 0;
};

module.exports = ItemSet;
