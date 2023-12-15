"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveMath = void 0;
const wadRayMath_1 = __importDefault(require("./wadRayMath"));
class AaveMath {
    INDEX_ONE() {
        return wadRayMath_1.default.RAY;
    }
    indexMul(x, y) {
        return wadRayMath_1.default.rayMul(x, y);
    }
    indexDiv(x, y) {
        return wadRayMath_1.default.rayDiv(x, y);
    }
}
exports.AaveMath = AaveMath;
