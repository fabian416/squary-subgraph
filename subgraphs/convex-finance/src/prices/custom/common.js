"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOREX_ORACLES =
  exports.EURT_USDT_LP_TOKEN =
  exports.EURS_USDC_LP_TOKEN =
  exports.CHF_LP_TOKEN =
  exports.AUD_LP_TOKEN =
  exports.GBP_LP_TOKEN =
  exports.KRW_LP_TOKEN =
  exports.JPY_LP_TOKEN =
  exports.EUR_LP_TOKEN =
  exports.EURN_LP_TOKEN =
  exports.EURS_LP_TOKEN =
  exports.EURT_LP_TOKEN =
    void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
// for Forex and EUR pool, map lp token to Chainlink price feed
exports.EURT_LP_TOKEN = "0xfd5db7463a3ab53fd211b4af195c5bccc1a03890";
exports.EURS_LP_TOKEN = "0x194ebd173f6cdace046c53eacce9b953f28411d1";
exports.EURN_LP_TOKEN = "0x3fb78e61784c9c637d560ede23ad57ca1294c14a";
// Fixed forex proper
exports.EUR_LP_TOKEN = "0x19b080fe1ffa0553469d20ca36219f17fcf03859";
exports.JPY_LP_TOKEN = "0x8818a9bb44fbf33502be7c15c500d0c783b73067";
exports.KRW_LP_TOKEN = "0x8461a004b50d321cb22b7d034969ce6803911899";
exports.GBP_LP_TOKEN = "0xd6ac1cb9019137a896343da59dde6d097f710538";
exports.AUD_LP_TOKEN = "0x3f1b0278a9ee595635b61817630cc19de792f506";
exports.CHF_LP_TOKEN = "0x9c2c8910f113181783c249d8f6aa41b51cde0f0c";
// Mixed USDT-forex (USDT-Forex) pools
exports.EURS_USDC_LP_TOKEN = "0x3d229e1b4faab62f621ef2f6a610961f7bd7b23b";
exports.EURT_USDT_LP_TOKEN = "0x3b6831c0077a1e44ed0a21841c3bc4dc11bce833";
exports.FOREX_ORACLES = new graph_ts_1.TypedMap();
exports.FOREX_ORACLES.set(
  exports.EURT_USDT_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.EURS_USDC_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.EURT_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.EURS_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.EURN_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.EUR_LP_TOKEN,
  graph_ts_1.Address.fromString("0xb49f677943BC038e9857d61E7d053CaA2C1734C1")
);
exports.FOREX_ORACLES.set(
  exports.KRW_LP_TOKEN,
  graph_ts_1.Address.fromString("0x01435677FB11763550905594A16B645847C1d0F3")
);
exports.FOREX_ORACLES.set(
  exports.JPY_LP_TOKEN,
  graph_ts_1.Address.fromString("0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3")
);
exports.FOREX_ORACLES.set(
  exports.GBP_LP_TOKEN,
  graph_ts_1.Address.fromString("0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5")
);
exports.FOREX_ORACLES.set(
  exports.AUD_LP_TOKEN,
  graph_ts_1.Address.fromString("0x77F9710E7d0A19669A13c055F62cd80d313dF022")
);
exports.FOREX_ORACLES.set(
  exports.CHF_LP_TOKEN,
  graph_ts_1.Address.fromString("0x449d117117838fFA61263B61dA6301AA2a88B13A")
);
