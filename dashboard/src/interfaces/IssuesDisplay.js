"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesDisplay = void 0;
const styled_1 = require("../styled");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_2 = require("react");
const constants_1 = require("../constants");
const IssuesContainer = (0, styled_1.styled)("div")`
  max-height: 230px;
  overflow-y: scroll;
  background-color: rgb(28, 28, 28);
  border: 2px solid
    ${({ theme, $hasCritical }) => ($hasCritical ? theme.palette.error.main : theme.palette.warning.main)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  & > * {
    padding: ${({ theme }) => theme.spacing(2)};
  }

  & > :nth-of-type(odd):not(:first-of-type) {
    background: rgba(0, 0, 0, 0.5);
  }
`;
const messagesByLevel = (issuesArray) => {
  const issuesMsgs = [];
  if (issuesArray.length > 0) {
    for (let x = 0; x < issuesArray.length; x++) {
      let issuesMsg = (issuesArray[x].fieldName ? issuesArray[x].fieldName + ": " : "") + issuesArray[x].message;
      if (issuesArray[x].type === "SUM") {
        let factors = "";
        if (issuesArray[x].message) {
          factors = "This field is derived from the following factors: " + issuesArray[x].message + ". ";
        }
        issuesMsg = `All values in ${issuesArray[x].fieldName} are 0 (or null). ${factors}Verify that this data is being mapped correctly.`;
      }
      if (
        issuesArray[x].type === "CUMULATIVE" &&
        !constants_1.nonStrictlyIncrementalFieldList?.includes(issuesArray[x].fieldName)
      ) {
        issuesMsg = `
          ${issuesArray[x].fieldName} cumulative value dropped on snapshot id ${issuesArray[x].message}. Cumulative values should always increase.`;
      }
      if (issuesArray[x].type === "TOTAL_REV") {
        const msgObj = JSON.parse(issuesArray[x].message);
        issuesMsg = `
          ${issuesArray[x].fieldName} sum value (${msgObj.totalRevenue}) diverged from protocol + supply revenue (${msgObj.sumRevenue}) by ${msgObj.divergence}% starting from snapshot id ${msgObj.timeSeriesInstanceId}.`;
      }
      if (issuesArray[x].type === "TOTAL_TX") {
        const msgObj = JSON.parse(issuesArray[x].message);
        issuesMsg = `
          ${issuesArray[x].fieldName} sum value (${msgObj.totalTx}) diverged from sum of individual transactions (${msgObj.individualTxSum}) by ${msgObj.divergence}% starting from snapshot id ${msgObj.timeSeriesInstanceId}.`;
      }
      if (issuesArray[x].type === "TVL-") {
        issuesMsg = `${issuesArray[x].fieldName} is below 1000.`;
      }
      if (issuesArray[x].type === "TVL+") {
        issuesMsg = `${issuesArray[x].fieldName} is above 1,000,000,000,000.`;
      }
      if (issuesArray[x].type === "DEC") {
        issuesMsg = `Decimals on ${issuesArray[x].fieldName} could not be pulled. The default decimal value of 18 has been applied.`;
      }
      if (issuesArray[x].type === "JS") {
        issuesMsg = `JavaScript Error thrown processing the data for ${issuesArray[x].fieldName}: ${issuesArray[x].message}. Verify that the data is in the expected form. If the data is correct and this error persists, leave a message in the 'Validation-Dashboard' Discord channel.`;
      }
      if (issuesArray[x].type === "VAL") {
        issuesMsg = issuesArray[x].message;
      }
      if (issuesArray[x].type === "TOK") {
        let endStr = `has elements up to index [${issuesArray[x]?.message?.split("///")[1]}]`;
        if (issuesArray[x]?.message?.split("///")[1] === "-1") {
          endStr = `is empty`;
        }
        issuesMsg = `${issuesArray[x].fieldName?.split("///")[0]} array has elements up to index [${
          issuesArray[x].fieldName?.split("///")[1]
        }], but ${issuesArray[x]?.message?.split("///")[0]} array ${endStr}.`;
      }
      if (issuesArray[x].type === "NEG" && !constants_1.negativeFieldList?.includes(issuesArray[x].fieldName)) {
        const msgObj = JSON.parse(issuesArray[x].message);
        issuesMsg = `'${issuesArray[x].fieldName}' has ${msgObj.count} negative values. First instance of a negative value is on snapshot ${msgObj.firstSnapshot} with a value of ${msgObj.value}`;
      }
      if (issuesArray[x].type === "NAN") {
        issuesMsg = `'${issuesArray[x].fieldName}' is NaN.`;
      }
      if (issuesArray[x].type === "RATENEG" && !constants_1.negativeFieldList?.includes(issuesArray[x].fieldName)) {
        issuesMsg = `'${issuesArray[x].fieldName}' has a negative rate.`;
      }
      if (issuesArray[x].type === "RATEZERO") {
        issuesMsg = `'${issuesArray[x].fieldName}' has a zero rate.`;
      }
      if (issuesArray[x].type === "RATEDEC") {
        issuesMsg = `'${issuesArray[x].fieldName}' has a rate between 0% and ${issuesArray[x].message}. Check that the decimals on this value are correct.`;
      }
      if (issuesArray[x].type === "EMPTY") {
        issuesMsg = `Entity ${issuesArray[x].fieldName} has no instances. This could mean that the pool was created but no transactions were detected on it.`;
      }
      if (issuesArray[x].type === "BORROW") {
        issuesMsg = `Entity ${issuesArray[x].fieldName} could not calculate BORROW Reward APR. The Pool Borrow Balance is not available.`;
      }
      if (issuesArray[x].type === "QRY") {
        const params = issuesArray[x].message.split("//").join(", ");
        issuesMsg = `Error fetching subgraph data - Could not load protocol from query parameters ${params}`;
      }
      issuesMsgs.push(<li key={`${x}-${issuesArray[x].fieldName}`}>{issuesMsg}</li>);
    }
  }
  return issuesMsgs;
};
// The issues display function takes the issues object passed in and creates the elements/messages to be rendered
const IssuesDisplay = ({ issuesArrayProps, allLoaded, oneLoaded }) => {
  const [issuesArray, setIssuesArray] = (0, react_2.useState)([]);
  (0, react_1.useEffect)(() => {
    setIssuesArray(issuesArrayProps);
  }, [issuesArrayProps]);
  let waitingElement = (
    <>
      <material_1.Typography variant="h6">WAITING TO SCAN DATA FOR ISSUES...</material_1.Typography>
      <material_1.CircularProgress sx={{ margin: 6 }} size={50} />
    </>
  );
  if (!oneLoaded && !allLoaded && issuesArray.length === 0) {
    return <IssuesContainer $hasCritical={false}>{waitingElement}</IssuesContainer>;
  }
  const criticalIssues = issuesArray.filter((iss) => iss.level === "critical");
  const errorIssues = issuesArray.filter((iss) => iss.level === "error");
  const warningIssues = issuesArray.filter((iss) => iss.level === "warning");
  const criticalMsgs = messagesByLevel(criticalIssues);
  const errorMsgs = messagesByLevel(errorIssues);
  const warningMsgs = messagesByLevel(warningIssues);
  const issuesDisplayCount = criticalMsgs.length + errorMsgs.length + warningMsgs.length;
  const hasCritical = criticalMsgs.length > 0;
  let criticalElement = null;
  if (hasCritical) {
    criticalElement = (
      <div>
        <material_1.Typography variant="h6">Critical:</material_1.Typography>
        <ol>
          <material_1.Typography variant="body1">{criticalMsgs}</material_1.Typography>
        </ol>
      </div>
    );
  }
  let errorElement = null;
  if (errorMsgs.length > 0) {
    errorElement = (
      <div>
        <material_1.Typography variant="h6">Error:</material_1.Typography>
        <ol>
          <material_1.Typography variant="body1">{errorMsgs}</material_1.Typography>
        </ol>
      </div>
    );
  }
  let warningElement = null;
  if (warningMsgs.length > 0) {
    warningElement = (
      <div>
        <material_1.Typography variant="h6">Warning:</material_1.Typography>
        <ol>
          <material_1.Typography variant="body1">{warningMsgs}</material_1.Typography>
        </ol>
      </div>
    );
  }
  if (allLoaded) {
    waitingElement = null;
  }
  if (issuesDisplayCount > 0) {
    return (
      <IssuesContainer $hasCritical={hasCritical}>
        <material_1.Typography variant="h6">DISPLAYING {issuesDisplayCount} ISSUES.</material_1.Typography>
        {criticalElement}
        {errorElement}
        {warningElement}
        {waitingElement}
      </IssuesContainer>
    );
  } else {
    return null;
  }
};
exports.IssuesDisplay = IssuesDisplay;
exports.default = exports.IssuesDisplay;
