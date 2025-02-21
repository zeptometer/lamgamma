import { ReactNode, useState } from "react"
import { CKState, Cont, EnvFrame, Frame, Value } from "../interpreter/ckstate"
import { Expression, Variable } from "../interpreter/expression"
import { Box } from "@mui/material";

const Paren: React.FC<{ cond: boolean, children: ReactNode }> = ({ cond, children }) => {
    return <>
        {cond ? "(" : ""}
        {children}
        {cond ? ")" : ""}
    </>
}

interface EnvProp {
    var: Variable,
    val: Value,
    matched?: boolean
}

const EnvVis: React.FC<EnvProp> = ({ var: v, val, matched }) => {
    const [expanded, setExpanded] = useState(false);

    const varVis = matched ?
        <Box
            sx={{
                color: "red",
                fontWeight: "bold",
                display: "inline"
            }}>
            {v.name}
        </Box> :
        <>{v.name}</>;

    const valVis = expanded ? <ValueVis val={val} /> : <>…</>

    const toggleExpand = () => { setExpanded(!expanded) }

    return <Box
        onClick={toggleExpand}
        sx={{
            display: "inline",
            "&:hover": {
                backgroundColor: "lightgray"
            }
        }}>
        [{varVis}={valVis}]
    </Box >
}

interface ClosedVarProp {
    var: Variable,
    val: Value
}

const ClosedVarVis: React.FC<ClosedVarProp> = ({ var: v, val }) => {
    const [expanded, setExpanded] = useState(false);

    const valVis = expanded ? <>=<ValueVis val={val} /></> : <></>

    const toggleExpand = () => { setExpanded(!expanded) }

    return <Box
        onClick={toggleExpand}
        sx={{
            display: "inline",
            "&:hover": {
                backgroundColor: "lightgray"
            }
        }}>
        {v.name}{valVis}
    </Box >
}

const ValueVis: React.FC<{ val: Value }> = ({ val }) => {
    const len = val.env.size;

    return <>
        【{val.env.reverse()
            .map((x, idx) => <>
                <ClosedVarVis var={x.var} val={x.val} />
                {idx < len - 1 ? "," : null}
            </>)
        }|
        <ExpressionVis expr={val.lambda} context="toplevel" />】
    </>
}

const ExpressionVis: React.FC<{ expr: Expression, context: string }> = ({ expr, context }) => {
    switch (expr.kind) {
        case "variable":
            if (context === "toplevel") {
                return <Box sx={{
                    color: "red",
                    fontWeight: "bold",
                    display: "inline"
                }}>
                    {expr.name}
                </Box>
            } else {
                return <>{expr.name}</>
            }

        case "lambda": {
            const vars = [];
            let body: Expression = expr;
            while (body.kind === "lambda") {
                vars.push(body.param);
                body = body.body;
            }

            return <Paren cond={context !== "toplevel"}>
                <Box sx={{ display: "inline", fontWeight: "bold", paddingRight: "0.5em" }}>fn</Box>
                <Box sx={{ display: "inline" }}>{vars.map((v) => v.name).join(" ")}</Box>
                <Box sx={{ display: "inline", fontWeight: "bold", paddingRight: "0.5em", paddingLeft: "0.5em" }}>→</Box>
                <ExpressionVis expr={body} context={"lambda"} />
            </Paren>
        }

        case "application": {
            return <Paren cond={context === "appR" || context === "env"}>
                <ExpressionVis expr={expr.func} context={"appL"} />&nbsp;
                <ExpressionVis expr={expr.arg} context={"appR"} />
            </Paren>

        }

    }
    return null;
}

type ChildKind = "variable" | "application" | "lambda" | "env" | "closure"

interface ContVisProp {
    cont: Cont,
    childKind: ChildKind,
    varopt: string | null,
    children: ReactNode
}

const ContVis: React.FC<ContVisProp> = ({ cont, childKind, children, varopt }) => {
    if (cont.isEmpty()) {
        return children
    }

    const frame = cont.first() as Frame;
    switch (frame.kind) {
        case "appL":
            return <ContVis
                cont={cont.rest()}
                childKind={"application"}
                varopt={varopt}>
                {children} <ExpressionVis expr={frame.arg} context={"appR"} />
            </ContVis>

        case "appR":
            return <ContVis
                cont={cont.rest()}
                childKind={"application"}
                varopt={varopt}
            >
                <ValueVis val={frame.closure} />
                {children}
            </ContVis>

        case "env": {
            /* Take all sequential envs */
            const envs: ReactNode[] = [];
            let rest: Cont = cont;
            let v = varopt;
            while (!rest.isEmpty() && rest.first()!.kind === "env") {
                const env = rest.first() as EnvFrame;
                if (env.var.name === v) {
                    envs.push(<EnvVis var={env.var} val={env.val} matched />)
                    v = null;
                } else {
                    envs.push(<EnvVis var={env.var} val={env.val} />)
                }
                rest = rest.rest();
            }

            return <ContVis
                cont={rest}
                childKind={"env"}
                varopt={v}
            >
                {envs.reverse()}
                <Paren cond={childKind === "application"}>
                    {children}
                </Paren>
            </ContVis>;
        }
    }
}

interface CKStateVisProp {
    state: CKState
}

export const CKStateVis: React.FC<CKStateVisProp> = ({ state }) => {
    switch (state.kind) {
        case "eval": {
            const varopt = (state.expr.kind === "variable") ? state.expr.name : null;

            return <ContVis
                cont={state.cont}
                childKind={state.expr.kind}
                varopt={varopt}
            >
                <Box sx={{
                    backgroundColor: "yellow",
                    display: "inline"
                }}>
                    <ExpressionVis
                        expr={state.expr}
                        context={state.cont.first()?.kind ?? "toplevel"}
                    />
                </Box>
            </ContVis>
        }

        case "applyCont":
            return <ContVis cont={state.cont} childKind={state.val.kind} varopt={null}>
                <Box sx={{
                    backgroundColor: "cyan",
                    display: "inline"
                }}>
                    <ValueVis val={state.val} />
                </Box>
            </ContVis>
    }
}