"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdraw = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const BeefyStrategy_1 = require("../../generated/Standard/BeefyStrategy");
const getters_1 = require("../utils/getters");
const constants_1 = require("../prices/common/constants");
function createWithdraw(event, withdrawnAmount, vaultId) {
  const withdraw = new schema_1.Withdraw(
    event.transaction.hash.toHexString().concat(`-${event.transaction.index}`)
  );
  withdraw.hash = event.transaction.hash.toHexString();
  withdraw.logIndex = event.transaction.index.toI32();
  withdraw.from = event.transaction.from.toHexString();
  const to = event.transaction.to;
  withdraw.to = to ? to.toHexString() : constants_1.ZERO_ADDRESS_STRING;
  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  const strategyContract = BeefyStrategy_1.BeefyStrategy.bind(event.address);
  const asset = (0, getters_1.getTokenOrCreate)(
    strategyContract.want(),
    event.block
  );
  withdraw.asset = asset.id;
  withdraw.amount = withdrawnAmount;
  withdraw.amountUSD = asset.lastPriceUSD
    .times(new graph_ts_1.BigDecimal(withdrawnAmount))
    .div(new graph_ts_1.BigDecimal(constants_1.BIGINT_TEN.pow(asset.decimals)));
  withdraw.vault = vaultId;
  withdraw.protocol = constants_1.PROTOCOL_ID;
  withdraw.save();
  return withdraw;
}
exports.createWithdraw = createWithdraw;
