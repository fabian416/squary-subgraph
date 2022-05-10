import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { convertTokenDecimals } from "./ProtocolDashboard";

function checkValueFalsey(value: any, schemaName: string, entityField: string, issues: { message: string, type: string }[]): { message: string, type: string } | undefined {
    if (value === null || value === '0' || value === '') {
        const message = schemaName + "-" + entityField + " is " + value + ". Verify that this value is correct";
        if (issues.filter(x => x.message === message).length === 0) {
            return ({ message, type: "VAL" });
        } else {
            return undefined;
        }
    }
}

function SchemaTable(
    entityData: { [x: string]: any },
    schemaName: string,
    setWarning: React.Dispatch<React.SetStateAction<{ message: string, type: string }[]>>,
    dataFields: { [x: string]: string },
    warning: { message: string, type: string }[]
) {

    const issues: { message: string, type: string }[] = warning;

    if (!entityData) {
        return null;
    }
    let schema = [];
    try {
        schema = Object.keys(entityData).map((entityField: string) => {
            console.log('ENTITY FIELD', entityField)
            if (entityField === '__typename') {
                return null;
            }
            let value = entityData[entityField];
            const issueReturned = checkValueFalsey(value, schemaName, entityField, issues);
            if (issueReturned) {
                issues.push(issueReturned);
            }
            if (typeof (value) === 'boolean') {
                if (value) {
                    value = 'True';
                } else {
                    value = 'False';
                }
            }
            if (!isNaN(parseFloat(value)) && !Array.isArray(value) && (dataFields[entityField].includes('Int') || dataFields[entityField].includes('Decimal') || dataFields[entityField].includes('umber'))) {
                value = parseFloat(value).toFixed(2);
            }
            if (entityField === "outputTokenSupply") {
                value = convertTokenDecimals(value, entityData.outputToken.decimals).toString();
                const issueReturned = checkValueFalsey(value, schemaName, entityField, issues);
                if (issueReturned) {
                    issues.push(issueReturned);
                }
            }
            if (entityField === 'inputTokenBalances') {
                // if array 
                const decimalMapped = entityData[entityField].map((val: string, idx: number) => {
                    const issueReturned = checkValueFalsey(val, schemaName, entityField + ' [' + idx + ']', issues);
                    if (issueReturned) {
                        issues.push(issueReturned);
                    }
                    return convertTokenDecimals(val, entityData.inputTokens[idx].decimals).toString();
                });
                value = '[ ' + decimalMapped.join(", ") + " ]"
            } else if (entityField === 'inputTokenBalance') {
                value = convertTokenDecimals(value, entityData.inputToken.decimals);
                const issueReturned = checkValueFalsey(value, schemaName, entityField, issues);
                if (issueReturned) {
                    issues.push(issueReturned);
                }
            } else if (typeof (value) === 'object' || Array.isArray(value)) {
                console.log(entityField, entityData[entityField], 2)
                value = JSON.stringify(value);
                value = value.split(", ").join(",").split(',').join(', ');
            }

            console.log(entityField, entityData[entityField], typeof (entityData[entityField]), value)
            return (
                <TableRow key={entityField}>
                    <TableCell component="th" scope="row" style={{ minWidth: "30vw" }}>
                        {entityField}: <b>{dataFields[entityField]}</b>
                    </TableCell>
                    <TableCell align="right" style={{ maxWidth: "60vw" }}>
                        {value}
                    </TableCell>
                </TableRow>);
        })
    } catch (err) {
        if (err instanceof Error) {
            console.log('CATCH,', Object.keys(err), Object.values(err), err)
            return <h3>JAVASCRIPT ERROR {err.message}</h3>

        } else {
            return <h3>JAVASCRIPT ERROR</h3>
        }
    }

    if (issues.length > 0) {
        setWarning(issues);
    }

    return (<>
        <h3 style={{ textAlign: "center" }}>{schemaName}:</h3>
        <TableContainer component={Paper} sx={{ justifyContent: "center", display: "flex", alignItems: "center" }}>
            <Table sx={{ maxWidth: 800 }} aria-label="simple table">
                <TableBody>
                    {schema}
                </TableBody>
            </Table>
        </TableContainer></>);
}

export default SchemaTable;