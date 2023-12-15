"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeefyFinanceOrCreate =
  exports.getVaultFromStrategyOrCreate =
  exports.getTokenOrCreate =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const schema_1 = require("../../generated/schema");
const vault_1 = require("../mappings/vault");
const BeefyStrategy_1 = require("../../generated/Standard/BeefyStrategy");
const token_1 = require("../mappings/token");
const constants_1 = require("../prices/common/constants");
const prices_1 = require("../prices");
const versions_1 = require("../versions");
function getTokenOrCreate(tokenAddress, block) {
  const tokenId = tokenAddress.toHexString();
  let token = schema_1.Token.load(tokenId);
  if (!token) {
    token = new schema_1.Token(tokenId);
    token.name = (0, token_1.fetchTokenName)(tokenAddress);
    token.symbol = (0, token_1.fetchTokenSymbol)(tokenAddress);
    token.decimals = (0, token_1.fetchTokenDecimals)(tokenAddress);
  }
  const price = (0, prices_1.getUsdPricePerToken)(tokenAddress);
  if (price.reverted) {
    token.lastPriceUSD = constants_1.BIGDECIMAL_ZERO;
  } else {
    token.lastPriceUSD = price.usdPrice.div(price.decimalsBaseTen);
  }
  token.lastPriceBlockNumber = block.number;
  token.save();
  return token;
}
exports.getTokenOrCreate = getTokenOrCreate;
function getVaultFromStrategyOrCreate(strategyAddress, event) {
  const strategyContract = BeefyStrategy_1.BeefyStrategy.bind(strategyAddress);
  const vaultId = strategyContract.vault().toHexString();
  let vault = schema_1.Vault.load(vaultId);
  if (!vault) {
    vault = (0, vault_1.createVaultFromStrategy)(strategyAddress, event);
  }
  return vault;
}
exports.getVaultFromStrategyOrCreate = getVaultFromStrategyOrCreate;
function getBeefyFinanceOrCreate(vaultId) {
  let beefy = schema_1.YieldAggregator.load(constants_1.PROTOCOL_ID);
  if (!beefy) {
    beefy = new schema_1.YieldAggregator(constants_1.PROTOCOL_ID);
    beefy.name = "Beefy Finance";
    beefy.slug = "beefy-finance";
    beefy.network = graph_ts_1.dataSource
      .network()
      .toUpperCase()
      .replace("-", "_");
    beefy.type = "YIELD";
    beefy.totalValueLockedUSD = constants_1.BIGDECIMAL_ZERO;
    beefy.protocolControlledValueUSD = constants_1.BIGDECIMAL_ZERO;
    beefy.cumulativeSupplySideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    beefy.cumulativeProtocolSideRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    beefy.cumulativeTotalRevenueUSD = constants_1.BIGDECIMAL_ZERO;
    beefy.cumulativeUniqueUsers = constants_1.BIGINT_ZERO;
    beefy.vaults = [vaultId];
  }
  beefy.schemaVersion = versions_1.Versions.getSchemaVersion();
  beefy.subgraphVersion = versions_1.Versions.getSubgraphVersion();
  beefy.methodologyVersion = versions_1.Versions.getMethodologyVersion();
  beefy.save();
  return beefy;
}
exports.getBeefyFinanceOrCreate = getBeefyFinanceOrCreate;
