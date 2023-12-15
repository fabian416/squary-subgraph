"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styled = void 0;
const material_1 = require("@mui/material");
// @ts-ignore
const styled = (tag, options) => {
  return (0, material_1.styled)(tag, {
    shouldForwardProp: (propName) => {
      const hasPrefix = String(propName).startsWith("$");
      return !hasPrefix;
    },
    ...options,
  });
};
exports.styled = styled;
