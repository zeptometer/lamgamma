import { AppBar, Box, Button, Container, Toolbar } from "@mui/material"
import React, { useEffect, useState } from "react"
import Parser from "web-tree-sitter";

import { parseNode } from '../interpreter/parseNode';
import { CKMachine } from "../interpreter/ckmachine";
import { CKState } from "../interpreter/ckstate";
import { Result } from "neverthrow";
import { CKStateVis, RenamingEnvVis } from "./CKStateVisualizer";
import { List } from "immutable";
import { Identifier } from "../interpreter/expression";

const MAX_STATES = 100;
const MAX_EVAL_STEPS = 1000000;


interface Props {
    code: string,
    treeSitterParser: Parser
}

export const EvaluatorContainer: React.FC<Props> = ({ code, treeSitterParser }) => {

    const tree = treeSitterParser.parse(code)
    const exprResult = parseNode(tree.rootNode)
    const initialState = exprResult.map((expr) => CKMachine.initState(expr))

    const [states, setStates] = useState<List<Result<CKState, Error>>>(List.of(initialState));
    const [isComplete, setComplete] = useState(false);

    const resetState = () => {
        Identifier.reset();
        const tree = treeSitterParser.parse(code)
        const exprResult = parseNode(tree.rootNode)

        setStates(List.of(exprResult.map(expr => CKMachine.initState(expr))))
        setComplete(false)
    }

    useEffect(resetState, [code, treeSitterParser])

    const evaluate = () => {
        const state = states.last()!;
        if (state.isErr()) {
            return;
        }

        const nextState = CKMachine.executeStep(state.value);

        setStates(states.takeLast(MAX_STATES).push(nextState));
        if (nextState.isOk() &&
            nextState.value.kind === "applyCont0"
            && nextState.value.cont.isEmpty()) {
            setComplete(true);
            return;
        }
    }

    const evaluateAll = () => {
        let newStates = states;
        for (let i = 0; i < MAX_EVAL_STEPS; i++) {
            const state = newStates.last()!;
            if (state.isErr()) {
                break;
            }
            const nextState = CKMachine.executeStep(state.value);
            newStates = newStates.takeLast(MAX_STATES).push(nextState);

            if (nextState.isOk() &&
                nextState.value.kind === "applyCont0"
                && nextState.value.cont.isEmpty()) {
                setComplete(true);
                break;
            }
        }
        setStates(newStates);
    }

    const undo = () => {
        setStates(states.pop());
        setComplete(false);
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
                    disabled={isComplete}>
                    {isComplete ? "Completed" : "Eval Step"}
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
                    disabled={isComplete}>
                    Eval All
                </Button>
            </Toolbar>
        </AppBar>
    </Box>
}
