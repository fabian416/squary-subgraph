"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWinningTicketRedeemed = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants = __importStar(require("../common/constants"));
const initializers_1 = require("../common/initializers");
function handleWinningTicketRedeemed(event) {
    const transcoderAddress = event.params.recipient;
    const ethAmount = event.params.faceValue;
    const sdk = (0, initializers_1.initializeSDK)(event);
    const WETH = sdk.Tokens.getOrCreateToken(constants.WETH_ADDRESS);
    (0, initializers_1.createOrUpdatePool)(transcoderAddress, event);
    sdk.Pools.loadPool(graph_ts_1.Bytes.fromUTF8(transcoderAddress.toHexString())).addRevenueNative(WETH, constants.BIGINT_ZERO, ethAmount);
}
exports.handleWinningTicketRedeemed = handleWinningTicketRedeemed;
