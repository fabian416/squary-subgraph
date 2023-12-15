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
exports.Bridge = void 0;
const schema_1 = require("../../../../generated/schema");
const protocolSnapshot_1 = require("./protocolSnapshot");
const constants = __importStar(require("../../util/constants"));
const enums_1 = require("./enums");
const graph_ts_1 = require("@graphprotocol/graph-ts");
const chainIds_1 = require("./chainIds");
/**
 * Bridge is a wrapper around the BridgeProtocolSchema entity that takes care of
 * safely and conveniently updating the entity. Updating the Bridge entity using this
 * wrapper also takes care of the Financials and Usage snapshots.
 */
class Bridge {
  /**
   * Creates a new Bridge instance. This should only be called by the Bridge.load
   * @private
   */
  constructor(protocol, pricer, event) {
    this.sdk = null;
    this.protocol = protocol;
    this.event = event;
    this.pricer = pricer;
    this.snapshoter = new protocolSnapshot_1.ProtocolSnapshot(protocol, event);
  }
  /**
   * This is the main function to instantiate a Bridge entity. Most times it is not called directly, but from the SDK initializer.
   *
   * @param conf {BridgeConfigurer} An object that implements the BridgeConfigurer interface, to set some of the protocol's properties
   * @param pricer {TokenPricer} An object that implements the TokenPricer interface, to allow the wrapper to access pricing data
   * @param event {CustomEventType} The event being handled at a time.
   * @returns Bridge
   */
  static load(conf, pricer, event) {
    const id = graph_ts_1.Address.fromString(conf.getID());
    let protocol = schema_1.BridgeProtocol.load(id);
    if (protocol) {
      const proto = new Bridge(protocol, pricer, event);
      proto.setVersions(conf.getVersions());
      return proto;
    }
    protocol = new schema_1.BridgeProtocol(id);
    protocol.name = conf.getName();
    protocol.slug = conf.getSlug();
    protocol.network = graph_ts_1.dataSource
      .network()
      .toUpperCase()
      .replace("-", "_");
    protocol.type = constants.ProtocolType.BRIDGE;
    protocol.permissionType = conf.getPermissionType();
    protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    protocol.totalValueExportedUSD = constants.BIGDECIMAL_ZERO;
    protocol.totalValueImportedUSD = constants.BIGDECIMAL_ZERO;
    protocol.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeVolumeInUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeVolumeOutUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalVolumeUSD = constants.BIGDECIMAL_ZERO;
    protocol.netVolumeUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;
    protocol.cumulativeUniqueTransferSenders = 0;
    protocol.cumulativeUniqueTransferReceivers = 0;
    protocol.cumulativeUniqueLiquidityProviders = 0;
    protocol.cumulativeUniqueMessageSenders = 0;
    protocol.cumulativeTransactionCount = 0;
    protocol.cumulativeTransferOutCount = 0;
    protocol.cumulativeTransferInCount = 0;
    protocol.cumulativeLiquidityDepositCount = 0;
    protocol.cumulativeLiquidityWithdrawCount = 0;
    protocol.cumulativeMessageSentCount = 0;
    protocol.cumulativeMessageReceivedCount = 0;
    protocol.supportedNetworks = [];
    protocol.totalPoolCount = 0;
    protocol.totalPoolRouteCount = 0;
    protocol.totalCanonicalRouteCount = 0;
    protocol.totalWrappedRouteCount = 0;
    protocol.totalSupportedTokenCount = 0;
    const proto = new Bridge(protocol, pricer, event);
    proto.setVersions(conf.getVersions());
    return proto;
  }
  /**
   * Updates the protocol entity versions. This is called on load to make sure we update the version
   * if we've grafted the subgraph.
   *
   * @param versions {Versions} An object that implements the Versions interface, to get the protocol's versions
   */
  setVersions(versions) {
    this.protocol.schemaVersion = versions.getSchemaVersion();
    this.protocol.subgraphVersion = versions.getSubgraphVersion();
    this.protocol.methodologyVersion = versions.getMethodologyVersion();
    this.save();
  }
  /**
   * This will save the entity to storage. If any other action needs to be performed on
   * save, it should be added here.
   * It is meant to be used internally. If you need to save the entity from outside the wrapper
   * you should probably be using some of the setters instead.
   * @private
   */
  save() {
    this.protocol.save();
  }
  /**
   *
   * @returns {string} The ID of the protocol entity.
   */
  getID() {
    return this.protocol.id.toHexString();
  }
  /**
   *
   * @returns {Bytes} The ID of the protocol entity, as Bytes.
   */
  getBytesID() {
    return this.protocol.id;
  }
  /**
   *
   * @returns {CustomEventType} the event currently being handled.
   */
  getCurrentEvent() {
    return this.event;
  }
  /**
   *
   * @returns {TokenPricer} The pricer object used by the wrapper.
   * @see TokenPricer
   */
  getTokenPricer() {
    return this.pricer;
  }
  /**
   *
   * @returns {i64} The chainID of the network the subgraph is running on.
   */
  getCurrentChainID() {
    return (0, chainIds_1.networkToChainID)(this.protocol.network);
  }
  /**
   * Sets the TVL in USD for the protocol. Most times this will be called internally by
   * other members of the library when TVL changes are made to them. But if the library
   * is not well fitted to a given protocol and you need to set the TVL manually, you can
   * use this method.
   * It will also update the protocol's snapshots.
   * @param tvl {BigDecimal} The new total value locked for the protocol.
   */
  setTotalValueLocked(tvl) {
    this.protocol.totalValueLockedUSD = tvl;
    this.save();
  }
  /**
   * Adds a given USD value to the protocol's TVL. It can be a positive or negative amount.
   * Same as for setTotalValueLocked, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param tvl {BigDecimal} The value to add to the protocol's TVL.
   */
  addTotalValueLocked(tvl) {
    this.protocol.totalValueLockedUSD =
      this.protocol.totalValueLockedUSD.plus(tvl);
    this.save();
  }
  addTotalValueExportedUSD(tve) {
    this.protocol.totalValueExportedUSD =
      this.protocol.totalValueExportedUSD.plus(tve);
    this.save();
  }
  setTotalValueExportedUSD(tve) {
    this.protocol.totalValueExportedUSD = tve;
    this.save();
  }
  addTotalValueImportedUSD(tvi) {
    this.protocol.totalValueImportedUSD =
      this.protocol.totalValueImportedUSD.plus(tvi);
    this.save();
  }
  setTotalValueImportedUSD(tvi) {
    this.protocol.totalValueImportedUSD = tvi;
    this.save();
  }
  /**
   * Adds a given USD value to the protocol supplySideRevenue. It can be a positive or negative amount.
   * Same as for the rest of setters, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param rev {BigDecimal} The value to add to the protocol's supplySideRevenue.
   */
  addSupplySideRevenueUSD(rev) {
    this.protocol.cumulativeTotalRevenueUSD =
      this.protocol.cumulativeTotalRevenueUSD.plus(rev);
    this.protocol.cumulativeSupplySideRevenueUSD =
      this.protocol.cumulativeSupplySideRevenueUSD.plus(rev);
    this.save();
  }
  /**
   * Adds a given USD value to the protocol protocolSideRevenue. It can be a positive or negative amount.
   * Same as for the rest of setters, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param rev {BigDecimal} The value to add to the protocol's protocolSideRevenue.
   */
  addProtocolSideRevenueUSD(rev) {
    this.protocol.cumulativeTotalRevenueUSD =
      this.protocol.cumulativeTotalRevenueUSD.plus(rev);
    this.protocol.cumulativeProtocolSideRevenueUSD =
      this.protocol.cumulativeProtocolSideRevenueUSD.plus(rev);
    this.save();
  }
  /**
   * Adds a given USD value to the protocol's supplySideRevenue and protocolSideRevenue. It can be a positive or negative amount.
   * Same as for the rest of setters, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param protocolSide {BigDecimal} The value to add to the protocol's protocolSideRevenue.
   * @param supplySide {BigDecimal} The value to add to the protocol's supplySideRevenue.
   */
  addRevenueUSD(protocolSide, supplySide) {
    this.addSupplySideRevenueUSD(supplySide);
    this.addProtocolSideRevenueUSD(protocolSide);
  }
  /**
   * Adds a given USD value to the protocol's cumulativeVolumeInUSD. It can be a positive or negative amount.
   * Same as for the rest of setters, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param vol {BigDecimal} The value to add to the protocol's cumulativeVolumeInUSD.
   */
  addVolumeInUSD(vol) {
    this.protocol.cumulativeVolumeInUSD =
      this.protocol.cumulativeVolumeInUSD.plus(vol);
    this.updateVolumes();
  }
  /**
   * Adds a given USD value to the protocol's cumulativeVolumeOutUSD. It can be a positive or negative amount.
   * Same as for the rest of setters, this is mostly to be called internally by the library.
   * But you can use it if you need to. It will also update the protocol's snapshots.
   * @param vol {BigDecimal} The value to add to the protocol's cumulativeVolumeOutUSD.
   */
  addVolumeOutUSD(vol) {
    this.protocol.cumulativeVolumeOutUSD =
      this.protocol.cumulativeVolumeOutUSD.plus(vol);
    this.updateVolumes();
  }
  /**
   * This method will update the values of cumulativeTotalVolumeUSD and netVolumeUSD, since these can
   * be computed from the values of cumulativeVolumeInUSD and cumulativeVolumeOutUSD. It is called automatically
   * when either of those values are changed via the addVolumeInUSD or addVolumeOutUSD methods.
   * @private
   */
  updateVolumes() {
    this.protocol.netVolumeUSD = this.protocol.cumulativeVolumeInUSD.minus(
      this.protocol.cumulativeVolumeOutUSD
    );
    this.protocol.cumulativeTotalVolumeUSD =
      this.protocol.cumulativeVolumeInUSD.plus(
        this.protocol.cumulativeVolumeOutUSD
      );
    this.save();
  }
  /**
   * Adds some value to the cumulativeUniqueUsers counter. If the value is omitted it will default to 1.
   * If you are loading accounts with the AccountManager you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   */
  addUser(count = 1) {
    this.protocol.cumulativeUniqueUsers += count;
    this.save();
  }
  /**
   * Adds some value to the cumulativeUniqueTransferSenders counter. If the value is omitted it will default to 1.
   * If you are loading accounts with the AccountManager you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   */
  addTransferSender(count = 1) {
    this.protocol.cumulativeUniqueTransferSenders += count;
    this.save();
  }
  /**
   * Adds some value to the cumulativeUniqueTransferReceivers counter. If the value is omitted it will default to 1.
   * If you are loading accounts with the AccountManager you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   */
  addTransferReceiver(count = 1) {
    this.protocol.cumulativeUniqueTransferReceivers += count;
    this.save();
  }
  /**
   * Adds some value to the cumulativeUniqueLiquidityProviders counter. If the value is omitted it will default to 1.
   * If you are loading accounts with the AccountManager you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   */
  addLiquidityProvider(count = 1) {
    this.protocol.cumulativeUniqueLiquidityProviders += count;
    this.save();
  }
  /**
   * Adds some value to the cumulativeUniqueMessageSenders counter. If the value is omitted it will default to 1.
   * If you are loading accounts with the AccountManager you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   */
  addMessageSender(count = 1) {
    this.protocol.cumulativeUniqueMessageSenders += count;
    this.save();
  }
  /**
   * Will increase the hourly and daily active users counters. These will be reflected
   * on the next Usage snapshot whenever it comes up.
   */
  addActiveUser(activity) {
    this.snapshoter.addActiveUser(activity);
  }
  /**
   * Will increase the hourly and daily active transfer senders counters. These will be reflected
   * on the next Usage snapshot whenever it comes up.
   */
  addActiveTransferSender(activity) {
    this.snapshoter.addActiveTransferSender(activity);
  }
  /**
   * Will increase the hourly and daily active transfer receivers counters. These will be reflected
   * on the next Usage snapshot whenever it comes up.
   */
  addActiveTransferReceiver(activity) {
    this.snapshoter.addActiveTransferReceiver(activity);
  }
  /**
   * Will increase the hourly and daily active liquidity providers counters. These will be reflected
   * on the next Usage snapshot whenever it comes up.
   */
  addActiveLiquidityProvider(activity) {
    this.snapshoter.addActiveLiquidityProvider(activity);
  }
  /**
   * Will increase the hourly and daily active message senders counters. These will be reflected
   * on the next Usage snapshot whenever it comes up.
   */
  addActiveMessageSender(activity) {
    this.snapshoter.addActiveMessageSender(activity);
  }
  /**
   * Adds 1 to the cumulativeTransactionCount counter and adds 1 to the counter corresponding the given transaction type.
   * If you are creating transaction entities from the Account class you won't need to use this method.
   * @param type {TransactionType} The type of transaction to add.
   * @see TransactionType
   * @see Account
   */
  addTransaction(type) {
    if (type == enums_1.TransactionType.TRANSFER_IN) {
      this.protocol.cumulativeTransferInCount += 1;
    } else if (type == enums_1.TransactionType.TRANSFER_OUT) {
      this.protocol.cumulativeTransferOutCount += 1;
    } else if (type == enums_1.TransactionType.LIQUIDITY_DEPOSIT) {
      this.protocol.cumulativeLiquidityDepositCount += 1;
    } else if (type == enums_1.TransactionType.LIQUIDITY_WITHDRAW) {
      this.protocol.cumulativeLiquidityWithdrawCount += 1;
    } else if (type == enums_1.TransactionType.MESSAGE_SENT) {
      this.protocol.cumulativeMessageSentCount += 1;
    } else if (type == enums_1.TransactionType.MESSAGE_RECEIVED) {
      this.protocol.cumulativeMessageReceivedCount += 1;
    }
    this.protocol.cumulativeTransactionCount += 1;
    this.save();
  }
  /**
   * Increases the totalPoolRouteCount and totalCanonicalRouteCount counters by the given value.
   * If you are using the Pool class you won't need to use this method.
   * @param count {u8} The value to add to the counters.
   * @see Pool
   */
  addCanonicalPoolRoute(count = 1) {
    this.protocol.totalCanonicalRouteCount += count;
    this.protocol.totalPoolRouteCount += count;
    this.save();
  }
  /**
   * Increases the totalPoolRouteCount and totalWrappedRouteCount counters by the given value.
   * If you are using the Pool class you won't need to use this method.
   * @param count {u8} The value to add to the counters.
   * @see Pool
   */
  addWrappedPoolRoute(count = 1) {
    this.protocol.totalWrappedRouteCount += count;
    this.protocol.totalPoolRouteCount += count;
    this.save();
  }
  /**
   * Increases the totalPoolCount counter by the given value.
   * If you are using the PoolManager class you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   * @see PoolManager
   */
  addPool(count = 1) {
    this.protocol.totalPoolCount += count;
    this.save();
  }
  /**
   * Increases the totalSupportedTokenCount counter by the given value.
   * If you are using the Pool class you won't need to use this method.
   * @param count {u8} The value to add to the counter.
   * @see Pool
   */
  addSupportedToken(count = 1) {
    this.protocol.totalSupportedTokenCount += count;
    this.save();
  }
  /**
   * Adds the given network to the supportedNetworks array.
   * If you are using the Pool class you won't need to use this method.
   * @param chainID {i32} The chainID of the network to add.
   * @see Pool
   */
  addSupportedNetwork(chainID) {
    const network = (0, chainIds_1.chainIDToNetwork)(chainID);
    if (this.protocol.supportedNetworks.includes(network)) {
      return;
    }
    this.protocol.supportedNetworks = this.protocol.supportedNetworks.concat([
      network,
    ]);
    this.save();
  }
}
exports.Bridge = Bridge;
