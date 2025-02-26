import { MouseEventHandler, ReactNode, useState } from "react"
import { CKState, Cont, EnvRF, RuntimeFrame, RenamingEnv, Value } from "../interpreter/ckstate"
import { Expression, Identifier, PrimitiveOp, ShortCircuitOp, UniOp } from "../interpreter/expression"
import { Box } from "@mui/material";
import { unreachable } from "../common/assertNever";
import { List } from "immutable";
import { Code } from "@mui/icons-material";

const stringifyOp = (op: PrimitiveOp | ShortCircuitOp) => {
    switch (op) {
        case "add": return "+"
        case "sub": return "-"
        case "mul": return "*"
        case "div": return "/"
        case "mod": return "mod"
        case "neg": return "!"
        case "and": return "&&"
        case "or": return "||"
        case "eq": return "=="
        case "ne": return "!="
        case "lt": return "<"
        case "le": return "<="
        case "gt": return ">"
        case "ge": return ">="
        default:
            throw new Error(`Unknown type: ${(op as { kind: "__invalid__" }).kind}`);
    }
}
const Paren: React.FC<{ cond?: boolean, children: ReactNode }> = ({ cond, children }) => {
    let show = true;
    if (cond !== undefined) {
        show = cond;
    }

    return <>
        {show ? "(" : ""}
        {children}
        {show ? ")" : ""}
    </>
}

interface RedexProp {
    redex?: boolean,
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    children: ReactNode,
}

const Group: React.FC<RedexProp> = ({ redex, children }) => {
    if (redex) {
        return <Box
            sx={{
                display: "inline",
                borderBottom: "black solid 2pt",
            }}>
            {children}
        </Box>;
    } else {
        return children
    }
}

interface IdentVisProp {
    ident: Identifier,
    matched?: boolean
}

const IdentVis: React.FC<IdentVisProp> = ({ ident, matched }) => {
    let identVis;
    switch (ident.kind) {
        case "raw":
            identVis = <>{ident.name}</>;
            break;
        case "generated":
            identVis = <>_<sub>{ident.id}</sub></>;
            break;
        case "colored":
            identVis = <>{ident.basename}<sub>{ident.id}</sub></>;
            break;
        default:
            throw new Error(`Unknown type: ${(ident as { kind: "__invalid__" }).kind}`);
    }

    if (matched) {
        return <Box
            sx={{
                color: "red",
                fontWeight: "bold",
                display: "inline"
            }}>
            {identVis}
        </Box>;
    } else {
        return identVis
    }
}

interface TokenProp {
    children: ReactNode,
    leftSpacing?: boolean,
    rightSpacing?: boolean
}

const Token: React.FC<TokenProp> = ({ children, leftSpacing, rightSpacing }) => {
    return <Box sx={{
        display: "inline",
        fontWeight: "bold",
        marginLeft: leftSpacing ? "0.5em" : "0",
        marginRight: rightSpacing ? "0.5em" : "0"
    }}>
        {children}
    </Box>
}

const RuntimeLevel: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <Box sx={{
        display: "inline",
        fontFamily: "MonaSpace Neon"
    }}>
        {children}
    </Box>
}

const CodeLevel: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <Box sx={{
        display: "inline",
        fontFamily: "MonaSpace Radon"
    }}>
        {children}
    </Box>
}

/** Visualizer for syntactic constructs */
interface VarVisProp {
    ident: Identifier,
    lookup?: boolean
}

const VarVis: React.FC<VarVisProp> = ({ ident, lookup }) => {
    if (lookup) {
        return <Box sx={{
            color: "red",
            fontWeight: "bold",
            display: "inline"
        }}>
            <Group redex>
                <IdentVis ident={ident} />
            </Group>
        </Box>
    } else {
        return <IdentVis ident={ident} />
    }
}

interface LambdaVisProp {
    params: List<Identifier>,
    bodyVis: ReactNode,
    lookfor?: Identifier | null
}

