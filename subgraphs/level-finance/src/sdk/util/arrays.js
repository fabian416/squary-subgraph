"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtractArrays = exports.addArrays = exports.addToArrayAtIndex = exports.updateArrayAtIndex = exports.sortBytesArray = exports.sortArrayByReference = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// A function which given 3 arrays of arbitrary types of the same length,
// where the first one holds the reference order, the second one holds the same elements
// as the first but in different order, and the third any arbitrary elements. It will return
// the third array after sorting it according to the order of the first one.
// For example:
// sortArrayByReference(['a', 'c', 'b'], ['a', 'b', 'c'], [1, 2, 3]) => [1, 3, 2]
function sortArrayByReference(reference, array, toSort) {
    const sorted = new Array();
    for (let i = 0; i < reference.length; i++) {
        const index = array.indexOf(reference[i]);
        sorted.push(toSort[index]);
    }
    return sorted;
}
exports.sortArrayByReference = sortArrayByReference;
// sortBytesArray will sort an array of Bytes in ascending order
// by comparing their hex string representation.
function sortBytesArray(array) {
    const toSort = array.map((item) => item.toHexString());
    toSort.sort();
    return toSort.map((item) => graph_ts_1.Bytes.fromHexString(item));
}
exports.sortBytesArray = sortBytesArray;
function updateArrayAtIndex(x, item, index) {
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
    i += 1;
    while (i < x.length) {
        retval.push(x[i]);
        i += 1;
    }
    return retval;
}
exports.updateArrayAtIndex = updateArrayAtIndex;
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
function addArrays(a, b) {
    const retval = new Array();
    if (a.length == b.length) {
        let i = 0;
        while (i < a.length) {
            retval.push(a[i].plus(b[i]));
            i += 1;
        }
    }
    return retval;
}
exports.addArrays = addArrays;
function subtractArrays(a, b) {
    const retval = new Array();
    if (a.length == b.length) {
        let i = 0;
        while (i < a.length) {
            retval.push(a[i].minus(b[i]));
            i += 1;
        }
    }
    return retval;
}
exports.subtractArrays = subtractArrays;
