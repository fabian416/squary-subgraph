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
exports.handleTx = void 0;
const Deposit_1 = require("../modules/Deposit");
const Withdraw_1 = require("../modules/Withdraw");
const Swap_1 = require("../modules/Swap");
const initializer_1 = require("../common/initializer");
const constants = __importStar(require("../common/constants"));
function handleTx(data) {
    const messages = data.tx.tx.body.messages;
    for (let i = 0; i < messages.length; i++) {
        const msgType = messages[i].typeUrl;
        const msgValue = messages[i].value;
        if (msgType == constants.Messages.MsgCreatePool ||
            msgType == constants.Messages.MsgCreateBalancerPool) {
            (0, initializer_1.msgCreatePoolHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgSwapExactAmountIn ||
            msgType == constants.Messages.MsgSwapExactAmountOut) {
            (0, Swap_1.msgSwapExactAmountHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgJoinPool) {
            (0, Deposit_1.msgJoinPoolHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgJoinSwapExternAmountIn) {
            (0, Deposit_1.msgJoinSwapExternAmountInHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgJoinSwapShareAmountOut) {
            (0, Deposit_1.msgJoinSwapShareAmountOutHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgExitPool) {
            (0, Withdraw_1.msgExitPoolHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgExitSwapExternAmountOut) {
            (0, Withdraw_1.msgExitSwapExternAmountOutHandler)(msgValue, data);
        }
        else if (msgType == constants.Messages.MsgExitSwapShareAmountIn) {
            (0, Withdraw_1.msgExitSwapShareAmountInHandler)(msgValue, data);
        }
    }
}
exports.handleTx = handleTx;
