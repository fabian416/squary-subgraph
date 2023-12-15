"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyLinkToClipboard = void 0;
const material_1 = require("@mui/material");
const ShareOutlined_1 = __importDefault(require("@mui/icons-material/ShareOutlined"));
const react_1 = require("react");
const Link_1 = __importDefault(require("@mui/icons-material/Link"));
const styled_1 = require("../../styled");
const LinkBox = (0, styled_1.styled)(material_1.Box)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;

  > svg {
    opacity: 0.4;
  }

  &:hover {
    > svg {
      opacity: 1;
    }
  }
`;
const CopyLinkToClipboard = ({ link, scrollId, children }) => {
  const newLink = (0, react_1.useMemo)(() => {
    const href = new URL(link);
    const p = new URLSearchParams(href.search);
    if (scrollId) {
      p.set("view", scrollId);
    } else {
      p.delete("view");
    }
    return `${href.origin}${href.pathname}?${p.toString()}`;
  }, [scrollId, link]);
  return (
    <material_1.Tooltip title="Copy link">
      {children ? (
        <LinkBox onClick={() => navigator.clipboard.writeText(newLink)}>
          {children}
          <Link_1.default />
        </LinkBox>
      ) : (
        <material_1.IconButton onClick={() => navigator.clipboard.writeText(newLink)}>
          <ShareOutlined_1.default />
        </material_1.IconButton>
      )}
    </material_1.Tooltip>
  );
};
exports.CopyLinkToClipboard = CopyLinkToClipboard;
