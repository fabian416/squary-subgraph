"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRewardTokens = exports.getOrCreateRewardToken = exports.getOrCreateToken = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../../generated/Manager/ERC20");
const schema_1 = require("../../generated/schema");
const constants_1 = require("../common/constants");
function getOrCreateToken(address) {
    let id = address.toHexString();
    let token = schema_1.Token.load(id);
    if (!token) {
        token = new schema_1.Token(id);
        let erc20Contract = ERC20_1.ERC20.bind(address);
        let decimals = erc20Contract.try_decimals();
        // Using try_cause some values might be missing
        let name = erc20Contract.try_name();
        let symbol = erc20Contract.try_symbol();
        // TODO: add overrides for name and symbol
        token.decimals = decimals.reverted ? constants_1.DEFAULT_DECIMALS : decimals.value;
        token.name = name.reverted ? "" : name.value;
        token.symbol = symbol.reverted ? "" : symbol.value;
        token.save();
    }
    return token;
}
exports.getOrCreateToken = getOrCreateToken;
function getOrCreateRewardToken(address) {
    let id = address.toHexString();
    let rewardToken = schema_1.RewardToken.load(id);
    if (!rewardToken) {
        let token = getOrCreateToken(address);
        rewardToken = new schema_1.RewardToken(id);
        rewardToken.token = token.id;
        rewardToken.type = constants_1.RewardTokenType.DEPOSIT;
        rewardToken.save();
    }
    return rewardToken;
}
exports.getOrCreateRewardToken = getOrCreateRewardToken;
function createRewardTokens() {
    const address = graph_ts_1.Address.fromString(constants_1.TOKE_ADDRESS);
    const rewardToken = getOrCreateRewardToken(address);
    // Values if TOKE token is not deployed yet
    const token = getOrCreateToken(graph_ts_1.Address.fromString(rewardToken.token));
    if (token.name === "") {
        token.name = constants_1.TOKE_NAME;
        token.symbol = constants_1.TOKE_SYMBOL;
        token.save();
    }
    return rewardToken;
}
exports.createRewardTokens = createRewardTokens;
