"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayUniqueBy = exports.arrayUnique = exports.arrayDiff = void 0;
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
    const references = array.map((item) => pluck(item));
    let unique = new Array();
    for (let i = 0; i < references.length; i++) {
        if (references.indexOf(references[i]) == i) {
            unique = unique.concat([array[i]]);
        }
    }
    return unique;
}
exports.arrayUniqueBy = arrayUniqueBy;
