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
exports.averagePrice =
  exports.kClosestPrices =
  exports.getConfig =
  exports.getTokenSupply =
  exports.getTokenDecimals =
  exports.getTokenName =
  exports.readValue =
  exports.bigIntToBigDecimal =
  exports.isNullAddress =
    void 0;
const BSC = __importStar(require("../config/bsc"));
const CELO = __importStar(require("../config/celo"));
const FUSE = __importStar(require("../config/fuse"));
const XDAI = __importStar(require("../config/gnosis"));
const CRONOS = __importStar(require("../config/cronos"));
const AURORA = __importStar(require("../config/aurora"));
const FANTOM = __importStar(require("../config/fantom"));
const POLYGON = __importStar(require("../config/polygon"));
const MAINNET = __importStar(require("../config/mainnet"));
const HARMONY = __importStar(require("../config/harmony"));
const MOONBEAM = __importStar(require("../config/moonbeam"));
const OPTIMISM = __importStar(require("../config/optimism"));
const AVALANCHE = __importStar(require("../config/avalanche"));
const ARBITRUM_ONE = __importStar(require("../config/arbitrum"));
const types_1 = require("./types");
const constants = __importStar(require("./constants"));
const TEMPLATE = __importStar(require("../config/template"));
const _ERC20_1 = require("../../../generated/ERC20Gateway/_ERC20");
const graph_ts_1 = require("@graphprotocol/graph-ts");
function isNullAddress(tokenAddr) {
  return tokenAddr.equals(constants.NULL.TYPE_ADDRESS);
}
exports.isNullAddress = isNullAddress;
function bigIntToBigDecimal(
  quantity,
  decimals = constants.DEFAULT_DECIMALS.toI32()
) {
  return quantity.divDecimal(constants.BIGINT_TEN.pow(decimals).toBigDecimal());
}
exports.bigIntToBigDecimal = bigIntToBigDecimal;
function readValue(callResult, defaultValue) {
  return callResult.reverted ? defaultValue : callResult.value;
}
exports.readValue = readValue;
function getTokenName(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const name = readValue(tokenContract.try_name(), "");
  return name;
}
exports.getTokenName = getTokenName;
function getTokenDecimals(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const decimals = readValue(
    tokenContract.try_decimals(),
    constants.DEFAULT_DECIMALS
  );
  return decimals;
}
exports.getTokenDecimals = getTokenDecimals;
function getTokenSupply(tokenAddr) {
  const tokenContract = _ERC20_1._ERC20.bind(tokenAddr);
  const totalSupply = readValue(
    tokenContract.try_totalSupply(),
    constants.BIGINT_ONE
  );
  return totalSupply;
}
exports.getTokenSupply = getTokenSupply;
function getConfig() {
  const network = graph_ts_1.dataSource.network();
  if (network == XDAI.NETWORK_STRING) {
    return new XDAI.config();
  } else if (network == AURORA.NETWORK_STRING) {
    return new AURORA.config();
  } else if (network == BSC.NETWORK_STRING) {
    return new BSC.config();
  } else if (network == FANTOM.NETWORK_STRING) {
    return new FANTOM.config();
  } else if (network == POLYGON.NETWORK_STRING) {
    return new POLYGON.config();
  } else if (network == MAINNET.NETWORK_STRING) {
    return new MAINNET.config();
  } else if (network == HARMONY.NETWORK_STRING) {
    return new HARMONY.config();
  } else if (network == MOONBEAM.NETWORK_STRING) {
    return new MOONBEAM.config();
  } else if (network == OPTIMISM.NETWORK_STRING) {
    return new OPTIMISM.config();
  } else if (network == AVALANCHE.NETWORK_STRING) {
    return new AVALANCHE.config();
  } else if (network == ARBITRUM_ONE.NETWORK_STRING) {
    return new ARBITRUM_ONE.config();
  } else if (network == CRONOS.NETWORK_STRING) {
    return new CRONOS.config();
  } else if (network == CELO.NETWORK_STRING) {
    return new CELO.config();
  } else if (network == FUSE.NETWORK_STRING) {
    return new FUSE.config();
  }
  return new TEMPLATE.config();
}
exports.getConfig = getConfig;
function sortByPrices(prices) {
  const pricesSorted = prices.sort(function (a, b) {
    const x = a.usdPrice;
    const y = b.usdPrice;
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  });
  return pricesSorted;
}
function pairwiseDiffOfPrices(prices) {
  const diff = [];
  for (let i = 1; i < prices.length; i++) {
    const x = prices[i].usdPrice;
    const y = prices[i - 1].usdPrice;
    diff.push(x.minus(y));
  }
  return diff;
}
function kClosestPrices(k, prices) {
  // sort by USD prices
  const pricesSorted = sortByPrices(prices);
  // pairwise difference in USD prices
  const pairwiseDiff = pairwiseDiffOfPrices(pricesSorted);
  // k minimum difference values and their original indexes
  const pairwiseDiffCopy = pairwiseDiff.map((x) => x);
  const pairwiseDiffSortedSlice = pairwiseDiffCopy.sort().slice(0, k);
  const minDiffAtIdx = [];
  for (let i = 0; i < pairwiseDiffSortedSlice.length; i++) {
    const idx = pairwiseDiff.indexOf(pairwiseDiffSortedSlice[i]);
    minDiffAtIdx.push(idx);
  }
  // k closest USD price values
  const kClosestPrices = [];
  for (let i = 0; i < minDiffAtIdx.length; i++) {
    if (!kClosestPrices.includes(pricesSorted[minDiffAtIdx[i]])) {
      kClosestPrices.push(pricesSorted[minDiffAtIdx[i]]);
    }
    if (!kClosestPrices.includes(pricesSorted[minDiffAtIdx[i] + 1])) {
      kClosestPrices.push(pricesSorted[minDiffAtIdx[i] + 1]);
    }
  }
  return kClosestPrices;
}
exports.kClosestPrices = kClosestPrices;
function averagePrice(prices) {
  let summationUSDPrice = constants.BIGDECIMAL_ZERO;
  for (let i = 0; i < prices.length; i++) {
    summationUSDPrice = summationUSDPrice.plus(prices[i].usdPrice);
  }
  return types_1.CustomPriceType.initialize(
    summationUSDPrice.div(
      new graph_ts_1.BigDecimal(graph_ts_1.BigInt.fromI32(prices.length))
    ),
    constants.DEFAULT_USDC_DECIMALS
  );
}
exports.averagePrice = averagePrice;
