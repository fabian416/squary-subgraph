"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
const pool_1 = require("./pool");
const position_1 = require("./position");
const protocol_1 = require("./protocol");
const account_1 = require("./account");
const constants = __importStar(require("../../util/constants"));
const events_1 = require("../../util/events");
const tokens_1 = require("./tokens");
class SDK {
  constructor(config, pricer, tokenInitializer, event) {
    this.Protocol = protocol_1.Perpetual.load(config, pricer, event);
    this.Tokens = new tokens_1.TokenManager(this.Protocol, tokenInitializer);
    this.Accounts = new account_1.AccountManager(this.Protocol, this.Tokens);
    this.Pools = new pool_1.PoolManager(this.Protocol, this.Tokens);
    this.Positions = new position_1.PositionManager(this.Protocol, this.Tokens);
    this.Pricer = pricer;
    this.Protocol.sdk = this;
  }
  static initializeFromEvent(config, pricer, tokenInitializer, event) {
    const customEvent = events_1.CustomEventType.initialize(
      event.block,
      event.transaction,
      event.logIndex,
      event
    );
    return new SDK(config, pricer, tokenInitializer, customEvent);
  }
  static initializeFromCall(config, pricer, tokenInitializer, event) {
    const customEvent = events_1.CustomEventType.initialize(
      event.block,
      event.transaction,
      constants.BIGINT_ZERO
    );
    return new SDK(config, pricer, tokenInitializer, customEvent);
  }
}
exports.SDK = SDK;
