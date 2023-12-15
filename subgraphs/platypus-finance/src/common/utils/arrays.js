"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayUniqueBy = exports.arrayUnique = exports.arrayDiff = exports.addToArrayAtIndex = exports.removeFromArrayAtIndex = void 0;
function removeFromArrayAtIndex(x, index) {
    const retval = new Array(x.length - 1);
    let nI = 0;
    for (let i = 0; i < x.length; i++) {
        if (i != index) {
            retval[nI] = x[i];
            nI += 1;
        }
    }
    return retval;
}
exports.removeFromArrayAtIndex = removeFromArrayAtIndex;
function addToArrayAtIndex(x, item, index) {
    if (x.length == 0) {
        return [item];
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
function arrayDiff(a, b) {
    let diff = new Array();
    for (let i = 0; i < a.length; i++) {
        if (b.indexOf(a[i]) == -1) {
            diff = diff.concat([a[i]]);
        }
    }
    return diff;
}
exports.arrayDiff = arrayDiff;
function arrayUnique(array) {
    let unique = new Array();
    for (let i = 0; i < array.length; i++) {
        if (array.indexOf(array[i]) == i) {
            unique = unique.concat([array[i]]);
        }
    }
    return unique;
}
exports.arrayUnique = arrayUnique;
function arrayUniqueBy(array, pluck) {
    const references = array.map(item => pluck(item));
    let unique = new Array();
    for (let i = 0; i < references.length; i++) {
        if (references.indexOf(references[i]) == i) {
            unique = unique.concat([array[i]]);
        }
    }
    return unique;
}
exports.arrayUniqueBy = arrayUniqueBy;
