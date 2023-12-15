"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalsIgnoreCase =
  exports.ENCODED_TRANSFER_SIGNATURE =
  exports.MARKET_PREFIX =
  exports.getCOMPChainlinkFeed =
  exports.getRewardAddress =
  exports.getProtocolData =
  exports.NORMALIZE_DECIMALS =
  exports.BASE_INDEX_SCALE =
  exports.COMPOUND_DECIMALS =
  exports.RISK_TYPE =
  exports.COLATERALIZATION_TYPE =
  exports.POOL_CREATOR_PERMISSION_TYPE =
  exports.BORROWER_PERMISSION_TYPE =
  exports.LENDER_PERMISSION_TYPE =
  exports.LENDING_TYPE =
  exports.PROTOCOL_SLUG =
  exports.PROTOCOL_NAME =
  exports.PROTOCOL =
  exports.USDC_COMET_WETH_MARKET_ID =
  exports.WETH_COMET_ADDRESS =
  exports.REWARDS_ADDRESS =
  exports.DEFAULT_DECIMALS =
  exports.ETH_DECIMALS =
  exports.ETH_SYMBOL =
  exports.ETH_NAME =
  exports.ETH_ADDRESS =
  exports.ZERO_ADDRESS =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const constants_1 = require("../../../src/sdk/constants");
const manager_1 = require("../../../src/sdk/manager");
//////////////////////////////
///// Ethereum Addresses /////
//////////////////////////////
exports.ZERO_ADDRESS = graph_ts_1.Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.ETH_NAME = "Ether";
exports.ETH_SYMBOL = "ETH";
exports.ETH_DECIMALS = 18;
exports.DEFAULT_DECIMALS = 18;
// factory contract
exports.REWARDS_ADDRESS = "0x1b0e765f6224c21223aea2af16c1c46e38885a40";
exports.WETH_COMET_ADDRESS = "0xa17581a9e3356d9a858b789d68b4d866e593ae94";
exports.USDC_COMET_WETH_MARKET_ID =
  "0xc3d688b66703497daa19211eedff47f25384cdc3c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
/////////////////////////////
///// Protocol Specific /////
/////////////////////////////
exports.PROTOCOL = "Compound";
exports.PROTOCOL_NAME = "Compound III";
exports.PROTOCOL_SLUG = "compound-v3";
exports.LENDING_TYPE = constants_1.LendingType.POOLED;
exports.LENDER_PERMISSION_TYPE = constants_1.PermissionType.PERMISSIONLESS;
exports.BORROWER_PERMISSION_TYPE = constants_1.PermissionType.PERMISSIONLESS;
exports.POOL_CREATOR_PERMISSION_TYPE = constants_1.PermissionType.ADMIN;
exports.COLATERALIZATION_TYPE =
  constants_1.CollateralizationType.OVER_COLLATERALIZED;
