import { MouseEventHandler, ReactNode, useState } from "react"
import { CKState, Cont, EnvFrame, Frame, RenamingEnv, Value } from "../interpreter/ckstate"
import { Expression, Identifier, PrimitiveOp } from "../interpreter/expression"
import { Box } from "@mui/material";

const stringifyOp = (op: PrimitiveOp) => {
    switch (op) {
        case "add": return "+"
        case "sub": return "-"
        case "mul": return "*"
        case "div": return "/"
        case "mod": return "mod"
        default:
            throw new Error(`Unknown type: ${(op as { kind: "__invalid__" }).kind}`);
    }
}
const Paren: React.FC<{ cond: boolean, children: ReactNode }> = ({ cond, children }) => {
    return <>
        {cond ? "(" : ""}
        {children}
        {cond ? ")" : ""}
    </>
}

interface RedexProp {
    redex?: boolean,
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    children: ReactNode,
}

const Group: React.FC<RedexProp> = ({ redex, children, onClick }) => {
    return <Box
        onClick={onClick}
        sx={{
            display: "inline",
            borderBottom: redex ? "black solid 2pt" : "inherit",
            "&:hover": onClick ? {
                backgroundColor: "lightgray"
            } : {},
        }}>
        {children}
    </Box>;
}

interface EnvProp {
    ident: Identifier,
    val: Value,
    matched?: boolean
}

const EnvVis: React.FC<EnvProp> = ({ ident, val, matched }) => {
    const [expanded, setExpanded] = useState(false);

    const varVis = matched ?
        <Box
            sx={{
                color: "red",
                fontWeight: "bold",
                display: "inline"
            }}>
            {Identifier.stringify(ident)}
        </Box> :
        <>{Identifier.stringify(ident)}</>;

    const valVis = expanded ? <ValueVis val={val} /> : <>…</>

    const toggleExpand = () => { setExpanded(!expanded) }

    return <Group onClick={toggleExpand} redex={matched}>
        [{varVis}={valVis}]
    </Group>
}

interface ClosedVarProp {
    ident: Identifier,
    val: Value
}

const ClosedVarVis: React.FC<ClosedVarProp> = ({ ident, val }) => {
    const [expanded, setExpanded] = useState(false);

    const valVis = expanded ? <ValueVis val={val} /> : <>…</>

    const toggleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setExpanded(!expanded)
    }

    return <Box
        onClick={toggleExpand}
        sx={{
            display: "inline",
            "&:hover": {
                backgroundColor: "lightgray"
            },
            ":has(:hover)": {
                backgroundColor: "inherit"
            }
        }}>
        {Identifier.stringify(ident)}={valVis}
    </Box >
}

const ValueVis: React.FC<{ val: Value }> = ({ val }) => {
    switch (val.kind) {
        case "closure": {
            const len = val.env.size;

            return <>
                【{val.env.reverse()
                    .map((x, idx) => <>
                        <ClosedVarVis ident={x.ident} val={x.val} />
                        {idx < len - 1 ? "," : null}
                    </>)
                }|
                <ExpressionVis expr={val.lambda} context="toplevel" />】
            </>
        }

        case "integer": {
            return <>{val.value}</>
        }
    }
}

interface ExpressionVisProp {
    expr: Expression,
    context: string,
    underEvaluation?: boolean
}

const ExpressionVis: React.FC<ExpressionVisProp> = ({ expr, context, underEvaluation }) => {
    switch (expr.kind) {
        case "variable":
            if (underEvaluation) {
                return <Box sx={{
                    color: "red",
                    fontWeight: "bold",
                    display: "inline"
                }}>
                    <Group redex>
                        {Identifier.stringify(expr.ident)}
                    </Group>
                </Box>
            } else {
                return <>{Identifier.stringify(expr.ident)}</>
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
                <Box sx={{ display: "inline" }}>{vars.map((v) => Identifier.stringify(v.ident)).join(" ")}</Box>
                <Box sx={{ display: "inline", fontWeight: "bold", paddingRight: "0.5em", paddingLeft: "0.5em" }}>→</Box>
                <ExpressionVis expr={body} context={"lambda"} />
            </Paren>
        }

        case "application": {
            return <Paren cond={["appR", "env", "prim"].includes(context)}>
                <ExpressionVis expr={expr.func} context={"appL"} />&nbsp;
                <ExpressionVis expr={expr.arg} context={"appR"} />
            </Paren>
        }

        case "integer": {
            return <>{expr.value}</>
        }

        case "primitive": {
            return <Paren cond={true}>
                <ExpressionVis expr={expr.args.first()!} context={"primitive"} />
                &nbsp;{stringifyOp(expr.op)}&nbsp;
                <ExpressionVis expr={expr.args.last()!} context={"primitive"} />
            </Paren>
        }

        default:
            throw new Error(`Unknown type: ${(expr as { kind: "__invalid__" }).kind}`);
    }
    return null;
}

