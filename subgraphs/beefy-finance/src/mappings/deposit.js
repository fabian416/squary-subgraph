"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeposit = void 0;
const schema_1 = require("../../generated/schema");
const BeefyStrategy_1 = require("../../generated/Standard/BeefyStrategy");
const getters_1 = require("../utils/getters");
const constants_1 = require("../prices/common/constants");
function createDeposit(event, depositedAmount, vaultId) {
  const deposit = new schema_1.Deposit(
    event.transaction.hash.toHexString().concat(`-${event.transaction.index}`)
  );
  deposit.hash = event.transaction.hash.toHexString();
  deposit.logIndex = event.transaction.index.toI32();
  deposit.from = event.transaction.from.toHexString();
  const to = event.transaction.to;
  deposit.to = to ? to.toHexString() : constants_1.ZERO_ADDRESS_STRING;
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  const strategyContract = BeefyStrategy_1.BeefyStrategy.bind(event.address);
  const asset = (0, getters_1.getTokenOrCreate)(
    strategyContract.want(),
    event.block
  );
  deposit.asset = asset.id;
  deposit.amount = depositedAmount;
  deposit.amountUSD = asset.lastPriceUSD
    .times(depositedAmount.toBigDecimal())
    .div(constants_1.BIGINT_TEN.pow(asset.decimals).toBigDecimal());
  deposit.vault = vaultId;
  deposit.protocol = constants_1.PROTOCOL_ID;
  deposit.save();
  return deposit;
}
exports.createDeposit = createDeposit;
