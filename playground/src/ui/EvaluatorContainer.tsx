import { AppBar, Box, Button, Container, Toolbar } from "@mui/material"
import React, { useEffect, useState } from "react"
import Parser from "web-tree-sitter";

import { parseNode } from '../interpreter/parseNode';
import { CKMachine } from "../interpreter/ckmachine";
import { CKState } from "../interpreter/ckstate";
import { ok, Result } from "neverthrow";
import { CKStateVis, RenamingEnvVis } from "./CKStateVisualizer";
import { List } from "immutable";
import { Identifier } from "../interpreter/expression";
import { unreachable } from "../common/assertNever";

const MAX_STATES = 100;
const MAX_EVAL_STEPS = 1000000;


interface Props {
    code: string,
    treeSitterParser: Parser
}

type EvalState = "running" | "complete" | "error" | "readyForNextStage";

export const EvaluatorContainer: React.FC<Props> = ({ code, treeSitterParser }) => {

    const tree = treeSitterParser.parse(code)
    const exprResult = parseNode(tree.rootNode)
    const initialState = exprResult.map((expr) => CKMachine.initState(expr))

    const [states, setStates] = useState<List<Result<CKState, Error>>>(List.of(initialState));
    const [evalState, setEvalState] = useState<EvalState>("running");

    const resetState = () => {
        Identifier.reset();
        const tree = treeSitterParser.parse(code)
        const exprResult = parseNode(tree.rootNode)

        setStates(List.of(exprResult.map(expr => CKMachine.initState(expr))))
        setEvalState(exprResult.isOk() ? "running" : "error");
    }

    useEffect(resetState, [code, treeSitterParser])

    const getEvalState = (state: Result<CKState, Error>): EvalState => {
        if (state.isErr()) {
            return "error";
        }
        const okstate = state.value;
        if (okstate.kind === "applyCont0" && okstate.cont.isEmpty()) {
            if (okstate.val.kind === "code") {
                return "readyForNextStage";
            } else {
                return "complete";
            }
        }
        return "running";
    }

    const evaluate = () => {
        switch (evalState) {
            case "running": {
                const state = states.last()!;
                if (state.isErr()) { throw (new Error("expected unreachable: evaluate step from error state")) }

                const nextState = CKMachine.executeStep(state.value);

                setStates(states.takeLast(MAX_STATES).push(nextState));
                setEvalState(getEvalState(nextState));
                break;
            }

            case "readyForNextStage": {
                const state = states.last()!;
                if (state.isErr()) { throw (new Error("expected unreachable: evaluate step from error state")) }

                const okstate = state.value;
                if (okstate.kind !== "applyCont0" ||
                    !okstate.cont.isEmpty() ||
                    okstate.val.kind !== "code") {
                    throw (new Error("expected unreachable: state is not ready for next stage"))
                }

                const nextStageExpr = okstate.val.expr;
                const nextState = ok(CKMachine.initState(nextStageExpr));

                setStates(states.takeLast(MAX_STATES).push(nextState));
                setEvalState("running");
            }
        }
    }

    const evaluateAll = () => {
        let newStates = states;
        for (let i = 0; i < MAX_EVAL_STEPS; i++) {
            const state = newStates.last()!;
            if (state.isErr()) {
                setEvalState("error");
                break;
            }
            const nextState = CKMachine.executeStep(state.value);
            newStates = newStates.takeLast(MAX_STATES).push(nextState);

            if (nextState.isOk() &&
                nextState.value.kind === "applyCont0"
                && nextState.value.cont.isEmpty()) {
                setEvalState(getEvalState(nextState));
                break;
            }
        }
        setStates(newStates);
    }

    const undo = () => {
        const newstates = states.pop();
        setStates(newstates);
        setEvalState(getEvalState(newstates.last()!));
    }

    return <Box sx={{
        height: "100%"
    }}>
        <Container sx={{
            fontFamily: "MonaSpace Neon",
            paddingTop: "1em",
            height: "100%"
        }}>
            {
                states.last()!.match(
                    (state) => <Box>
                        <p>current level: {CKMachine.stateLevel(state)}</p>
                        <h2>Expression</h2>

                        <CKStateVis state={state} />

                        <h2>Renaming Env</h2>

                        {state.kind === "eval" && <RenamingEnvVis renv={state.renv} />}
                        {/* JSON: {JSON.stringify(state)} */}
                    </Box>,
                    (err) => err.message
                )
            }

        </Container>
        <AppBar position="sticky" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar>
                <Button variant="contained"
                    onClick={evaluate}
                    disabled={["error", "complete"].includes(evalState)}>
                    {((state) => {
                        switch (state) {
                            case "running": return "Eval Step";
                            case "readyForNextStage": return "Next Stage";
                            case "complete": return "Complete";
                            case "error": return "Error";
                            default: throw unreachable(state);
                        }
                    })(evalState)}
                </Button>

                <Button variant="contained"
                    onClick={undo}
                    disabled={states.size === 1}>
                    Undo
                </Button>

                <Box sx={{ flexGrow: 1 }} />

                <Button variant="contained"
                    onClick={resetState}>
                    Reset
                </Button>

                <Button variant="contained"
                    onClick={evaluateAll}
                    disabled={evalState !== "running"}>
                    Eval All
                </Button>
            </Toolbar>
        </AppBar>
    </Box>
}