const LambdaVis: React.FC<LambdaVisProp> = ({ params, bodyVis, lookfor }) => {
    const paramsVis = params.map((param) => {
        return <IdentVis
            ident={param}
            matched={!!lookfor && Identifier.eq(param, lookfor)} />;
    }).reduce((acc, curr) => <>{curr}&nbsp;{acc}</>);

    return <>
        <Token rightSpacing>fn</Token>
        {paramsVis}
        <Token leftSpacing rightSpacing>→</Token>
        {bodyVis}
    </>;
}

interface AppVisProp {
    funcVis: ReactNode,
    argVis: ReactNode
}

const AppVis: React.FC<AppVisProp> = ({ funcVis, argVis }) => {
    return <>
        {funcVis}&nbsp;{argVis}
    </>;
}

interface FixVisProp {
    param: Identifier,
    bodyVis: ReactNode,
    lookfor?: Identifier | null,
}

const FixVis: React.FC<FixVisProp> = ({ param, bodyVis, lookfor }) => {
    return <>
        <Token rightSpacing>fix</Token>
        <IdentVis ident={param} matched={!!lookfor && Identifier.eq(param, lookfor)} />
        <Token leftSpacing rightSpacing>→</Token>
        {bodyVis}
    </>;
}

interface UniOpVisProp {
    op: UniOp,
    argVis: ReactNode
}

const UniOpVis: React.FC<UniOpVisProp> = ({ op, argVis }) => {
    return <>
        {stringifyOp(op)} {argVis}
    </>
}

interface BinOpVisProp {
    op: PrimitiveOp | ShortCircuitOp,
    leftVis: ReactNode,
    rightVis: ReactNode
}

const BinOpVis: React.FC<BinOpVisProp> = ({ op, leftVis, rightVis }) => {
    return <>
        {leftVis} {stringifyOp(op)} {rightVis}
    </>
}

interface IfVisProp {
    condVis: ReactNode,
    thenVis: ReactNode,
    elseVis: ReactNode
}

const IfVis: React.FC<IfVisProp> = ({ condVis, thenVis, elseVis }) => {
    return <>
        <Token rightSpacing>if</Token>
        {condVis}
        <Token leftSpacing rightSpacing>then</Token>
        {thenVis}
        <Token leftSpacing rightSpacing>else</Token>
        {elseVis}
    </>
}

interface QuoteVisProp {
    exprVis: ReactNode
}

