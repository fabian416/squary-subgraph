"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkNodeBalanceMetadata = void 0;
const networkNodeBalanceMinipoolMetadata_1 = require("./networkNodeBalanceMinipoolMetadata");
const networkNodeBalanceRPLMetadata_1 = require("./networkNodeBalanceRPLMetadata");
class NetworkNodeBalanceMetadata {
    constructor() {
        this.minipoolMetadata = new networkNodeBalanceMinipoolMetadata_1.NetworkNodeBalanceMinipoolMetadata();
        this.rplMetadata = new networkNodeBalanceRPLMetadata_1.NetworkNodeBalanceRPLMetadata();
    }
}
exports.NetworkNodeBalanceMetadata = NetworkNodeBalanceMetadata;
