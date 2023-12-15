"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNew = void 0;
const token_1 = require("../helpers/token");
const protocol_1 = require("../helpers/protocol");
function handleNew(event) {
  const data = event.data;
  const controller = (0, protocol_1.getOrCreateProtocol)();
  const eventArgsArr = data.get("config");
  if (!eventArgsArr) return;
  const eventArgs = eventArgsArr.toObject();
  /* -------------------------------------------------------------------------- */
  /*                                   Oracle                                   */
  /* -------------------------------------------------------------------------- */
  const oracle = eventArgs.get("oracle_account_id");
  if (!oracle) return;
  /* -------------------------------------------------------------------------- */
  /*                                    Owner                                   */
  /* -------------------------------------------------------------------------- */
  const owner = eventArgs.get("owner_id");
  if (!owner) return;
  /* -------------------------------------------------------------------------- */
  /*                                  _booster                                  */
  /* -------------------------------------------------------------------------- */
  const booster = eventArgs.get("booster_token_id");
  if (!booster) return;
  const booster_decimals = eventArgs.get("booster_decimals");
  if (!booster_decimals) return;
  const multiplier = eventArgs.get(
    "x_booster_multiplier_at_maximum_staking_duration"
  );
  if (!multiplier) return;
  /* -------------------------------------------------------------------------- */
  /*                                  max assets                                */
  /* -------------------------------------------------------------------------- */
  const max_num_assets = eventArgs.get("max_num_assets");
  if (!max_num_assets) return;
  controller._oracle = oracle.toString();
  controller._owner = owner.toString();
  const boosterToken = (0, token_1.getOrCreateToken)(booster.toString());
  controller._booster = boosterToken.id;
  boosterToken.decimals = booster_decimals.toI64();
  controller._boosterMultiplier = multiplier.toBigInt();
  controller._maxAssets = max_num_assets.data;
  controller.save();
}
exports.handleNew = handleNew;
