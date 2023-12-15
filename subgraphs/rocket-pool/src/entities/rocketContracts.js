"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRocketContract = exports.createOrUpdateRocketContract = void 0;
const arrays_1 = require("../utils/arrays");
const schema_1 = require("../../generated/schema");
function createOrUpdateRocketContract(contractName, key, value) {
    let contractEntity = schema_1._RocketContract.load(contractName);
    if (!contractEntity) {
        contractEntity = new schema_1._RocketContract(contractName);
        contractEntity.allAddresses = [];
    }
    contractEntity.keccak256 = key;
    contractEntity.latestAddress = value;
    contractEntity.allAddresses = (0, arrays_1.addToArrayAtIndex)(contractEntity.allAddresses, value);
    contractEntity.save();
    return contractEntity;
}
exports.createOrUpdateRocketContract = createOrUpdateRocketContract;
function getRocketContract(contractName) {
    return schema_1._RocketContract.load(contractName);
}
exports.getRocketContract = getRocketContract;