type ChildKind = "variable" | "application" | "lambda" | "env" | "closure" | "integer" | "primitive"

interface ContVisProp {
    cont: Cont,
    childKind: ChildKind,
    varopt: string | null,
    children: ReactNode,
    redex?: boolean
}

const ContVis: React.FC<ContVisProp> = ({ cont, childKind, children, varopt, redex }) => {
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
                <Group redex={redex}>
                    <ValueVis val={frame.closure} />
                    {children}
                </Group>
            </ContVis >

        case "env": {
            /* Take all sequential envs */
            const envs: ReactNode[] = [];
            let rest: Cont = cont;
            let v = varopt;
            while (!rest.isEmpty() && rest.first()!.kind === "env") {
                const env = rest.first() as EnvFrame;
                if (Identifier.stringify(env.ident) === v) {
                    envs.push(<EnvVis ident={env.ident} val={env.val} matched />)
                    v = null;
                } else {
                    envs.push(<EnvVis ident={env.ident} val={env.val} />)
                }
                rest = rest.rest();
            }

            return <ContVis
                cont={rest}
                childKind={"env"}
                varopt={v}
            >
                {envs.slice(1).reverse()}
                <Group redex={redex}>
                    {envs[0]}
                    <Paren cond={childKind === "application"}>
                        {children}
                    </Paren>
                </Group>
            </ContVis>;
        }

        case "prim": {
            let x;

            if (frame.done.isEmpty()) {
                x = <>
                    {children}
                    &nbsp;{stringifyOp(frame.op)}&nbsp;
                    <ExpressionVis expr={frame.rest.first()!} context={"primitive"} />
                </>
            } else {
                x = <>
                    <ValueVis val={frame.done.first()!} />
                    &nbsp;{stringifyOp(frame.op)}&nbsp;
                    {children}
                </>
            }

            return <ContVis
                cont={cont.rest()}
                childKind={"primitive"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        {x}
                    </Paren>
                </Group>
            </ContVis>
        }
    }
}

interface CKStateVisProp {
    state: CKState
}

export const CKStateVis: React.FC<CKStateVisProp> = ({ state }) => {
    switch (state.kind) {
        case "eval": {
            const varopt = (state.expr.kind === "variable") ? Identifier.stringify(state.expr.ident) : null;

            return <Box sx={{ lineBreak: "anywhere" }}>
                <ContVis
                    cont={state.cont}
                    childKind={state.expr.kind}
                    varopt={varopt}
                >
                    <Box sx={{
                        backgroundColor: "yellow",
                        display: "inline"
                    }}>
                        <ExpressionVis underEvaluation
                            expr={state.expr}
                            context={state.cont.first()?.kind ?? "toplevel"}
                        />
                    </Box>
                </ContVis>
            </Box>
        }

        case "applyCont":
            return <Box sx={{ lineBreak: "anywhere" }}>
                <ContVis
                    cont={state.cont}
                    childKind={state.val.kind}
                    varopt={null}
                    redex
                >
                    <Box sx={{
                        backgroundColor: "cyan",
                        display: "inline"
                    }}>
                        <ValueVis val={state.val} />
                    </Box>
                </ContVis>
            </Box>
    }
}

export const RenamingEnvVis: React.FC<{ renv: RenamingEnv }> = ({ renv }) => {
    return <Box>
        {renv.map((x) => <>
            {Identifier.stringify(x.from)}→{Identifier.stringify(x.to)},
        </>)
        }
    </Box>
}
