"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventData = void 0;
class EventData {
  constructor(eventName, methodName, data, receipt, logIndex, args) {
    this.eventName = eventName;
    this.methodName = methodName;
    this.data = data;
    this.receipt = receipt;
    this.logIndex = logIndex;
    this.args = args;
  }
}
exports.EventData = EventData;
