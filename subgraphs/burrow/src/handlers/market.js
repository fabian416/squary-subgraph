"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateAsset = exports.handleNewAsset = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const market_1 = require("../helpers/market");
const token_1 = require("../helpers/token");
const const_1 = require("../utils/const");
const protocol_1 = require("../helpers/protocol");
const graph_ts_2 = require("@graphprotocol/graph-ts");
function handleNewAsset(event) {
  const data = event.data;
  const receipt = event.receipt;
  const token_id = data.get("token_id");
  if (!token_id) {
    graph_ts_1.log.info("NEW_ASSET::Token ID not found", []);
    return;
  }
  const token = (0, token_1.getOrCreateToken)(token_id.toString());
  const market = (0, market_1.getOrCreateMarket)(token_id.toString());
  const assetConfigObj = data.get("asset_config");
  if (!assetConfigObj) {
    graph_ts_1.log.info("NEW_ASSET::Data not found", []);
    return;
  }
  if (assetConfigObj.kind != graph_ts_1.JSONValueKind.OBJECT) {
    graph_ts_1.log.info("NEW_ASSET::Incorrect type assetConfigObj {}", [
      assetConfigObj.kind.toString(),
    ]);
    return;
  }
  const assetConfig = assetConfigObj.toObject();
  market.name = token.name;
  market.createdBlockNumber = graph_ts_1.BigInt.fromU64(
    receipt.block.header.height
  );
  market.createdTimestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOSEC_TO_SEC)(receipt.block.header.timestampNanosec)
  );
  market._lastUpdateTimestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOS_TO_MS)(receipt.block.header.timestampNanosec)
  );
  /* -------------------------------------------------------------------------- */
  /*                                reserve_ratio                               */
  /* -------------------------------------------------------------------------- */
  const reserve_ratio = assetConfig.get("reserve_ratio");
  if (!reserve_ratio) {
    graph_ts_1.log.info("NEW_ASSET::Reserve ratio not found", []);
    return;
  }
  market._reserveRatio = graph_ts_1.BigInt.fromI64(reserve_ratio.toI64());
  /* -------------------------------------------------------------------------- */
  /*                             target_utilization                             */
  /* -------------------------------------------------------------------------- */
  const target_utilization = assetConfig.get("target_utilization");
  if (!target_utilization) {
    graph_ts_1.log.info("NEW_ASSET::Target utilization not found", []);
    return;
  }
  market._targetUtilization = graph_ts_1.BigInt.fromI64(
    target_utilization.toI64()
  );
  /* -------------------------------------------------------------------------- */
  /*                          _targetUtilization_rate                          */
  /* -------------------------------------------------------------------------- */
  const target_utilization_rate = assetConfig.get("target_utilization_rate");
  if (!target_utilization_rate) {
    graph_ts_1.log.info("NEW_ASSET::Target utilization rate not found", []);
    return;
  }
  market._targetUtilizationRate = graph_ts_1.BigInt.fromString(
    target_utilization_rate.toString()
  );
  /* -------------------------------------------------------------------------- */
  /*                            max_utilization_ratȩ                           */
  /* -------------------------------------------------------------------------- */
  const max_utilization_rate = assetConfig.get("max_utilization_rate");
  if (!max_utilization_rate) {
    graph_ts_1.log.info("NEW_ASSET::Max utilization rate not found", []);
    return;
  }
  market._maxUtilizationRate = graph_ts_1.BigInt.fromString(
    max_utilization_rate.toString()
  );
  /* -------------------------------------------------------------------------- */
  /*                              volatility_ratio                              */
  /* -------------------------------------------------------------------------- */
  const volatility_ratio = assetConfig.get("volatility_ratio");
  if (!volatility_ratio) {
    graph_ts_1.log.info("NEW_ASSET::Volatility ratio not found", []);
    return;
  }
  market.maximumLTV = graph_ts_2.BigDecimal.fromString(
    volatility_ratio.toI64().toString()
  ).div(const_1.BIGDECIMAL_100);
  market.liquidationThreshold = graph_ts_2.BigDecimal.fromString(
    volatility_ratio.toI64().toString()
  ).div(const_1.BIGDECIMAL_100);
  market.liquidationPenalty = const_1.BIGDECIMAL_100.minus(
    market.liquidationThreshold
  ).div(const_1.BIGDECIMAL_TWO);
  /* -------------------------------------------------------------------------- */
  /*                              extra_decimals                                */
  /* -------------------------------------------------------------------------- */
  market.inputToken = token.id;
  const extra_decimals = assetConfig.get("extra_decimals");
  if (!extra_decimals) {
    graph_ts_1.log.info("NEW_ASSET::extra_decimals ratio not found", []);
    return;
  }
  token.extraDecimals = extra_decimals.toI64();
  const asset = const_1.assets.get(token_id.toString());
  if (asset) {
    token.extraDecimals = asset.extraDecimals;
  }
  /* -------------------------------------------------------------------------- */
  /*                          can_use_as_collateral                             */
  /* -------------------------------------------------------------------------- */
  const can_use_as_collateral = assetConfig.get("can_use_as_collateral");
  if (!can_use_as_collateral) {
    graph_ts_1.log.info("NEW_ASSET::can_use_as_collateral not found {}", []);
    return;
  }
  market.canUseAsCollateral = can_use_as_collateral.toBool();
  /* -------------------------------------------------------------------------- */
  /*                                 can_borrow                                 */
  /* -------------------------------------------------------------------------- */
  const can_borrow = assetConfig.get("can_borrow");
  if (!can_borrow) {
    graph_ts_1.log.info("NEW_ASSET::can_borrow not found {}", []);
    return;
  }
  market.canBorrowFrom = can_borrow.toBool();
  /* -------------------------------------------------------------------------- */
  /*                       can_deposit && can_withdraw                          */
  /* -------------------------------------------------------------------------- */
  const can_deposit = assetConfig.get("can_deposit");
  if (!can_deposit) {
    graph_ts_1.log.info("NEW_ASSET::can_deposit not found {}", []);
    return;
  }
  const can_withdraw = assetConfig.get("can_withdraw");
  if (!can_withdraw) {
    graph_ts_1.log.info("NEW_ASSET::can_withdraw not found {}", []);
    return;
  }
  market.isActive = can_deposit.toBool() && can_withdraw.toBool();
  // Save
  token.save();
  market.save();
  // save to protocol data
  const protocol = (0, protocol_1.getOrCreateProtocol)();
  const tempMarkets = protocol._marketIds;
  tempMarkets.push(market.id);
  protocol._marketIds = tempMarkets;
  protocol.totalPoolCount += 1;
  protocol.save();
}
exports.handleNewAsset = handleNewAsset;
function handleUpdateAsset(event) {
  const data = event.data;
  const receipt = event.receipt;
  const token_id = data.get("token_id");
  if (!token_id) {
    graph_ts_1.log.info("NEW_ASSET::Token ID not found {}", []);
    return;
  }
  const token = (0, token_1.getOrCreateToken)(token_id.toString());
  const market = (0, market_1.getOrCreateMarket)(token_id.toString());
  const assetConfigObj = data.get("asset_config");
  if (!assetConfigObj) {
    graph_ts_1.log.info("NEW_ASSET::Data not found {}", []);
    return;
  }
  if (assetConfigObj.kind != graph_ts_1.JSONValueKind.OBJECT) {
    graph_ts_1.log.info("NEW_ASSET::Incorrect type assetConfigObj {}", [
      assetConfigObj.kind.toString(),
    ]);
    return;
  }
  const assetConfig = assetConfigObj.toObject();
  market._lastUpdateTimestamp = graph_ts_1.BigInt.fromU64(
    (0, const_1.NANOS_TO_MS)(receipt.block.header.timestampNanosec)
  );
  /* -------------------------------------------------------------------------- */
  /*                                reserve_ratio                               */
  /* -------------------------------------------------------------------------- */
  const reserve_ratio = assetConfig.get("reserve_ratio");
  if (!reserve_ratio) {
    graph_ts_1.log.info("NEW_ASSET::Reserve ratio not found {}", []);
    return;
  }
  market._reserveRatio = graph_ts_1.BigInt.fromI64(reserve_ratio.toI64());
  /* -------------------------------------------------------------------------- */
  /*                             target_utilization                             */
  /* -------------------------------------------------------------------------- */
  const target_utilization = assetConfig.get("target_utilization");
  if (!target_utilization) {
    graph_ts_1.log.info("NEW_ASSET::Target utilization not found {}", []);
    return;
  }
  market._targetUtilization = graph_ts_1.BigInt.fromI64(
    target_utilization.toI64()
  );
  /* -------------------------------------------------------------------------- */
  /*                          _targetUtilization_rate                          */
  /* -------------------------------------------------------------------------- */
  const target_utilization_rate = assetConfig.get("target_utilization_rate");
  if (!target_utilization_rate) {
    graph_ts_1.log.info("NEW_ASSET::Target utilization rate not found {}", []);
    return;
  }
  market._targetUtilizationRate = graph_ts_1.BigInt.fromString(
    target_utilization_rate.toString()
  );
  /* -------------------------------------------------------------------------- */
  /*                            max_utilization_ratȩ                           */
  /* -------------------------------------------------------------------------- */
  const max_utilization_rate = assetConfig.get("max_utilization_rate");
  if (!max_utilization_rate) {
    graph_ts_1.log.info("NEW_ASSET::Max utilization rate not found {}", []);
    return;
  }
  market._maxUtilizationRate = graph_ts_1.BigInt.fromString(
    max_utilization_rate.toString()
  );
  /* -------------------------------------------------------------------------- */
  /*                              volatility_ratio                              */
  /* -------------------------------------------------------------------------- */
  const volatility_ratio = assetConfig.get("volatility_ratio");
  if (!volatility_ratio) {
    graph_ts_1.log.info("NEW_ASSET::Volatility ratio not found {}", []);
    return;
  }
  market._volatilityRatio = graph_ts_1.BigInt.fromI64(volatility_ratio.toI64());
  /* -------------------------------------------------------------------------- */
  /*                              extra_decimals                                */
  /* -------------------------------------------------------------------------- */
  market.inputToken = token.id;
  const extra_decimals = assetConfig.get("extra_decimals");
  if (!extra_decimals) {
    graph_ts_1.log.info("NEW_ASSET::extra_decimals ratio not found {}", []);
    return;
  }
  token.extraDecimals = extra_decimals.toI64();
  const asset = const_1.assets.get(token_id.toString());
  if (asset) {
    token.extraDecimals = asset.extraDecimals;
  }
  /* -------------------------------------------------------------------------- */
  /*                          can_use_as_collateral                             */
  /* -------------------------------------------------------------------------- */
  const can_use_as_collateral = assetConfig.get("can_use_as_collateral");
  if (!can_use_as_collateral) {
    graph_ts_1.log.info("NEW_ASSET::can_use_as_collateral not found {}", []);
    return;
  }
  market.canUseAsCollateral = can_use_as_collateral.toBool();
  /* -------------------------------------------------------------------------- */
  /*                                 can_borrow                                 */
  /* -------------------------------------------------------------------------- */
  const can_borrow = assetConfig.get("can_borrow");
  if (!can_borrow) {
    graph_ts_1.log.info("NEW_ASSET::can_borrow not found {}", []);
    return;
  }
  market.canBorrowFrom = can_borrow.toBool();
  /* -------------------------------------------------------------------------- */
  /*                       can_deposit && can_withdraw                          */
  /* -------------------------------------------------------------------------- */
  const can_deposit = assetConfig.get("can_deposit");
  if (!can_deposit) {
    graph_ts_1.log.info("NEW_ASSET::can_deposit not found {}", []);
    return;
  }
  const can_withdraw = assetConfig.get("can_withdraw");
  if (!can_withdraw) {
    graph_ts_1.log.info("NEW_ASSET::can_withdraw not found {}", []);
    return;
  }
  market.isActive = can_deposit.toBool();
  // Save
  token.save();
  market.save();
}
exports.handleUpdateAsset = handleUpdateAsset;
