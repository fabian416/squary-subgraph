"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Versions = exports.VersionsClass = void 0;
class VersionsClass {
    getSchemaVersion() {
        return "1.0.0";
    }
    getSubgraphVersion() {
        return "0.0.1";
    }
    getMethodologyVersion() {
        return "0.0.1";
    }
}
exports.VersionsClass = VersionsClass;
exports.Versions = new VersionsClass();