exports.RISK_TYPE = constants_1.RiskType.GLOBAL;
exports.COMPOUND_DECIMALS = 8;
exports.BASE_INDEX_SCALE = graph_ts_1.BigInt.fromI64(1000000000000000);
exports.NORMALIZE_DECIMALS = 16;
function getProtocolData() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return new manager_1.ProtocolData(
      graph_ts_1.Bytes.fromHexString(
        "0x316f9708bb98af7da9c68c1c3b5e79039cd336e3"
      ), // factory
      exports.PROTOCOL,
      exports.PROTOCOL_NAME,
      exports.PROTOCOL_SLUG,
      constants_1.Network.MAINNET,
      exports.LENDING_TYPE,
      exports.LENDER_PERMISSION_TYPE,
      exports.BORROWER_PERMISSION_TYPE,
      exports.POOL_CREATOR_PERMISSION_TYPE,
      exports.COLATERALIZATION_TYPE,
      exports.RISK_TYPE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return new manager_1.ProtocolData(
      graph_ts_1.Bytes.fromHexString(
        "0x83e0f742cacbe66349e3701b171ee2487a26e738"
      ),
      exports.PROTOCOL,
      exports.PROTOCOL_NAME,
      exports.PROTOCOL_SLUG,
      constants_1.Network.MATIC,
      exports.LENDING_TYPE,
      exports.LENDER_PERMISSION_TYPE,
      exports.BORROWER_PERMISSION_TYPE,
      exports.POOL_CREATOR_PERMISSION_TYPE,
      exports.COLATERALIZATION_TYPE,
      exports.RISK_TYPE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return new manager_1.ProtocolData(
      graph_ts_1.Bytes.fromHexString(
        "0xb21b06d71c75973babde35b49ffdac3f82ad3775"
      ),
      exports.PROTOCOL,
      exports.PROTOCOL_NAME,
      exports.PROTOCOL_SLUG,
      constants_1.Network.ARBITRUM_ONE,
      exports.LENDING_TYPE,
      exports.LENDER_PERMISSION_TYPE,
      exports.BORROWER_PERMISSION_TYPE,
      exports.POOL_CREATOR_PERMISSION_TYPE,
      exports.COLATERALIZATION_TYPE,
      exports.RISK_TYPE
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.BASE)) {
    return new manager_1.ProtocolData(
      graph_ts_1.Bytes.fromHexString(
        "0x45939657d1ca34a8fa39a924b71d28fe8431e581"
      ),
      exports.PROTOCOL,
      exports.PROTOCOL_NAME,
      exports.PROTOCOL_SLUG,
      constants_1.Network.BASE,
      exports.LENDING_TYPE,
      exports.LENDER_PERMISSION_TYPE,
      exports.BORROWER_PERMISSION_TYPE,
      exports.POOL_CREATOR_PERMISSION_TYPE,
      exports.COLATERALIZATION_TYPE,
      exports.RISK_TYPE
    );
  }
  graph_ts_1.log.critical("[getProtocolData] Unsupported network: {}", [
    network,
  ]);
  return new manager_1.ProtocolData(
    exports.ZERO_ADDRESS,
    "",
    "",
    "",
    "",
    "",
    null,
    null,
    null,
    null,
    null
  );
}
exports.getProtocolData = getProtocolData;
function getRewardAddress() {
  const network = graph_ts_1.dataSource.network();
  if (equalsIgnoreCase(network, constants_1.Network.MAINNET)) {
    return graph_ts_1.Address.fromString(
      "0x1b0e765f6224c21223aea2af16c1c46e38885a40"
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return graph_ts_1.Address.fromString(
      "0x45939657d1ca34a8fa39a924b71d28fe8431e581"
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return graph_ts_1.Address.fromString(
      "0x88730d254a2f7e6ac8388c3198afd694ba9f7fae"
    );
  } else if (equalsIgnoreCase(network, constants_1.Network.BASE)) {
    return graph_ts_1.Address.fromString(
      "0x123964802e6ababbe1bc9547d72ef1b69b00a6b1"
    );
  }
  graph_ts_1.log.critical("[getRewardAddress] Unsupported network: {}", [
    network,
  ]);
  return exports.ZERO_ADDRESS;
}
exports.getRewardAddress = getRewardAddress;
function getCOMPChainlinkFeed(network) {
  if (equalsIgnoreCase(network, constants_1.Network.MATIC)) {
    return graph_ts_1.Address.fromString(
      "0x2a8758b7257102461bc958279054e372c2b1bde6"
    );
  }
  if (equalsIgnoreCase(network, constants_1.Network.ARBITRUM_ONE)) {
    return graph_ts_1.Address.fromString(
      "0xe7c53ffd03eb6cef7d208bc4c13446c76d1e5884"
    );
  }
  graph_ts_1.log.error("[getCOMPChainlinkFeed] Unsupported network: {}", [
    network,
  ]);
  return exports.ZERO_ADDRESS;
}
exports.getCOMPChainlinkFeed = getCOMPChainlinkFeed;
//////////////////
///// Extras /////
//////////////////
exports.MARKET_PREFIX = "Compound V3 ";
exports.ENCODED_TRANSFER_SIGNATURE = graph_ts_1.crypto.keccak256(
  graph_ts_1.ByteArray.fromUTF8("Transfer(address,address,uint256)")
);
function equalsIgnoreCase(a, b) {
  return a.replace("-", "_").toLowerCase() == b.replace("-", "_").toLowerCase();
}
exports.equalsIgnoreCase = equalsIgnoreCase;
