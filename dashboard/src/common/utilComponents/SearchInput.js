"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchInput = void 0;
const react_1 = require("react");
const material_1 = require("@mui/material");
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const InputContainer = (0, material_1.styled)("div")`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  background: rgba(22, 24, 29, 1);
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius};

  .${material_1.inputBaseClasses.root} {
    flex-grow: 2;
  }
`;
const SearchInput = ({ onSearch, children, ...rest }) => {
  const ref = (0, react_1.useRef)(null);
  const keyDown = (e) => {
    rest.onKeyDown && rest.onKeyDown(e);
    if (e.key === "Enter") {
      onSearch(ref.current?.value ?? "");
    }
  };
  return (
    <InputContainer>
      <Search_1.default color="action" />
      <material_1.InputBase inputRef={ref} onKeyDown={keyDown} {...rest} />
      <material_1.Button variant="contained" color="primary" onClick={() => onSearch(ref.current?.value ?? "")}>
        {children}
      </material_1.Button>
    </InputContainer>
  );
};
exports.SearchInput = SearchInput;
