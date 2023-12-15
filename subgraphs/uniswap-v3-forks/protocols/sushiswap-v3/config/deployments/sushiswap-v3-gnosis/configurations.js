"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapV3GnosisConfigurations = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const Factory_1 = require("../../../../../generated/Factory/Factory");
const constants_1 = require("../../../../../src/common/constants");
const constants_2 = require("../../../src/common/constants");
const utils_1 = require("../../../../../src/common/utils/utils");
class SushiswapV3GnosisConfigurations {
    getNetwork() {
        return constants_1.Network.XDAI;
    }
    getProtocolName() {
        return constants_2.PROTOCOL_NAME;
    }
    getProtocolSlug() {
        return constants_2.PROTOCOL_SLUG;
    }
    getFactoryAddress() {
        return graph_ts_1.Bytes.fromHexString("0xf78031cbca409f2fb6876bdfdbc1b2df24cf9bef");
    }
    getFactoryContract() {
        return Factory_1.Factory.bind(graph_ts_1.Address.fromString("0xf78031cbca409f2fb6876bdfdbc1b2df24cf9bef"));
    }
    getProtocolFeeOnOff() {
        return constants_1.FeeSwitch.ON;
    }
    getInitialProtocolFeeProportion(fee) {
        graph_ts_1.log.warning("getProtocolFeeRatio is not implemented: {}", [fee.toString()]);
        return constants_1.BIGDECIMAL_ZERO;
    }
    getProtocolFeeProportion(protocolFee) {
        return constants_1.BIGDECIMAL_ONE.div(protocolFee.toBigDecimal());
    }
    getRewardIntervalType() {
        return constants_1.RewardIntervalType.NONE;
    }
    getReferenceToken() {
        return graph_ts_1.Bytes.fromHexString("0xe91d153e0b41518a2ce8dd3d7944fa863463a97d"); // WXDAI
    }
    getRewardToken() {
        return graph_ts_1.Bytes.fromHexString("");
    }
    getWhitelistTokens() {
        return (0, utils_1.stringToBytesList)([
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0x2995d1317dcd4f0ab89f4ae60f3f020a4f17c7ce",
            "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
            "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252",
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
            "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
            "0x82dfe19164729949fd66da1a37bc70dd6c4746ce",
            "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
            "0x44fa8e6f47987339850636f88629646662444217",
            "0xfe7ed09c4956f7cdb54ec4ffcb9818db2d7025b8",
            "0x9c58bacc331c9aa871afd802db6379a98e80cedb", // GNO
        ]);
    }
    getStableCoins() {
        return (0, utils_1.stringToBytesList)([
            "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
            "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
            "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
            "0x44fa8e6f47987339850636f88629646662444217",
            "0xfe7ed09c4956f7cdb54ec4ffcb9818db2d7025b8", // USDP
        ]);
    }
    getStableOraclePools() {
        return (0, utils_1.stringToBytesList)([
            "0xf5e270c0d97f88efb023a161b9fcc5d0c7ad0b70", // USDC/wETH
        ]);
    }
    getUntrackedPairs() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getUntrackedTokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
    getMinimumLiquidityThreshold() {
        return graph_ts_1.BigDecimal.fromString("1000");
    }
    getBrokenERC20Tokens() {
        return (0, utils_1.stringToBytesList)([]);
    }
}
exports.SushiswapV3GnosisConfigurations = SushiswapV3GnosisConfigurations;
