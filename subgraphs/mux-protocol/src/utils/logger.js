"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
/**
 * Logger class is used to log messages to be picked up by our logging system.
 *
 * @param event The event that triggered the log message
 * @param funcName The name of the function that triggered the log message
 * @param msg The message to log (add `{}` to the message to add additional arguments)
 * @param args Any additional arguments to add to the msg (same format as graph-ts log functions)
 */
class Logger {
    constructor(event, funcName) {
        this.event = event;
        this.funcName = funcName;
    }
    formatLog(msg) {
        return `messari_log: [${this.funcName}}] tx: ${this.event.transaction.hash.toHexString()} :: ${msg}`;
    }
    info(msg, args) {
        graph_ts_1.log.info(this.formatLog(msg), args);
    }
    warning(msg, args) {
        graph_ts_1.log.warning(this.formatLog(msg), args);
    }
    error(msg, args) {
        graph_ts_1.log.error(this.formatLog(msg), args);
    }
    critical(msg, args) {
        graph_ts_1.log.critical(this.formatLog(msg), args);
    }
    appendFuncName(funcName) {
        this.funcName = this.funcName.concat("/").concat(funcName);
    }
}
exports.Logger = Logger;