const QuoteVis: React.FC<QuoteVisProp> = ({ exprVis }) => {
    return <>
        <Token rightSpacing>`&#123;</Token>
        {exprVis}
        <Token leftSpacing>&#125;</Token>
    </>
}

interface SpliceVisProp {
    shift: number,
    exprVis: ReactNode
}

const SpliceVis: React.FC<SpliceVisProp> = ({ shift, exprVis }) => {
    return <>
        <Token>~<sub>{shift}</sub></Token>
        <Token rightSpacing>&#123;</Token>
        {exprVis}
        <Token leftSpacing>&#125;</Token>
    </>
}

// Intermediate Expression Visualizer
interface EsubVisProp {
    envs: List<EnvRF>,
    exprVis: ReactNode,
    redex?: boolean,
    lookfor: Identifier | null,
}

const EsubVis: React.FC<EsubVisProp> = ({ envs, exprVis, redex, lookfor }) => {
    /* Take all sequential envs */
    const envViss = envs.map((env) => {
        if (lookfor && Identifier.eq(env.ident, lookfor)) {
            return <EnvVis ident={env.ident} val={env.val} matched />
        } else {
            return <EnvVis ident={env.ident} val={env.val} />
        }
    });

    return <>
        {envViss.butLast().toArray()}
        <Group redex={redex}>
            {envViss.last()!}
            {exprVis}
        </Group>
    </>;
}

interface EnvProp {
    ident: Identifier,
    val: Value,
    matched?: boolean
}

const EnvVis: React.FC<EnvProp> = ({ ident, val, matched }) => {

    const varVis = matched ?
        <IdentVis ident={ident} matched />
        : <IdentVis ident={ident} />;

    return <Group redex={matched}>
        [{varVis}=<ValueVis close val={val} />]
    </Group>
}

interface ClosedVarProp {
    ident: Identifier,
    val: Value
}

const ClosedVarVis: React.FC<ClosedVarProp> = ({ ident, val }) => {
    return <>
        <IdentVis ident={ident} />=<ValueVis close val={val} />
    </>
}

interface ValueVisProp {
    underEvaluation?: boolean,
    val: Value,
    close?: boolean
}

const ValueVis: React.FC<ValueVisProp> = ({ underEvaluation, val, close: closedByDefault }) => {

    const [expanded, setExpanded] = useState(closedByDefault);
    const toggleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setExpanded(!expanded)
    }
    let x: ReactNode;

    switch (val.kind) {
        case "closure": {
            const envlen = val.env.size;
            const renvlen = val.renv.size;
            let y: ReactNode;
            if (expanded) {
                y = <>…</>
            } else {
                y = <>
                    {val.env.reverse()
                        .map((x, idx) => <>
                            <ClosedVarVis ident={x.ident} val={x.val} />
                            {idx < envlen - 1 ? "," : null}
                        </>)
                    }|
                    {val.renv.reverse()
                        .map((x, idx) => <>
                            <IdentVis ident={x.from} />→<IdentVis ident={x.to} />
                            {idx < renvlen - 1 ? "," : null}
                        </>)
                    }
                    |
                    <ExpressionVis level={0} expr={val.lambda} context="toplevel" />
                </>;
            }
            x = <>【
                <Box
                    onClick={toggleExpand}
                    sx={{
                        display: "inline",
                        "&:hover": {
                            backgroundColor: "LightCoral",
                            cursor: "pointer"
                        },
                        ":has(:hover)": {
                            backgroundColor: "inherit",
                            cursor: "auto"
                        }
                    }}>
                    {y}
                </Box>
                】
            </>
            break;
        }

        case "integer": {
            x = <>
                {val.value}
            </>;
            break;
        }

        case "boolean": {
            x = <>
                {val.value ? "true" : "false"}
            </>;
            break;
        }

        case "code": {
            x = <>
                <Token>《</Token>
                <CodeLevel>
                    <ExpressionVis level={1} expr={val.expr} context="quote" />
                </CodeLevel>
                <Token>》</Token>
            </>;
            break;
        }

        default: throw unreachable(val);
    }

    return <Box sx={{ backgroundColor: underEvaluation ? "inherit" : "LightGray", display: "inline" }}>{x}</Box>;
}

interface ExpressionVisProp {
    level: number,
    expr: Expression,
    context: string,
    underEvaluation?: boolean
}

const ExpressionVis: React.FC<ExpressionVisProp> = ({ level, expr, context, underEvaluation }) => {
    switch (expr.kind) {
        case "variable":
            return <VarVis
                ident={expr.ident}
                lookup={level === 0 && underEvaluation}
            />;

        case "lambda": {
            const params = [];
            let body: Expression = expr;
            while (body.kind === "lambda") {
                params.push(body.param);
                body = body.body;
            }

            const bodyVis = <ExpressionVis level={level} expr={body} context={"lambda"} />;

            return <Paren>
                <LambdaVis params={List(params)} bodyVis={bodyVis} />
            </Paren>
        }

        case "application": {
            const funcVis = <ExpressionVis level={level} expr={expr.func} context={"appL"} />;
            const argVis = <ExpressionVis level={level} expr={expr.arg} context={"appR"} />;

            return <Paren cond={["appR", "env"].includes(context)}>
                <AppVis funcVis={funcVis} argVis={argVis} />
            </Paren>
        }

        case "fixpoint": {
            const bodyVis = <ExpressionVis level={level} expr={expr.body} context={"fixpoint"} />;

            return <Paren>
                <FixVis param={expr.param} bodyVis={bodyVis} />
            </Paren>
        }

        case "integer": {
            return <>{expr.value}</>
        }

        case "boolean": {
            return <>{expr.value ? "true" : "false"}</>
        }

        case "primitive": {
            if (expr.op in UniOp) {
                const argVis = <ExpressionVis level={level} expr={expr.args.first()!} context={"primitive"} />

                return <Paren>
                    <UniOpVis op={expr.op as UniOp} argVis={argVis} />
                </Paren>
            } else {
                const leftVis = <ExpressionVis level={level} expr={expr.args.first()!} context={"primitive"} />
                const rightVis = <ExpressionVis level={level} expr={expr.args.last()!} context={"primitive"} />

                return <Paren>
                    <BinOpVis
                        op={expr.op as PrimitiveOp}
                        leftVis={leftVis}
                        rightVis={rightVis} />
                </Paren>
            }
        }

        case "shortCircuit": {
            const leftVis = <ExpressionVis level={level} expr={expr.left} context={"primitive"} />
            const rightVis = <ExpressionVis level={level} expr={expr.right} context={"primitive"} />

            return <Paren>
                <BinOpVis
                    op={expr.op as PrimitiveOp}
                    leftVis={leftVis}
                    rightVis={rightVis} />
            </Paren>
        }

        case "if": {
            const condVis = <ExpressionVis level={level} expr={expr.cond} context={"if"} />;
            const thenVis = <ExpressionVis level={level} expr={expr.then} context={"if"} />;
            const elseVis = <ExpressionVis level={level} expr={expr.else_} context={"if"} />;

            return <Paren cond={true}>
                <IfVis condVis={condVis} thenVis={thenVis} elseVis={elseVis} />
            </Paren>
        }

        case "quote": {
            const exprVis = <ExpressionVis level={level + 1} expr={expr.expr} context={"quote"} />;
            const quoteVis = <QuoteVis exprVis={exprVis} />;

            if (level == 0) {
                // indicate that inner expression are inside code
                return <CodeLevel>{quoteVis}</CodeLevel>
            } else {
                return quoteVis
            }
        }

        case "splice": {
            const exprVis = <ExpressionVis level={level - expr.shift} expr={expr.expr} context={"splice"} />;
            const spliceVis = <SpliceVis shift={expr.shift} exprVis={exprVis} />;
            if (level === expr.shift) {
                // indicate that inner expression are inside code
                return <RuntimeLevel>{spliceVis}</RuntimeLevel>
            } else {
                return spliceVis
            }
        }

        default:
            throw unreachable(expr);
    }
}

type ContextKind = "lambda" | "appL" | "appR" | "fixpoint" | "uniOp" | "binOp" | "ifC" | "ifT" | "ifE" | "quote" | "splice" | "env" | "toplevel";

type ExpressionKind = "variable" | "lambda" | "application" | "fixpoint" | "integer" | "primitive" | "boolean" | "shortCircuit" | "if" | "quote" | "splice";
type IntermediateExpressionKind = "env"
type ValueKind = "closure" | "integer" | "boolean" | "code";
type ChildKind = ExpressionKind | IntermediateExpressionKind | ValueKind;

interface ContVisProp {
    cont: Cont,
    level: number,
    childKind: ChildKind,
    varopt: Identifier | null,
    children: ReactNode,
    redex?: boolean
}

const ContVis: React.FC<ContVisProp> = ({ cont, level, childKind, children, varopt, redex }) => {
    if (cont.isEmpty()) {
        return children
    }

    const frame = cont.first()!;
    switch (frame.kind) {
        // Runtime Frames
        case "appL": {
            const argVis = <ExpressionVis level={level} expr={frame.arg} context={"appR"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"application"}
                varopt={varopt}>
                <Group redex={redex}>
                    <AppVis funcVis={children} argVis={argVis} />
                </Group>
            </ContVis>
        }

        case "appR": {
            const funcVis = <ValueVis val={frame.closure} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"application"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <AppVis funcVis={funcVis} argVis={children} />
                </Group>
            </ContVis>
        }

        case "env": {
            /* Take all sequential envs */
            const envs: EnvRF[] = [];
            let rest: Cont = cont;
            while (!rest.isEmpty() && rest.first()!.kind === "env") {
                const env = rest.first() as EnvRF;
                envs.push(env)
                rest = rest.rest();
            }

            const exprVis = <Paren >
                {children}
            </Paren>

            return <ContVis
                cont={rest}
                level={level}
                childKind={"env"}
                varopt={varopt}
            >
                <EsubVis envs={List(envs)} exprVis={exprVis} lookfor={varopt} />
            </ContVis>;
        }

        case "prim": {
            let x;

            if (frame.op === "neg") {
                x = <UniOpVis op={frame.op} argVis={children} />

            } else if (frame.done.isEmpty()) {
                const exprVis = <ExpressionVis
                    level={level}
                    expr={frame.rest.first()!}
                    context={"primitive"}
                />;

                x = <BinOpVis
                    op={frame.op}
                    leftVis={children}
                    rightVis={exprVis}
                />;

            } else {
                const valueVis = <ValueVis val={frame.done.first()!} />;

                x = <BinOpVis
                    op={frame.op}
                    leftVis={valueVis}
                    rightVis={children}
                />;
            }

            return <ContVis
                cont={cont.rest()}
                level={level}
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

        case "ifC": {
            const thenVis = <ExpressionVis level={level} expr={frame.then} context={"if"} />;
            const elseVis = <ExpressionVis level={level} expr={frame.else_} context={"if"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"if"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren>
                        <IfVis condVis={children} thenVis={thenVis} elseVis={elseVis} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "shortCircuit": {
            const right = <ExpressionVis level={level} expr={frame.right} context={"shortCircuit"} />;
            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"shortCircuit"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <BinOpVis
                            op={frame.op}
                            leftVis={children}
                            rightVis={right}
                        />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "splice": {
            let exprVis;
            if (level === 0 && frame.shift > 0) {
                exprVis = <RuntimeLevel><SpliceVis shift={frame.shift} exprVis={children} /></RuntimeLevel>
            } else {
                exprVis = <SpliceVis shift={frame.shift} exprVis={children} />
            }

            return <ContVis
                cont={cont.rest()}
                level={level + frame.shift}
                childKind={"splice"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    {exprVis}
                </Group>
            </ContVis>
        }

        // Code Frames
        case "lamC":
        case "fixC": {
            let recParam: Identifier | null = null;
            let funcParams: List<Identifier> = List.of();
            let rest = cont;
            while (true) {
                if (rest.isEmpty()) {
                    break;
                }
                const frame = rest.first()!;
                if (frame.kind === "lamC") {
                    funcParams = funcParams.push(frame.param);
                    rest = rest.rest();
                } else if (frame.kind === "fixC") {
                    funcParams = funcParams.push(frame.funcParam);
                    recParam = frame.recParam;
                    rest = rest.rest();
                    break;
                } else {
                    break;
                }
            }

            const lambdaVis = (funcParams.isEmpty()) ? children :
                <LambdaVis params={funcParams} bodyVis={children} lookfor={varopt} />

            return <ContVis
                cont={rest}
                level={level}
                childKind={"lambda"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren>
                        {recParam ?
                             <FixVis param={recParam!} bodyVis={lambdaVis} lookfor={varopt} /> :
                             lambdaVis
                        }
                    </Paren>
                </Group>
            </ContVis>
        }

        case "appLC": {
            const argVis = <ExpressionVis level={level} expr={frame.arg} context={"appR"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"application"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <AppVis funcVis={children} argVis={argVis} />
                </Group>
            </ContVis>
        }

        case "appRC": {
            const funcVis = <ExpressionVis level={level} expr={frame.func} context={"appL"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"application"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <AppVis funcVis={funcVis} argVis={children} />
                </Group>
            </ContVis>
        }

        case "primC": {
            let x;
            if (frame.op === "neg") {
                x = <UniOpVis op={frame.op} argVis={children} />
            } else {
                if (frame.done.isEmpty()) {
                    const rightVis = <ExpressionVis
                        level={level}
                        expr={frame.rest.first()!}
                        context={"primitive"}
                    />;

                    x = <BinOpVis
                        op={frame.op}
                        leftVis={children}
                        rightVis={rightVis}
                    />;
                } else {
                    const leftVis = <ExpressionVis
                        level={level}
                        expr={frame.done.first()!}
                        context={"primitive"}
                    />;

                    x = <BinOpVis
                        op={frame.op}
                        leftVis={leftVis}
                        rightVis={children}
                    />;
                }
            }

            return <ContVis
                cont={cont.rest()}
                level={level}
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

        case "shortCircuitLC": {
            const right = <ExpressionVis level={level} expr={frame.right} context={"shortCircuit"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"shortCircuit"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <BinOpVis op={frame.op} leftVis={children} rightVis={right} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "shortCircuitRC": {
            const left = <ExpressionVis level={level} expr={frame.left} context={"shortCircuit"} />;

            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"shortCircuit"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <BinOpVis op={frame.op} leftVis={left} rightVis={children} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "ifCC": {
            const then = <ExpressionVis level={level} expr={frame.then} context={"if"} />;
            const else_ = <ExpressionVis level={level} expr={frame.else_} context={"if"} />;
            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"if"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <IfVis condVis={children} thenVis={then} elseVis={else_} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "ifTC": {
            const cond = <ExpressionVis level={level} expr={frame.cond} context={"if"} />;
            const else_ = <ExpressionVis level={level} expr={frame.else_} context={"if"} />;
            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"if"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <IfVis condVis={cond} thenVis={children} elseVis={else_} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "ifEC": {
            const cond = <ExpressionVis level={level} expr={frame.cond} context={"if"} />;
            const then = <ExpressionVis level={level} expr={frame.then} context={"if"} />;
            return <ContVis
                cont={cont.rest()}
                level={level}
                childKind={"if"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <IfVis condVis={cond} thenVis={then} elseVis={children} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "spliceC": {
            return <ContVis
                cont={cont.rest()}
                level={level + frame.shift}
                childKind={"splice"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    <Paren cond={true}>
                        <SpliceVis shift={frame.shift} exprVis={children} />
                    </Paren>
                </Group>
            </ContVis>
        }

        case "quoteC": {
            let x;
            if (level === 1) {
                x = <>
                    <Token>《</Token>
                    <CodeLevel>
                        {children}
                    </CodeLevel>
                    <Token>》</Token>
                </>
            } else {
                x = <QuoteVis exprVis={children} />
            }

            return <ContVis
                cont={cont.rest()}
                level={level - 1}
                childKind={"quote"}
                varopt={varopt}
            >
                <Group redex={redex}>
                    {x}
                </Group>
            </ContVis>;
        }

        default: throw unreachable(frame);
    }
}

interface CKStateVisProp {
    state: CKState
}

export const CKStateVis: React.FC<CKStateVisProp> = ({ state }) => {
    switch (state.kind) {
        case "eval": {
            let varopt = null;
            if (state.level === 0 && state.expr.kind === "variable") {
                const ident = state.expr.ident;
                const renv = state.renv;
                const renamed = RenamingEnv.lookup(renv, ident);
                if (renamed) {
                    varopt = renamed;
                }
            }

            return <Box sx={{ lineBreak: "anywhere" }}>
                <ContVis
                    cont={state.cont}
                    level={state.level}
                    childKind={state.expr.kind}
                    varopt={varopt}
                >
                    <Box sx={{
                        backgroundColor: "yellow",
                        display: "inline"
                    }}>
                        <ExpressionVis underEvaluation
                            level={state.level}
                            expr={state.expr}
                            context={state.cont.first()?.kind ?? "toplevel"}
                        />
                    </Box>
                </ContVis>
            </Box>
        }

        case "applyCont0":
            return <Box sx={{ lineBreak: "anywhere" }}>
                <ContVis
                    cont={state.cont}
                    level={0}
                    childKind={state.val.kind}
                    varopt={null}
                    redex
                >
                    <Box sx={{
                        backgroundColor: "LightSkyBlue",
                        display: "inline"
                    }}>
                        <ValueVis underEvaluation val={state.val} />
                    </Box>
                </ContVis>
            </Box>

        case "applyContF":
            return <Box sx={{ lineBreak: "anywhere" }}>
                <ContVis
                    cont={state.cont}
                    level={state.level}
                    childKind={state.code.kind}
                    varopt={null}
                    redex
                >
                    <Box sx={{
                        backgroundColor: "LightSkyBlue",
                        display: "inline"
                    }}>
                        <ExpressionVis underEvaluation
                            level={state.level}
                            expr={state.code}
                            context={state.cont.first()?.kind ?? "toplevel"}
                        />
                    </Box>
                </ContVis>
            </Box >

        default: throw unreachable(state);
    }
}

export const RenamingEnvVis: React.FC<{ renv: RenamingEnv }> = ({ renv }) => {
    return <Box>
        {renv.map((x) => <>
            <IdentVis ident={x.from} />→<IdentVis ident={x.to} />,
        </>)
        }
    </Box>
}
