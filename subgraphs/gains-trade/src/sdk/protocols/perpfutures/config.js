"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerpetualConfig = void 0;
class PerpetualConfig {
    constructor(id, name, slug, versions) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.versions = versions;
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
}
exports.PerpetualConfig = PerpetualConfig;
