// item.js

function Item(production, dotPosition = 0, follows = [], id) {
    this.production = production;
    this.dotPosition = dotPosition;
    this.follows = follows;
    this.id = id !== undefined ? id : Item._nextId++;
}

Item._nextId = 0;

Item.prototype.markedSymbol = function () {
    return this.production.symbols[this.dotPosition];
};

Item.prototype.toString = function () {
    const sym = [...this.production.symbols];
    sym.splice(this.dotPosition, 0, '●');
    return `${this.production.symbol} → ${sym.join(' ')}`;
};

module.exports = Item;
