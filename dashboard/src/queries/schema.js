"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolOverview = exports.schema = exports.metaDataQuery = void 0;
const constants_1 = require("../constants");
const schema_1 = require("./dex/schema");
const schema_2 = require("./yield/schema");
const schema_3 = require("./lending/schema");
const schema_4 = require("./bridge/schema");
const schema_5 = require("./perpetual/schema");
const schema_6 = require("./options/schema");
const schema_7 = require("./generic/schema");
const poolOverview_1 = require("./dex/poolOverview");
const poolOverview_2 = require("./yield/poolOverview");
const poolOverview_3 = require("./lending/poolOverview");
const poolOverview_4 = require("./bridge/poolOverview");
const poolOverview_5 = require("./perpetual/poolOverview");
const poolOverview_6 = require("./options/poolOverview");
const poolOverview_7 = require("./generic/poolOverview");
const client_1 = require("@apollo/client");
exports.metaDataQuery = (0, client_1.gql)`
  {
    protocols {
      type
      schemaVersion
      subgraphVersion
      methodologyVersion
      name
      slug
      id
      network
    }
    _meta {
      deployment
    }
  }
`;
const schema = (type, version) => {
  switch (type) {
    case constants_1.ProtocolType.EXCHANGE:
      return (0, schema_1.schema)(version);
    case constants_1.ProtocolType.YIELD:
      return (0, schema_2.schema)(version);
    case constants_1.ProtocolType.LENDING:
      return (0, schema_3.schema)(version);
    case constants_1.ProtocolType.BRIDGE:
      return (0, schema_4.schema)(version);
    case constants_1.ProtocolType.PERPETUAL:
      return (0, schema_5.schema)(version);
    case constants_1.ProtocolType.OPTION:
      return (0, schema_6.schema)(version);
    case constants_1.ProtocolType.GENERIC:
      return (0, schema_7.schema)(version);
    default:
      return (0, schema_7.schema)(version);
  }
};
exports.schema = schema;
const poolOverview = (type, version) => {
  switch (type) {
    case constants_1.ProtocolType.EXCHANGE:
      return (0, poolOverview_1.schema)(version);
    case constants_1.ProtocolType.YIELD:
      return (0, poolOverview_2.schema)(version);
    case constants_1.ProtocolType.LENDING:
      return (0, poolOverview_3.schema)(version);
    case constants_1.ProtocolType.BRIDGE:
      return (0, poolOverview_4.schema)(version);
    case constants_1.ProtocolType.PERPETUAL:
      return (0, poolOverview_5.schema)(version);
    case constants_1.ProtocolType.OPTION:
      return (0, poolOverview_6.schema)(version);
    case constants_1.ProtocolType.GENERIC:
      return (0, poolOverview_7.schema)(version);
    default:
      return (0, poolOverview_7.schema)(version);
  }
};
exports.poolOverview = poolOverview;
