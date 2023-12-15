"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMigrationCaller = exports.handleSellGem = exports.handleBuyGem = exports.handleCreateProxy = exports.handleCdpMove = exports.handleCdpFlux = exports.handleCdpQuit = exports.handleCdpEnter = exports.handleCdpShift = exports.handleCdpGive = exports.handleNewCdp = exports.handlePotDrip = exports.handlePotFileDsr = exports.handlePotFileVow = exports.handleJugFileDuty = exports.handleSpotPoke = exports.handleSpotFilePar = exports.handleSpotFileMat = exports.handleClipYankBid = exports.handleClipTakeBid = exports.handleFlipEndAuction = exports.handleFlipBids = exports.handleDogFile = exports.handleDogBark = exports.handleCatFile = exports.handleCatBite = exports.handleVatFold = exports.handleVatFork = exports.handleVatFrob = exports.handleVatGrab = exports.handleVatCage = exports.handleVatRely = void 0;
const graph_ts_1 = require("@graphprotocol/graph-ts");
const ERC20_1 = require("../generated/Vat/ERC20");
const GemJoin_1 = require("../generated/Vat/GemJoin");
const Vat_1 = require("../generated/Vat/Vat");
const templates_1 = require("../generated/templates");
const Flip_1 = require("../generated/templates/Flip/Flip");
const Clip_1 = require("../generated/templates/Clip/Clip");
const Jug_1 = require("../generated/Jug/Jug");
const Pot_1 = require("../generated/Pot/Pot");
const CdpManager_1 = require("../generated/CdpManager/CdpManager");
const PSM_1 = require("../generated/PSM-USDC-A/PSM");
const getters_1 = require("./common/getters");
const schema_1 = require("../generated/schema");
const numbers_1 = require("./utils/numbers");
const getters_2 = require("./common/getters");
const bytes_1 = require("./utils/bytes");
const constants_1 = require("./common/constants");
const helpers_1 = require("./common/helpers");
const getters_3 = require("./common/getters");
const strings_1 = require("./utils/strings");
// Authorizating Vat (CDP engine)
function handleVatRely(event) {
    const someAddress = (0, bytes_1.bytes32ToAddress)(event.params.arg1);
    graph_ts_1.log.debug("[handleVatRely]Input address = {}", [someAddress.toHexString()]);
    // We don't know whether the address passed in is a valid 'market' (gemjoin) address
    const marketContract = GemJoin_1.GemJoin.bind(someAddress);
    const ilkCall = marketContract.try_ilk(); // collateral type
    const gemCall = marketContract.try_gem(); // get market collateral token, referred to as 'gem'
    if (ilkCall.reverted || gemCall.reverted) {
        graph_ts_1.log.debug("[handleVatRely]Address {} is not a market", [
            someAddress.toHexString(),
        ]);
        graph_ts_1.log.debug("[handleVatRely]ilkCall.revert = {} gemCall.reverted = {} at tx hash {}", [
            ilkCall.reverted.toString(),
            gemCall.reverted.toString(),
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const ilk = ilkCall.value;
    const marketID = someAddress.toHexString();
    const tokenId = gemCall.value.toHexString();
    let tokenName = "unknown";
    let tokenSymbol = "unknown";
    let decimals = 18;
    const erc20Contract = ERC20_1.ERC20.bind(gemCall.value);
    const tokenNameCall = erc20Contract.try_name();
    if (tokenNameCall.reverted) {
        graph_ts_1.log.warning("[handleVatRely]Failed to get name for token {}", [tokenId]);
    }
    else {
        tokenName = tokenNameCall.value;
    }
    const tokenSymbolCall = erc20Contract.try_symbol();
    if (tokenSymbolCall.reverted) {
        graph_ts_1.log.warning("[handleVatRely]Failed to get symbol for token {}", [tokenId]);
    }
    else {
        tokenSymbol = tokenSymbolCall.value;
    }
    const tokenDecimalsCall = erc20Contract.try_decimals();
    if (tokenDecimalsCall.reverted) {
        graph_ts_1.log.warning("[handleVatRely]Failed to get decimals for token {}", [
            tokenId,
        ]);
    }
    else {
        decimals = tokenDecimalsCall.value;
    }
    if (ilk.equals(graph_ts_1.Bytes.fromHexString(constants_1.ILK_SAI))) {
        // https://etherscan.io/address/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359#readContract
        tokenName = "Dai Stablecoin v1.0";
        tokenSymbol = "SAI";
        decimals = 18;
    }
    graph_ts_1.log.info("[handleVatRely]ilk={}, market={}, token={}, name={}, symbol={}, decimals={}", [
        ilk.toString(),
        marketID,
        tokenId,
        tokenName,
        tokenSymbol,
        decimals.toString(),
    ]);
    (0, getters_3.getOrCreateMarket)(marketID, ilk.toString(), tokenId, event.block.number, event.block.timestamp);
    (0, getters_3.getOrCreateIlk)(ilk, marketID);
    (0, getters_3.getOrCreateToken)(tokenId, tokenName, tokenSymbol, decimals);
    // for protocol.mintedTokens
    (0, getters_3.getOrCreateToken)(constants_1.DAI_ADDRESS, "Dai Stablecoin", "DAI", 18);
    const protocol = (0, getters_3.getOrCreateLendingProtocol)();
    protocol.totalPoolCount += 1;
    protocol.marketIDList.push(marketID);
    protocol.save();
}
exports.handleVatRely = handleVatRely;
function handleVatCage(event) {
    const protocol = (0, getters_3.getOrCreateLendingProtocol)();
    graph_ts_1.log.info("[handleVatCage]All markets paused with tx {}", [
        event.transaction.hash.toHexString(),
    ]);
    // Vat.cage pauses all markets
    for (let i = 0; i < protocol.marketIDList.length; i++) {
        const market = (0, getters_3.getOrCreateMarket)(protocol.marketIDList[i]);
        market.isActive = false;
        market.canBorrowFrom = false;
        market.save();
    }
}
exports.handleVatCage = handleVatCage;
function handleVatGrab(event) {
    // only needed for non-liquidations
    if (!event.receipt) {
        graph_ts_1.log.error("[handleVatGrab]no receipt found. Tx Hash: {}", [
            event.transaction.hash.toHexString(),
        ]);
        return;
    }
    const liquidationSigs = [
        graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("Bite(bytes32,address,uint256,uint256,uint256,address,uint256)")),
        graph_ts_1.crypto.keccak256(graph_ts_1.ByteArray.fromUTF8("Bark(bytes32,address,uint256,uint256,uint256,address,uint256)")),
    ];
    for (let i = 0; i < event.receipt.logs.length; i++) {
        const txLog = event.receipt.logs[i];
        if (liquidationSigs.includes(txLog.topics.at(0))) {
            // it is a liquidation transaction; skip
            graph_ts_1.log.info("[handleVatGrab]Skip handle grab() for liquidation tx {}-{}", [
                event.transaction.hash.toHexString(),
                event.transactionLogIndex.toString(),
            ]);
            return;
        }
    }
    handleVatFrob(event);
}
exports.handleVatGrab = handleVatGrab;
// Borrow/Repay/Deposit/Withdraw
function handleVatFrob(event) {
    const ilk = event.params.arg1;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    let u = (0, bytes_1.bytes32ToAddressHexString)(event.params.arg2);
    let v = (0, bytes_1.bytes32ToAddressHexString)(event.params.arg3);
    // frob(bytes32 i, address u, address v, address w, int256 dink, int256 dart) call
    // 4th arg w: start = 4 (signature) + 3 * 32, end = start + 32
    let w = (0, bytes_1.bytes32ToAddressHexString)((0, bytes_1.extractCallData)(event.params.data, 100, 132));
    // 5th arg dink: start = 4 (signature) + 4 * 32, end = start + 32
    const dink = (0, bytes_1.bytesToSignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 132, 164)); // change to collateral
    // 6th arg dart: start = 4 (signature) + 4 * 32, end = start + 32
    const dart = (0, bytes_1.bytesToSignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 164, 196)); // change to debt
    const tx = event.transaction.hash
        .toHexString()
        .concat("-")
        .concat(event.transactionLogIndex.toString());
    graph_ts_1.log.info("[handleVatFrob]tx {} block {}: ilk={}, u={}, v={}, w={}, dink={}, dart={}", [
        tx,
        event.block.number.toString(),
        ilk.toString(),
        u,
        v,
        w,
        dink.toString(),
        dart.toString(),
    ]);
    const urn = u;
    const migrationCaller = getMigrationCaller(u, v, w, event);
    if (migrationCaller != null && ilk.toString() == "SAI") {
        // Ignore vat.frob calls not of interest
        // - ignore swapSaiToDai() and swapDaiToSai() calls:
        //   https://github.com/makerdao/scd-mcd-migration/blob/96b0e1f54a3b646fa15fd4c895401cf8545fda60/src/ScdMcdMigration.sol#L76-L103
        // - ignore the two migration frob calls that move SAI/DAI around to balance accounting:
        //   https://github.com/makerdao/scd-mcd-migration/blob/96b0e1f54a3b646fa15fd4c895401cf8545fda60/src/ScdMcdMigration.sol#L118-L125
        //   https://github.com/makerdao/scd-mcd-migration/blob/96b0e1f54a3b646fa15fd4c895401cf8545fda60/src/ScdMcdMigration.sol#L148-L155
        graph_ts_1.log.info("[handleVatFrob]account migration tx {} for urn={},migrationCaller={} skipped", [tx, urn, migrationCaller]);
        return;
    }
    // translate possible UrnHandler/DSProxy address to its owner address
    u = (0, getters_1.getOwnerAddress)(u);
    v = (0, getters_1.getOwnerAddress)(v);
    w = (0, getters_1.getOwnerAddress)(w);
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    if (market == null) {
        graph_ts_1.log.warning("[handleVatFrob]Failed to get market for ilk {}/{}", [
            ilk.toString(),
            ilk.toHexString(),
        ]);
        return;
    }
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const deltaCollateral = (0, numbers_1.bigIntChangeDecimals)(dink, constants_1.WAD, token.decimals);
    const deltaCollateralUSD = (0, numbers_1.bigIntToBDUseDecimals)(deltaCollateral, token.decimals).times(token.lastPriceUSD);
    graph_ts_1.log.info("[handleVatFrob]tx {} block {}: token.decimals={}, deltaCollateral={}, deltaCollateralUSD={}", [
        tx,
        event.block.number.toString(),
        token.decimals.toString(),
        deltaCollateral.toString(),
        deltaCollateralUSD.toString(),
    ]);
    market.inputTokenPriceUSD = token.lastPriceUSD;
    // change in borrowing amount
    const deltaDebtUSD = (0, numbers_1.bigIntToBDUseDecimals)(dart, constants_1.WAD); //in DAI
    // alternatively, use dai mapping on chain and include stablity fees
    //let vatContract = Vat.bind(Address.fromString(VAT_ADDRESS));
    //let dtab = dart.times(vatContract.ilks(ilk).getRate());
    //deltaDebtUSD = bigIntToBDUseDecimals(dtab, RAD);
    graph_ts_1.log.info("[handleVatFrob]inputTokenBal={}, inputTokenPrice={}, totalBorrowUSD={}", [
        market.inputTokenBalance.toString(),
        market.inputTokenPriceUSD.toString(),
        market.totalBorrowBalanceUSD.toString(),
    ]);
    (0, helpers_1.createTransactions)(event, market, v, w, deltaCollateral, deltaCollateralUSD, dart, deltaDebtUSD);
    (0, helpers_1.updateUsageMetrics)(event, [u, v, w], deltaCollateralUSD, deltaDebtUSD);
    (0, helpers_1.updatePosition)(event, urn, ilk, deltaCollateral, dart);
    (0, helpers_1.updateMarket)(event, market, deltaCollateral, deltaCollateralUSD, deltaDebtUSD);
    (0, helpers_1.updateProtocol)(deltaCollateralUSD, deltaDebtUSD);
    //this needs to after updateProtocol as it uses protocol to do the update
    (0, helpers_1.updateFinancialsSnapshot)(event, deltaCollateralUSD, deltaDebtUSD);
}
exports.handleVatFrob = handleVatFrob;
// function fork( bytes32 ilk, address src, address dst, int256 dink, int256 dart)
// needed for position transfer
function handleVatFork(event) {
    const ilk = event.params.arg1;
    const src = (0, bytes_1.bytes32ToAddress)(event.params.arg2).toHexString();
    const dst = (0, bytes_1.bytes32ToAddress)(event.params.arg3).toHexString();
    // fork( bytes32 ilk, address src, address dst, int256 dink, int256 dart)
    // 4th arg dink: start = 4 (signature) + 3 * 32, end = start + 32
    const dink = (0, bytes_1.bytesToSignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 100, 132)); // change to collateral
    // 5th arg dart: start = 4 (signature) + 4 * 32, end = start + 32
    const dart = (0, bytes_1.bytesToSignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 132, 164)); // change to debt
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const collateralTransferAmount = (0, numbers_1.bigIntChangeDecimals)(dink, constants_1.WAD, token.decimals);
    const debtTransferAmount = dart;
    graph_ts_1.log.info("[handleVatFork]ilk={}, src={}, dst={}, dink={}, dart={}", [
        ilk.toString(),
        src,
        dst,
        collateralTransferAmount.toString(),
        debtTransferAmount.toString(),
    ]);
    if (dink.gt(constants_1.BIGINT_ZERO)) {
        (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.LENDER, null, null, collateralTransferAmount);
    }
    else if (dink.lt(constants_1.BIGINT_ZERO)) {
        (0, helpers_1.transferPosition)(event, ilk, dst, src, constants_1.PositionSide.LENDER, null, null, collateralTransferAmount.times(constants_1.BIGINT_NEG_ONE));
    }
    if (dart.gt(constants_1.BIGINT_ZERO)) {
        (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.BORROWER, null, null, debtTransferAmount);
    }
    else if (dart.lt(constants_1.BIGINT_ZERO)) {
        (0, helpers_1.transferPosition)(event, ilk, dst, src, constants_1.PositionSide.BORROWER, null, null, debtTransferAmount.times(constants_1.BIGINT_NEG_ONE));
    }
}
exports.handleVatFork = handleVatFork;
// update total revenue (stability fee)
function handleVatFold(event) {
    const ilk = event.params.arg1;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const vow = (0, bytes_1.bytes32ToAddress)(event.params.arg2).toHexString();
    const rate = (0, bytes_1.bytesToSignedBigInt)(event.params.arg3);
    const vatContract = Vat_1.Vat.bind(event.address);
    const ilkOnChain = vatContract.ilks(ilk);
    const revenue = ilkOnChain.getArt().times(rate);
    const newTotalRevenueUSD = (0, numbers_1.bigIntToBDUseDecimals)(revenue, constants_1.RAD);
    if (vow.toLowerCase() != constants_1.VOW_ADDRESS.toLowerCase()) {
        graph_ts_1.log.warning("[handleVatFold]Stability fee unexpectedly credited to a non-Vow address {}", [vow]);
    }
    const marketAddress = (0, getters_3.getMarketAddressFromIlk)(ilk);
    if (marketAddress) {
        const marketID = marketAddress.toHexString();
        graph_ts_1.log.info("[handleVatFold]total revenue accrued from Market {}/{} = ${}", [
            ilk.toString(),
            marketID,
            newTotalRevenueUSD.toString(),
        ]);
        (0, helpers_1.updateRevenue)(event, marketID, newTotalRevenueUSD, constants_1.BIGDECIMAL_ZERO, constants_1.ProtocolSideRevenueType.STABILITYFEE);
    }
    else {
        graph_ts_1.log.warning("[handleVatFold]Failed to find marketID for ilk {}/{}; revenue of ${} is ignored.", [ilk.toString(), ilk.toHexString(), newTotalRevenueUSD.toString()]);
    }
}
exports.handleVatFold = handleVatFold;
// old liquidation
function handleCatBite(event) {
    const ilk = event.params.ilk; //market
    const urn = event.params.urn.toHexString(); //liquidatee
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const flip = event.params.flip; //auction contract
    const id = event.params.id; //auction id
    const lot = event.params.ink;
    const art = event.params.art;
    const tab = event.params.tab;
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const collateral = (0, numbers_1.bigIntChangeDecimals)(lot, constants_1.WAD, token.decimals);
    const collateralUSD = (0, numbers_1.bigIntToBDUseDecimals)(collateral, token.decimals).times(token.lastPriceUSD);
    const deltaCollateral = collateral.times(constants_1.BIGINT_NEG_ONE);
    const deltaCollateralUSD = collateralUSD.times(constants_1.BIGDECIMAL_NEG_ONE);
    const deltaDebtUSD = (0, numbers_1.bigIntToBDUseDecimals)(art, constants_1.WAD).times(constants_1.BIGDECIMAL_NEG_ONE);
    // Here we remove all collateral and close positions, even though partial collateral may be returned
    // to the urn, it is no longer "locked", the user would need to call `vat.frob` again to move the collateral
    // from gem to urn (locked); so it is clearer to remove all collateral at initiation of liquidation
    const liquidatedPositionIds = (0, helpers_1.liquidatePosition)(event, urn, ilk, collateral, art);
    (0, helpers_1.updateMarket)(event, market, deltaCollateral, deltaCollateralUSD, deltaDebtUSD);
    (0, helpers_1.updateProtocol)();
    (0, helpers_1.updateFinancialsSnapshot)(event);
    const liquidationRevenueUSD = (0, numbers_1.bigIntToBDUseDecimals)(tab, constants_1.RAD).times(market.liquidationPenalty.div(constants_1.BIGDECIMAL_ONE_HUNDRED));
    (0, helpers_1.updateRevenue)(event, market.id, liquidationRevenueUSD, constants_1.BIGDECIMAL_ZERO, constants_1.ProtocolSideRevenueType.LIQUIDATION);
    const storeID = flip.toHexString().concat("-").concat(id.toString());
    graph_ts_1.log.info("[handleCatBite]storeID={}, ilk={}, urn={}: lot={}, art={}, tab={}, liquidation revenue=${}", [
        storeID,
        ilk.toString(),
        urn,
        lot.toString(),
        art.toString(),
        tab.toString(),
        liquidationRevenueUSD.toString(),
    ]);
    const liquidatee = (0, getters_1.getOwnerAddress)(urn);
    const flipBidsStore = new schema_1._FlipBidsStore(storeID);
    flipBidsStore.round = constants_1.INT_ZERO;
    flipBidsStore.urn = urn;
    flipBidsStore.liquidatee = liquidatee;
    flipBidsStore.lot = lot;
    flipBidsStore.art = art;
    flipBidsStore.tab = tab; // not including liquidation penalty
    flipBidsStore.bid = constants_1.BIGINT_ZERO;
    flipBidsStore.bidder = constants_1.ZERO_ADDRESS;
    flipBidsStore.ilk = ilk.toHexString();
    flipBidsStore.market = market.id;
    flipBidsStore.ended = false;
    flipBidsStore.positions = liquidatedPositionIds;
    flipBidsStore.save();
    // auction
    templates_1.Flip.create(flip);
}
exports.handleCatBite = handleCatBite;
// Update liquidate penalty for the Cat contract
// Works for both Cat V1 and V2
function handleCatFile(event) {
    const ilk = event.params.arg1;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const what = event.params.arg2.toString();
    // 3rd arg: start = 4 + 2 * 32, end = start + 32
    const chop = (0, bytes_1.bytesToUnsignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 68, 100));
    if (what != "chop") {
        return;
    }
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    if (market == null) {
        graph_ts_1.log.warning("[handleFileDog]Failed to get Market for ilk {}/{}", [
            ilk.toString(),
            ilk.toHexString(),
        ]);
        return;
    }
    // CAT V1 chop decimals = RAY
    //     V2 chop decimals = WAD
    const chopDecimals = event.address.equals(graph_ts_1.Address.fromString(constants_1.CAT_V1_ADDRESS))
        ? constants_1.RAY
        : constants_1.WAD;
    const liquidationPenalty = (0, numbers_1.bigIntToBDUseDecimals)(chop, chopDecimals)
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
    if (liquidationPenalty.gt(constants_1.BIGDECIMAL_ZERO)) {
        market.liquidationPenalty = liquidationPenalty;
        market.save();
    }
    graph_ts_1.log.info("[handleCatFile]ilk={}, chop={}, liquidationPenalty={}", [
        ilk.toString(),
        chop.toString(),
        market.liquidationPenalty.toString(),
    ]);
}
exports.handleCatFile = handleCatFile;
// New liquidation
function handleDogBark(event) {
    const ilk = event.params.ilk; //market
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const urn = event.params.urn; //liquidatee
    const clip = event.params.clip; //auction contract
    const id = event.params.id; //auction id
    const lot = event.params.ink;
    const art = event.params.art;
    const due = event.params.due; //including interest, but not penalty
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const collateral = (0, numbers_1.bigIntChangeDecimals)(lot, constants_1.WAD, token.decimals);
    const collateralUSD = (0, numbers_1.bigIntToBDUseDecimals)(collateral, token.decimals).times(token.lastPriceUSD);
    const deltaCollateral = collateral.times(constants_1.BIGINT_NEG_ONE);
    const deltaCollateralUSD = collateralUSD.times(constants_1.BIGDECIMAL_NEG_ONE);
    const deltaDebtUSD = (0, numbers_1.bigIntToBDUseDecimals)(art, constants_1.WAD).times(constants_1.BIGDECIMAL_NEG_ONE);
    // Here we remove all collateral and close positions, even though partial collateral may be returned
    // to the urn, it is no longer "locked", the user would need to call `vat.frob` again to move the collateral
    // from gem to urn (locked); so it is clearer to remove all collateral at initiation of liquidation
    const liquidatedPositionIds = (0, helpers_1.liquidatePosition)(event, urn.toHexString(), ilk, collateral, art);
    (0, helpers_1.updateMarket)(event, market, deltaCollateral, deltaCollateralUSD, deltaDebtUSD);
    (0, helpers_1.updateProtocol)();
    (0, helpers_1.updateFinancialsSnapshot)(event);
    const liquidationRevenueUSD = (0, numbers_1.bigIntToBDUseDecimals)(due, constants_1.RAD).times(market.liquidationPenalty.div(constants_1.BIGDECIMAL_ONE_HUNDRED));
    (0, helpers_1.updateRevenue)(event, market.id, liquidationRevenueUSD, constants_1.BIGDECIMAL_ZERO, constants_1.ProtocolSideRevenueType.LIQUIDATION);
    const storeID = clip.toHexString().concat("-").concat(id.toString());
    graph_ts_1.log.info("[handleDogBark]storeID={}, ilk={}, urn={}: lot={}, art={}, due={}, liquidation revenue=${}", [
        storeID,
        ilk.toString(),
        urn.toHexString(),
        lot.toString(),
        art.toString(),
        due.toString(),
        liquidationRevenueUSD.toString(),
    ]);
    //let debt = bigIntChangeDecimals(due, RAD, WAD);
    const clipTakeStore = new schema_1._ClipTakeStore(storeID);
    clipTakeStore.slice = constants_1.INT_ZERO;
    clipTakeStore.ilk = ilk.toHexString();
    clipTakeStore.market = market.id;
    clipTakeStore.urn = urn.toHexString();
    clipTakeStore.lot = lot;
    clipTakeStore.art = art;
    clipTakeStore.tab = due; //not including penalty
    clipTakeStore.tab0 = due;
    clipTakeStore.positions = liquidatedPositionIds;
    clipTakeStore.save();
    templates_1.Clip.create(clip);
}
exports.handleDogBark = handleDogBark;
// Update liquidate penalty for the Dog contract
function handleDogFile(event) {
    const ilk = event.params.ilk;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const what = event.params.what.toString();
    if (what != "chop") {
        return;
    }
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    if (market == null) {
        graph_ts_1.log.warning("[handleFileDog]Failed to get Market for ilk {}/{}", [
            ilk.toString(),
            ilk.toHexString(),
        ]);
        return;
    }
    const chop = event.params.data;
    const liquidationPenalty = (0, numbers_1.bigIntToBDUseDecimals)(chop, constants_1.WAD)
        .minus(constants_1.BIGDECIMAL_ONE)
        .times(constants_1.BIGDECIMAL_ONE_HUNDRED);
    if (liquidationPenalty.ge(constants_1.BIGDECIMAL_ZERO)) {
        market.liquidationPenalty = liquidationPenalty;
        market.save();
    }
    graph_ts_1.log.info("[handleDogFile]ilk={}, chop={}, liquidationPenalty={}, market.liquidationPenalty={}", [
        ilk.toString(),
        chop.toString(),
        liquidationPenalty.toString(),
        market.liquidationPenalty.toString(),
    ]);
}
exports.handleDogFile = handleDogFile;
// Auction of collateral used by Cat (liquidation)
function handleFlipBids(event) {
    const id = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1); //
    //let lot = bytesToUnsignedBigInt(event.params.arg2); // uint256 lot
    // 3rd arg start = 4 + 2 * 32, end = start+32
    //let bid = bytesToUnsignedBigInt(extractCallData(event.params.data, 68, 100));
    const flipContract = Flip_1.Flip.bind(event.address);
    const ilk = flipContract.ilk();
    const bids = flipContract.bids(id);
    const bid = bids.getBid();
    const lot = bids.getLot();
    const tab = bids.getTab();
    const bidder = bids.getGuy().toHexString();
    const storeID = event.address //flip contract
        .toHexString()
        .concat("-")
        .concat(id.toString());
    const flipBidsStore = schema_1._FlipBidsStore.load(storeID);
    // let liquidateID = liquidateStore.liquidate;
    graph_ts_1.log.info("[handleFlipBids] storeID={}, flip.id={}, ilk={}, round #{} store status: lot={}, tab={}, bid={}, bidder={}", [
        //liquidateID,
        storeID,
        id.toString(),
        ilk.toString(),
        flipBidsStore.round.toString(),
        flipBidsStore.lot.toString(),
        flipBidsStore.tab.toString(),
        flipBidsStore.bid.toString(),
        flipBidsStore.bidder,
    ]);
    graph_ts_1.log.info("[handleFlipBids] storeID={}, flip.id={}, ilk={}, round #{} call inputs: lot={}, tab={}, bid={}, bidder={}", [
        storeID,
        id.toString(),
        ilk.toString(),
        flipBidsStore.round.toString(),
        lot.toString(),
        tab.toString(),
        bid.toString(),
        bidder,
    ]);
    if (flipBidsStore.tab.notEqual(tab)) {
        flipBidsStore.tab = tab; // initial tab does not include liquidation penalty
    }
    if (flipBidsStore.bid.lt(bid)) {
        // save higher bid
        flipBidsStore.bid = bid;
        flipBidsStore.bidder = bidder;
    }
    if (flipBidsStore.lot.gt(lot)) {
        // save lower lot
        flipBidsStore.lot = lot;
        flipBidsStore.bidder = bidder;
    }
    flipBidsStore.round += constants_1.INT_ONE;
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const value = (0, numbers_1.bigIntToBDUseDecimals)(flipBidsStore.lot, token.decimals).times(market.inputTokenPriceUSD);
    graph_ts_1.log.info("[handleFlipBids]storeID={}, flip.id={}, ilk={} round #{} winning bid: lot={}, price={}, value (lot*price)={}, tab={}, bid={}, bidder={}", [
        flipBidsStore.id,
        id.toString(),
        flipBidsStore.ilk,
        flipBidsStore.round.toString(),
        flipBidsStore.lot.toString(),
        market.inputTokenPriceUSD.toString(),
        value.toString(),
        flipBidsStore.tab.toString(),
        flipBidsStore.bid.toString(),
        bidder,
    ]);
    flipBidsStore.save();
}
exports.handleFlipBids = handleFlipBids;
// handle flip.deal and flip.yank
function handleFlipEndAuction(event) {
    const id = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1); //
    const storeID = event.address //flip contract
        .toHexString()
        .concat("-")
        .concat(id.toString());
    const flipBidsStore = schema_1._FlipBidsStore.load(storeID);
    graph_ts_1.log.info("[handleFlipEndAuction]storeID={}, flip.id={} store status: lot={}, tab={}, bid={}, bidder={}", [
        flipBidsStore.id,
        id.toString(),
        flipBidsStore.lot.toString(),
        flipBidsStore.tab.toString(),
        flipBidsStore.bid.toString(),
        flipBidsStore.bidder,
    ]);
    const marketID = flipBidsStore.market;
    const market = (0, getters_3.getOrCreateMarket)(marketID);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const amount = (0, numbers_1.bigIntChangeDecimals)(flipBidsStore.lot, constants_1.WAD, token.decimals);
    const amountUSD = (0, numbers_1.bigIntToBDUseDecimals)(amount, token.decimals).times(token.lastPriceUSD);
    // bid is in DAI, assumed to priced at $1
    const profitUSD = amountUSD.minus((0, numbers_1.bigIntToBDUseDecimals)(flipBidsStore.bid, constants_1.RAD));
    let liquidatee = flipBidsStore.liquidatee;
    // translate possible proxy/urn handler address to owner address
    liquidatee = (0, getters_1.getOwnerAddress)(liquidatee);
    const liquidator = flipBidsStore.bidder;
    const liquidateID = (0, strings_1.createEventID)(event);
    const liquidate = (0, getters_3.getOrCreateLiquidate)(liquidateID, event, market, liquidatee, liquidator, amount, amountUSD, profitUSD);
    //TODO: this should be an array/list including both borrowerPosition and lenderPosition
    liquidate.position = flipBidsStore.positions[0];
    //liquidate._finalized = true;
    liquidate.save();
    graph_ts_1.log.info("[handleFlipEndAuction]storeID={}, flip.id={} final: liquidate.id={}, amount={}, price={}, amountUSD={}, profitUSD={}", [
        flipBidsStore.id,
        id.toString(),
        liquidate.id,
        liquidate.amount.toString(),
        token.lastPriceUSD.toString(),
        liquidate.amountUSD.toString(),
        liquidate.profitUSD.toString(),
    ]);
    if (liquidate.amount.le(constants_1.BIGINT_ZERO) ||
        liquidate.amountUSD.le(constants_1.BIGDECIMAL_ZERO) ||
        liquidate.profitUSD.le(constants_1.BIGDECIMAL_ZERO)) {
        graph_ts_1.log.warning("[handleFlipEndAuction]storeID={}, liquidateID={}, flip.id={} problematic values: amount={}, amountUSD={}, profitUSD={}", [
            liquidateID,
            storeID,
            id.toString(),
            liquidate.amount.toString(),
            liquidate.amountUSD.toString(),
            liquidate.profitUSD.toString(),
        ]);
    }
    flipBidsStore.ended = true;
    flipBidsStore.save();
    (0, helpers_1.updateUsageMetrics)(event, [], constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD, liquidator, liquidatee);
    (0, helpers_1.updateMarket)(event, market, constants_1.BIGINT_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateProtocol)(constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateFinancialsSnapshot)(event, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
}
exports.handleFlipEndAuction = handleFlipEndAuction;
// Auction used by Dog (new liquidation contract)
function handleClipTakeBid(event) {
    const id = event.params.id;
    let liquidatee = event.params.usr.toHexString();
    const max = event.params.max;
    const lot = event.params.lot;
    const price = event.params.price;
    const tab = event.params.tab;
    const owe = event.params.owe;
    const liquidator = event.transaction.from.toHexString();
    // translate possible proxy/urn handler address to owner address
    liquidatee = (0, getters_1.getOwnerAddress)(liquidatee);
    const storeID = event.address //clip contract
        .toHexString()
        .concat("-")
        .concat(id.toString());
    const clipTakeStore = schema_1._ClipTakeStore.load(storeID);
    clipTakeStore.slice += constants_1.INT_ONE;
    const marketID = clipTakeStore.market;
    const market = (0, getters_3.getOrCreateMarket)(marketID);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const value = (0, numbers_1.bigIntToBDUseDecimals)(lot, token.decimals).times(token.lastPriceUSD);
    graph_ts_1.log.info("[handleClipTakeBid]block#={}, storeID={}, clip.id={}, slice #{} event params: max={}, lot={}, price={}, value(lot*price)={}, art={}, tab={}, owe={}, liquidatee={}, liquidator={}", [
        event.block.number.toString(),
        storeID,
        id.toString(),
        clipTakeStore.slice.toString(),
        max.toString(),
        lot.toString(),
        price.toString(),
        value.toString(),
        clipTakeStore.art.toString(),
        tab.toString(),
        owe.toString(),
        liquidatee,
        liquidator,
    ]);
    const deltaLot = clipTakeStore.lot.minus(lot);
    const amount = (0, numbers_1.bigIntChangeDecimals)(deltaLot, constants_1.WAD, token.decimals);
    const amountUSD = (0, numbers_1.bigIntToBDUseDecimals)(amount, token.decimals).times(token.lastPriceUSD);
    const profitUSD = amountUSD.minus((0, numbers_1.bigIntToBDUseDecimals)(owe, constants_1.RAD));
    const liquidateID = (0, strings_1.createEventID)(event);
    const liquidate = (0, getters_3.getOrCreateLiquidate)(liquidateID, event, market, liquidatee, liquidator, amount, amountUSD, profitUSD);
    //TODO: this should be an array/list including both borrowerPosition and lenderPosition
    liquidate.position = clipTakeStore.positions[0];
    liquidate.save();
    if (liquidate.amount.le(constants_1.BIGINT_ZERO) ||
        liquidate.amountUSD.le(constants_1.BIGDECIMAL_ZERO) ||
        liquidate.profitUSD.le(constants_1.BIGDECIMAL_ZERO)) {
        graph_ts_1.log.warning("[handleClipTakeBid]liquidateID={}, storeID={}, clip.id={} slice #{} problematic values: amount={}, amountUSD={}, profitUSD={}", [
            liquidateID,
            storeID,
            id.toString(),
            clipTakeStore.slice.toString(),
            liquidate.amount.toString(),
            liquidate.amountUSD.toString(),
            liquidate.profitUSD.toString(),
        ]);
    }
    clipTakeStore.lot = lot;
    clipTakeStore.tab = tab;
    clipTakeStore.save();
    graph_ts_1.log.info("[handleClipTakeBid]liquidateID={}, storeID={}, clip.id={}, slice #{} final: amount={}, amountUSD={}, profitUSD={}", [
        liquidate.id,
        clipTakeStore.id,
        id.toString(),
        clipTakeStore.slice.toString(),
        liquidate.amount.toString(),
        liquidate.amountUSD.toString(),
        liquidate.profitUSD.toString(),
    ]);
    graph_ts_1.log.info("[handleClipTakeBid]storeID={}, clip.id={} clipTakeStatus: lot={}, tab={}, price={}", [
        storeID,
        id.toString(),
        clipTakeStore.lot.toString(),
        clipTakeStore.tab.toString(),
        token.lastPriceUSD.toString(),
    ]);
    (0, helpers_1.updateUsageMetrics)(event, [], constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD, liquidator, liquidatee);
    (0, helpers_1.updateMarket)(event, market, constants_1.BIGINT_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateProtocol)(constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateFinancialsSnapshot)(event, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
}
exports.handleClipTakeBid = handleClipTakeBid;
// cancel auction
function handleClipYankBid(event) {
    const id = event.params.id;
    const storeID = event.address //clip contract
        .toHexString()
        .concat("-")
        .concat(id.toString());
    const clipTakeStore = schema_1._ClipTakeStore.load(storeID);
    const clipContract = Clip_1.Clip.bind(event.address);
    const ilk = clipContract.ilk();
    const sales = clipContract.sales(id);
    const lot = sales.getLot();
    const tab = sales.getTab();
    let liquidatee = sales.getUsr().toHexString();
    const liquidator = event.transaction.from.toHexString();
    // translate possible proxy/urn handler address to owner address
    liquidatee = (0, getters_1.getOwnerAddress)(liquidatee);
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const liquidateID = (0, strings_1.createEventID)(event);
    // convert collateral to its native amount from WAD
    const amount = (0, numbers_1.bigIntChangeDecimals)(lot, constants_1.WAD, token.decimals);
    const amountUSD = (0, numbers_1.bigIntToBDUseDecimals)(amount, token.decimals).times(token.lastPriceUSD);
    const profitUSD = amountUSD.minus((0, numbers_1.bigIntToBDUseDecimals)(tab, constants_1.RAD));
    const liquidate = (0, getters_3.getOrCreateLiquidate)(liquidateID, event, market, liquidatee, liquidator, amount, amountUSD, profitUSD);
    //TODO: this should be an array/list including both borrowerPosition and lenderPosition
    liquidate.position = clipTakeStore.positions[0];
    liquidate.save();
    graph_ts_1.log.info("[handleClipYankBid]auction for liquidation {} (id {}) cancelled, assuming the msg sender {} won at ${} (profit ${})", [
        liquidateID,
        id.toString(),
        liquidator,
        liquidate.amountUSD.toString(),
        liquidate.profitUSD.toString(),
    ]);
    if (liquidate.amount.le(constants_1.BIGINT_ZERO) ||
        liquidate.amountUSD.le(constants_1.BIGDECIMAL_ZERO) ||
        liquidate.profitUSD.le(constants_1.BIGDECIMAL_ZERO)) {
        graph_ts_1.log.warning("[handleClipTakeBid]problematic values: amount={}, amountUSD={}, profitUSD={}", [
            liquidate.amount.toString(),
            liquidate.amountUSD.toString(),
            liquidate.profitUSD.toString(),
        ]);
    }
    (0, helpers_1.updateUsageMetrics)(event, [], constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD, liquidator, liquidatee);
    (0, helpers_1.updateMarket)(event, market, constants_1.BIGINT_ZERO, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateProtocol)(constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
    (0, helpers_1.updateFinancialsSnapshot)(event, constants_1.BIGDECIMAL_ZERO, constants_1.BIGDECIMAL_ZERO, liquidate.amountUSD);
}
exports.handleClipYankBid = handleClipYankBid;
// Setting mat & par in the Spot contract
function handleSpotFileMat(event) {
    const what = event.params.arg2.toString();
    if (what == "mat") {
        const ilk = event.params.arg1;
        if (ilk.toString() == "TELEPORT-FW-A") {
            graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
            return;
        }
        const market = (0, getters_3.getMarketFromIlk)(ilk);
        if (market == null) {
            graph_ts_1.log.warning("[handleSpotFileMat]Failed to get Market for ilk {}/{}", [
                ilk.toString(),
                ilk.toHexString(),
            ]);
            return;
        }
        // 3rd arg: start = 4 + 2 * 32, end = start + 32
        const mat = (0, bytes_1.bytesToUnsignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 68, 100));
        graph_ts_1.log.info("[handleSpotFileMat]ilk={}, market={}, mat={}", [
            ilk.toString(),
            market.id,
            mat.toString(),
        ]);
        const protocol = (0, getters_3.getOrCreateLendingProtocol)();
        const par = protocol._par;
        market._mat = mat;
        if (mat != constants_1.BIGINT_ZERO) {
            // mat for the SAI market is 0 and can not be used as deonimnator
            market.maximumLTV = constants_1.BIGDECIMAL_ONE_HUNDRED.div((0, numbers_1.bigIntToBDUseDecimals)(mat, constants_1.RAY)).div((0, numbers_1.bigIntToBDUseDecimals)(par, constants_1.RAY));
            market.liquidationThreshold = market.maximumLTV;
        }
        market.save();
    }
}
exports.handleSpotFileMat = handleSpotFileMat;
function handleSpotFilePar(event) {
    const what = event.params.arg1.toString();
    if (what == "par") {
        const par = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg2);
        graph_ts_1.log.info("[handleSpotFilePar]par={}", [par.toString()]);
        const protocol = (0, getters_3.getOrCreateLendingProtocol)();
        protocol._par = par;
        protocol.save();
        for (let i = 0; i <= protocol.marketIDList.length; i++) {
            const market = (0, getters_3.getOrCreateMarket)(protocol.marketIDList[i]);
            const mat = market._mat;
            if (mat != constants_1.BIGINT_ZERO) {
                // mat is 0 for the SAI market
                market.maximumLTV = constants_1.BIGDECIMAL_ONE_HUNDRED.div((0, numbers_1.bigIntToBDUseDecimals)(mat, constants_1.RAY)).div((0, numbers_1.bigIntToBDUseDecimals)(par, constants_1.RAY));
                market.liquidationThreshold = market.maximumLTV;
                market.save();
            }
        }
    }
}
exports.handleSpotFilePar = handleSpotFilePar;
// update token price for ilk market
function handleSpotPoke(event) {
    const ilk = event.params.ilk;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleVatSlip] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    if (market == null) {
        graph_ts_1.log.warning("[handleSpotPoke]Failed to get Market for ilk {}/{}", [
            ilk.toString(),
            ilk.toHexString(),
        ]);
        return;
    }
    const tokenPriceUSD = (0, numbers_1.bigIntToBDUseDecimals)((0, bytes_1.bytesToUnsignedBigInt)(event.params.val), constants_1.WAD);
    market.inputTokenPriceUSD = tokenPriceUSD;
    market.save();
    const tokenID = market.inputToken;
    const token = (0, getters_3.getOrCreateToken)(tokenID);
    token.lastPriceUSD = tokenPriceUSD;
    token.lastPriceBlockNumber = event.block.number;
    token.save();
    (0, helpers_1.updatePriceForMarket)(market.id, event);
    graph_ts_1.log.info("[handleSpotPoke]Price of token {} in market {} is updated to {} from {}", [
        tokenID,
        market.id,
        tokenPriceUSD.toString(),
        token.lastPriceUSD.toString(),
    ]);
}
exports.handleSpotPoke = handleSpotPoke;
function handleJugFileDuty(event) {
    const ilk = event.params.arg1;
    if (ilk.toString() == "TELEPORT-FW-A") {
        graph_ts_1.log.info("[handleJugFileDuty] Skip ilk={} (DAI Teleport: https://github.com/makerdao/dss-teleport)", [ilk.toString()]);
        return;
    }
    const what = event.params.arg2.toString();
    if (what == "duty") {
        const market = (0, getters_3.getMarketFromIlk)(ilk);
        if (market == null) {
            graph_ts_1.log.error("[handleJugFileDuty]Failed to get market for ilk {}/{}", [
                ilk.toString(),
                ilk.toHexString(),
            ]);
            return;
        }
        const jugContract = Jug_1.Jug.bind(event.address);
        const base = jugContract.base();
        const duty = jugContract.ilks(ilk).value0;
        const rate = (0, numbers_1.bigIntToBDUseDecimals)(base.plus(duty), constants_1.RAY).minus(constants_1.BIGDECIMAL_ONE);
        let rateAnnualized = constants_1.BIGDECIMAL_ZERO;
        if (rate.gt(constants_1.BIGDECIMAL_ZERO)) {
            rateAnnualized = (0, numbers_1.bigDecimalExponential)(rate, constants_1.SECONDS_PER_YEAR_BIGDECIMAL).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        }
        graph_ts_1.log.info("[handleJugFileDuty] ilk={}, duty={}, rate={}, rateAnnualized={}", [
            ilk.toString(),
            duty.toString(),
            rate.toString(),
            rateAnnualized.toString(),
        ]);
        const interestRateID = constants_1.InterestRateSide.BORROW + "-" + constants_1.InterestRateType.STABLE + "-" + market.id;
        const interestRate = (0, getters_2.getOrCreateInterestRate)(market.id, constants_1.InterestRateSide.BORROW, constants_1.InterestRateType.STABLE);
        interestRate.rate = rateAnnualized;
        interestRate.save();
        market.rates = [interestRateID];
        market.save();
        (0, helpers_1.snapshotMarket)(event, market);
    }
}
exports.handleJugFileDuty = handleJugFileDuty;
function handlePotFileVow(event) {
    // Add a "Market" entity for Pot
    // It is not an actual market, but the schema expects supply side
    // revenue accrued to a market.
    const what = event.params.arg1.toString();
    if (what == "vow") {
        const market = (0, getters_3.getOrCreateMarket)(event.address.toHexString(), "MCD POT", constants_1.DAI_ADDRESS, event.block.number, event.block.timestamp);
        graph_ts_1.log.info("[handlePotFileVow] Create market {} for Pot Contract; supply side revenue is accrued to this market", [market.id]);
    }
    const potContract = Pot_1.Pot.bind(event.address);
    const chiValue = potContract.chi();
    const rhoValue = potContract.rho();
    const _chiID = event.address.toHexString();
    graph_ts_1.log.info("[handlePotFileVow] Save values for dsr calculation: chi={}, rho={}", [chiValue.toString(), rhoValue.toString()]);
    const _chi = (0, getters_2.getOrCreateChi)(_chiID);
    _chi.chi = chiValue;
    _chi.rho = rhoValue;
    _chi.save();
}
exports.handlePotFileVow = handlePotFileVow;
function handlePotFileDsr(event) {
    const what = event.params.arg1.toString();
    if (what == "dsr") {
        const dsr = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg2);
        // Since DAI saving is not linked to a real market, it is
        // assigned to the artificial "MCD POT" market
        const market = (0, getters_3.getOrCreateMarket)(event.address.toHexString());
        const rate = (0, numbers_1.bigIntToBDUseDecimals)(dsr, constants_1.RAY).minus(constants_1.BIGDECIMAL_ONE);
        let rateAnnualized = constants_1.BIGDECIMAL_ZERO;
        if (rate.gt(constants_1.BIGDECIMAL_ZERO)) {
            rateAnnualized = (0, numbers_1.bigDecimalExponential)(rate, constants_1.SECONDS_PER_YEAR_BIGDECIMAL).times(constants_1.BIGDECIMAL_ONE_HUNDRED);
        }
        const interestRateID = `${constants_1.InterestRateSide.LENDER}-${constants_1.InterestRateType.STABLE}-${event.address.toHexString()}`;
        const interestRate = (0, getters_2.getOrCreateInterestRate)(market.id, constants_1.InterestRateSide.LENDER, constants_1.InterestRateType.STABLE);
        interestRate.rate = rateAnnualized;
        interestRate.save();
        market.rates = [interestRateID];
        market.save();
        (0, helpers_1.snapshotMarket)(event, market);
        graph_ts_1.log.info("[handlePotFileDsr] dsr={}, rate={}, rateAnnualized={}", [
            dsr.toString(),
            rate.toString(),
            rateAnnualized.toString(),
        ]);
    }
}
exports.handlePotFileDsr = handlePotFileDsr;
function handlePotDrip(event) {
    const potContract = Pot_1.Pot.bind(event.address);
    const now = event.block.timestamp;
    const chiValueOnChain = potContract.chi();
    const Pie = potContract.Pie();
    const evtAddress = event.address.toHexString();
    const _chi = (0, getters_2.getOrCreateChi)(evtAddress);
    const chiValuePrev = _chi.chi;
    const chiValueDiff = chiValueOnChain.minus(chiValuePrev);
    const newSupplySideRevenue = (0, numbers_1.bigIntToBDUseDecimals)(Pie, constants_1.WAD).times((0, numbers_1.bigIntToBDUseDecimals)(chiValueDiff, constants_1.RAY));
    // dsr all goes to supply side, so totalrevenue = supplyside revenue in this call
    (0, helpers_1.updateRevenue)(event, evtAddress, newSupplySideRevenue, newSupplySideRevenue);
    graph_ts_1.log.info("[handlePotDrip] Pie={}, prev chi={}, current chi={}, rho={}, deltaSec={}, revenue={}", [
        Pie.toString(),
        chiValuePrev.toString(),
        chiValueOnChain.toString(),
        _chi.rho.toString(),
        now.minus(_chi.rho).toString(),
        newSupplySideRevenue.toString(),
    ]);
    _chi.chi = chiValueOnChain;
    _chi.rho = now;
    _chi.save();
}
exports.handlePotDrip = handlePotDrip;
// Store cdpi, UrnHandler, and owner address
function handleNewCdp(event) {
    const cdpi = event.params.cdp;
    const owner = event.params.own.toHexString().toLowerCase();
    // if owner is a DSProxy, get the EOA owner of the DSProxy
    const ownerEOA = (0, getters_1.getOwnerAddress)(owner);
    const contract = CdpManager_1.CdpManager.bind(event.address);
    const urnhandlerAddress = contract.urns(cdpi).toHexString();
    const ilk = contract.ilks(cdpi);
    const _cdpi = new schema_1._Cdpi(cdpi.toString());
    _cdpi.urn = urnhandlerAddress.toString();
    _cdpi.ilk = ilk.toHexString();
    _cdpi.ownerAddress = ownerEOA;
    _cdpi.save();
    const _urn = new schema_1._Urn(urnhandlerAddress);
    _urn.ownerAddress = ownerEOA;
    _urn.cdpi = cdpi;
    _urn.save();
    graph_ts_1.log.info("[handleNewCdp]cdpi={}, ilk={}, urn={}, owner={}, EOA={}", [
        cdpi.toString(),
        ilk.toString(),
        urnhandlerAddress,
        owner,
        ownerEOA,
    ]);
}
exports.handleNewCdp = handleNewCdp;
// Give a CDP position to a new owner
function handleCdpGive(event) {
    // update mapping between urnhandler and owner
    const cdpi = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1);
    const dstAccountAddress = (0, bytes_1.bytes32ToAddressHexString)(event.params.arg2);
    // if dstAccountAddress is a DSProxy, get the EOA owner of the DSProxy
    const dstAccountOwner = (0, getters_1.getOwnerAddress)(dstAccountAddress);
    const _cdpi = schema_1._Cdpi.load(cdpi.toString());
    const srcUrn = _cdpi.urn;
    const ilk = _cdpi.ilk;
    _cdpi.ownerAddress = dstAccountOwner;
    _cdpi.save();
    const _urn = schema_1._Urn.load(srcUrn);
    const srcAccountAddress = _urn.ownerAddress;
    // since it is a transfer of cdp position, the urn record should already exist
    _urn.ownerAddress = dstAccountOwner;
    _urn.save();
    graph_ts_1.log.info("[handleCdpGive] cdpi {} (ilk={}, urn={}) is given to {} from {}", [
        cdpi.toString(),
        ilk,
        srcUrn,
        dstAccountAddress,
        srcAccountAddress,
    ]);
    const ilkBytes = graph_ts_1.Bytes.fromHexString(ilk);
    (0, helpers_1.transferPosition)(event, ilkBytes, srcUrn, srcUrn, constants_1.PositionSide.LENDER, srcAccountAddress, dstAccountOwner);
    (0, helpers_1.transferPosition)(event, ilkBytes, srcUrn, srcUrn, constants_1.PositionSide.BORROWER, srcAccountAddress, dstAccountOwner);
}
exports.handleCdpGive = handleCdpGive;
// Move a position from cdpSrc urn to the cdpDst urn
// If the two positions are not the same ower, close existing position and open new position
function handleCdpShift(event) {
    const srcCdp = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1);
    const dstCdp = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg2);
    const srcCdpi = schema_1._Cdpi.load(srcCdp.toString());
    const srcIlk = graph_ts_1.Bytes.fromHexString(srcCdpi.ilk);
    const srcUrnAddress = srcCdpi.urn;
    const dstCdpi = schema_1._Cdpi.load(dstCdp.toString());
    // this should be the same as srcIlk
    const dstIlk = graph_ts_1.Bytes.fromHexString(dstCdpi.ilk);
    const dstUrnAddress = dstCdpi.urn;
    graph_ts_1.log.info("[handleCdpShift]cdpi {}/urn {}/ilk {} -> cdpi {}/urn {}/ilk {} at tx {}", [
        srcCdp.toString(),
        srcUrnAddress,
        srcIlk.toString(),
        dstCdp.toString(),
        dstUrnAddress,
        dstIlk.toString(),
        event.transaction.hash.toHexString(),
    ]);
    (0, helpers_1.transferPosition)(event, srcIlk, srcUrnAddress, dstUrnAddress, constants_1.PositionSide.LENDER);
    (0, helpers_1.transferPosition)(event, srcIlk, srcUrnAddress, dstUrnAddress, constants_1.PositionSide.BORROWER);
}
exports.handleCdpShift = handleCdpShift;
// Import a position from src urn to the urn owned by cdp
function handleCdpEnter(event) {
    const src = (0, bytes_1.bytes32ToAddress)(event.params.arg1).toHexString();
    const cdpi = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg2);
    const _cdpi = schema_1._Cdpi.load(cdpi.toString());
    const dst = _cdpi.urn;
    const ilk = graph_ts_1.Bytes.fromHexString(_cdpi.ilk);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.LENDER);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.BORROWER);
}
exports.handleCdpEnter = handleCdpEnter;
// Quit the Cdp system, migrating the cdp (ink, art) to a dst urn
function handleCdpQuit(event) {
    const cdpi = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1);
    const dst = (0, bytes_1.bytes32ToAddress)(event.params.arg2).toHexString();
    const _cdpi = schema_1._Cdpi.load(cdpi.toString());
    const src = _cdpi.urn;
    const ilk = graph_ts_1.Bytes.fromHexString(_cdpi.ilk);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.LENDER);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.BORROWER);
}
exports.handleCdpQuit = handleCdpQuit;
// Transfer cdp collateral from the cdp address to a dst address
function handleCdpFlux(event) {
    const cdpi = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1);
    const dst = (0, bytes_1.bytes32ToAddress)(event.params.arg2).toHexString();
    // 3rd arg: start = 4 + 2 * 32, end = start + 32
    const wad = (0, bytes_1.bytesToUnsignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 68, 100));
    if (wad == constants_1.BIGINT_ZERO) {
        graph_ts_1.log.info("[handleCdpFlux]wad = 0, skip transferring position", []);
        return;
    }
    const _cdpi = schema_1._Cdpi.load(cdpi.toString());
    const src = _cdpi.urn;
    const ilk = graph_ts_1.Bytes.fromHexString(_cdpi.ilk);
    const market = (0, getters_3.getMarketFromIlk)(ilk);
    const token = (0, getters_3.getOrCreateToken)(market.inputToken);
    const transferAmount = (0, numbers_1.bigIntChangeDecimals)(wad, constants_1.WAD, token.decimals);
    graph_ts_1.log.info("[handleCdpFlux]transfer {} collateral from src {} to dst {} for ilk {}", [wad.toString(), src, dst, ilk.toString()]);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.LENDER, null, null, transferAmount);
}
exports.handleCdpFlux = handleCdpFlux;
// Transfer DAI from the cdp address to a dst address
function handleCdpMove(event) {
    const cdpi = (0, bytes_1.bytesToUnsignedBigInt)(event.params.arg1);
    const dst = (0, bytes_1.bytes32ToAddress)(event.params.arg2).toHexString();
    // 3rd arg: start = 4 + 2 * 32, end = start + 32
    const rad = (0, bytes_1.bytesToUnsignedBigInt)((0, bytes_1.extractCallData)(event.params.data, 68, 100));
    if (rad == constants_1.BIGINT_ZERO) {
        graph_ts_1.log.info("[handleCdpMove]wad = 0, skip transferring position", []);
        return;
    }
    const transferAmount = (0, numbers_1.bigIntChangeDecimals)(rad, constants_1.RAD, constants_1.WAD);
    const _cdpi = schema_1._Cdpi.load(cdpi.toString());
    const src = _cdpi.urn;
    const ilk = graph_ts_1.Bytes.fromHexString(_cdpi.ilk);
    graph_ts_1.log.info("[handleCdpMove]transfer {} DAI from src {} to dst {} for ilk {}", [
        transferAmount.toString(),
        src,
        dst,
        ilk.toString(),
    ]);
    (0, helpers_1.transferPosition)(event, ilk, src, dst, constants_1.PositionSide.BORROWER, null, null, transferAmount);
}
exports.handleCdpMove = handleCdpMove;
// Store proxy address and owner address
function handleCreateProxy(event) {
    const proxy = event.params.proxy;
    const owner = event.params.owner;
    const _proxy = new schema_1._Proxy(proxy.toHexString());
    _proxy.ownerAddress = owner.toHexString().toLowerCase();
    _proxy.save();
}
exports.handleCreateProxy = handleCreateProxy;
function handleBuyGem(event) {
    const fee = event.params.fee;
    const feeUSD = (0, numbers_1.bigIntToBDUseDecimals)(fee, constants_1.WAD);
    _handleSwapFee(event, feeUSD);
}
exports.handleBuyGem = handleBuyGem;
function handleSellGem(event) {
    const fee = event.params.fee;
    const feeUSD = (0, numbers_1.bigIntToBDUseDecimals)(fee, constants_1.WAD);
    _handleSwapFee(event, feeUSD);
}
exports.handleSellGem = handleSellGem;
function _handleSwapFee(event, feeUSD) {
    const contract = PSM_1.PSM.bind(event.address);
    const ilk = contract.ilk();
    const marketID = (0, getters_3.getMarketAddressFromIlk)(ilk).toHexString();
    graph_ts_1.log.info("[handleSwapFee]Swap fee revenue {} collected from market {}", [
        feeUSD.toString(),
        marketID,
    ]);
    (0, helpers_1.updateRevenue)(event, marketID, feeUSD, constants_1.BIGDECIMAL_ZERO, constants_1.ProtocolSideRevenueType.PSM);
}
// detect if a frob is a migration transaction,
// if it is, return the address of the caller (owner)
// if it is not, return null
// Ref: https://github.com/makerdao/scd-mcd-migration/blob/96b0e1f54a3b646fa15fd4c895401cf8545fda60/src/ScdMcdMigration.sol#L107
function getMigrationCaller(u, v, w, event) {
    if (!(u == v && u == w && w == v))
        return null;
    const owner = event.transaction.from.toHexString();
    if (u.toLowerCase() == constants_1.MIGRATION_ADDRESS) {
        return owner;
    }
    return null;
}
exports.getMigrationCaller = getMigrationCaller;
