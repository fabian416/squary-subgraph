"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundMath = void 0;
const wadRayMath_1 = __importDefault(require("./wadRayMath"));
class CompoundMath {
    INDEX_ONE() {
        return wadRayMath_1.default.WAD;
    }
    indexMul(x, y) {
        return wadRayMath_1.default.wadMul(x, y);
    }
    indexDiv(x, y) {
        return wadRayMath_1.default.wadDiv(x, y);
    }
}
exports.CompoundMath = CompoundMath;
