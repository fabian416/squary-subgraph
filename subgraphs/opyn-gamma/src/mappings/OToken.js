"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransfer = void 0;
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
const tokens_1 = require("../common/tokens");
const account_1 = require("../entities/account");
const option_1 = require("../entities/option");
const pool_1 = require("../entities/pool");
const position_1 = require("../entities/position");
const snapshot_1 = require("../entities/snapshot");
function handleTransfer(event) {
    const option = schema_1.Option.load(event.address);
    const amount = event.params.value;
    (0, snapshot_1.takeSnapshots)(event, (0, pool_1.getOrCreatePool)((0, tokens_1.getOrCreateToken)(option.pool)));
    if (event.params.from.toHexString() == constants_1.ZERO_ADDRESS) {
        // mint
        (0, option_1.mintOption)(event, option, amount);
        const account = (0, account_1.getOrCreateAccount)(event.params.to);
        (0, account_1.incrementAccountMintedCount)(event, account, option);
        return;
    }
    const from = (0, account_1.getOrCreateAccount)(event.params.from);
    (0, position_1.updatePosition)(event, from, option, constants_1.BIGINT_ZERO.minus(amount));
    if (event.params.to.toHexString() == constants_1.ZERO_ADDRESS) {
        // burn
        (0, option_1.burnOption)(event, option, amount);
    }
    else {
        const to = (0, account_1.getOrCreateAccount)(event.params.to);
        (0, position_1.updatePosition)(event, to, option, amount);
    }
}
exports.handleTransfer = handleTransfer;
