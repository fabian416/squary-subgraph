"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToArrayAtIndex = void 0;
function addToArrayAtIndex(x, item, index = -1) {
    if (x.length == 0) {
        return [item];
    }
    if (index == -1 || index > x.length) {
        index = x.length;
    }
    const retval = new Array();
    let i = 0;
    while (i < index) {
        retval.push(x[i]);
        i += 1;
    }
    retval.push(item);
    while (i < x.length) {
        retval.push(x[i]);
        i += 1;
    }
    return retval;
}
exports.addToArrayAtIndex = addToArrayAtIndex;
