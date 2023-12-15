"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakerBalance = void 0;
const constants_1 = require("../utils/constants");
class StakerBalance {
    constructor() {
        this.currentRETHBalance = constants_1.BIGINT_ZERO;
        this.currentETHBalance = constants_1.BIGINT_ZERO;
        this.previousRETHBalance = constants_1.BIGINT_ZERO;
        this.previousETHBalance = constants_1.BIGINT_ZERO;
    }
}
exports.StakerBalance = StakerBalance;
