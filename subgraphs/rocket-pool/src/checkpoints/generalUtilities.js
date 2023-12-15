"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalUtilities = void 0;
const schema_1 = require("../../generated/schema");
const generalConstants_1 = require("../constants/generalConstants");
class GeneralUtilities {
    /**
     * Loads the Rocket Protocol entity.
     */
    getRocketPoolProtocolEntity() {
        return schema_1.RocketPoolProtocol.load(generalConstants_1.ROCKETPOOL_PROTOCOL_ROOT_ID);
    }
    /**
     * Extracts the ID that is commonly used to identify an entity based on the given event.
     */
    extractIdForEntity(event) {
        return event.transaction.hash.toHex() + "-" + event.logIndex.toString();
    }
}
exports.generalUtilities = new GeneralUtilities();
