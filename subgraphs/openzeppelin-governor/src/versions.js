"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Versions = exports.VersionsClass = void 0;
class VersionsClass {
    getSchemaVersion() {
        return "1.0.0";
    }
    getSubgraphVersion() {
        return "1.0.0";
    }
    getMethodologyVersion() {
        return "1.0.0";
    }
}
exports.VersionsClass = VersionsClass;
exports.Versions = new VersionsClass();
