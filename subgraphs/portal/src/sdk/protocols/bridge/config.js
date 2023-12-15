"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeConfig = void 0;
class BridgeConfig {
    constructor(id, name, slug, permissionType, versions) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.versions = versions;
        this.permissionType = permissionType;
    }
    getID() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getSlug() {
        return this.slug;
    }
    getVersions() {
        return this.versions;
    }
    getPermissionType() {
        return this.permissionType;
    }
}
exports.BridgeConfig = BridgeConfig;
