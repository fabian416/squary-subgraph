"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventID = void 0;
function createEventID(event) {
    return event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
}
exports.createEventID = createEventID;
