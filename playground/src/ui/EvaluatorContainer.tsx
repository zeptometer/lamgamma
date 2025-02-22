import { AppBar, Box, Button, Container, Toolbar } from "@mui/material"
import React, { useEffect, useState } from "react"
import Parser from "web-tree-sitter";

import { parseNode } from '../interpreter/parseNode';
import { CKMachine } from "../interpreter/ckmachine";
import { CKState } from "../interpreter/ckstate";
import { Result } from "neverthrow";
import { CKStateVis } from "./CKStateVisualizer";

interface Props {
    code: string,
    treeSitterParser: Parser
}

export const EvaluatorContainer: React.FC<Props> = ({ code, treeSitterParser }) => {

    const tree = treeSitterParser.parse(code)
    const exprResult = parseNode(tree.rootNode)
    const initialState = exprResult.map((expr) => CKMachine.initState(expr))

    const [state, setState] = useState<Result<CKState, Error>>(initialState);
    const [isComplete, setComplete] = useState(false);

    const resetState = () => {
        const tree = treeSitterParser.parse(code)
        const exprResult = parseNode(tree.rootNode)

        setState(exprResult.map(expr => CKMachine.initState(expr)))
        setComplete(false)
    }

    useEffect(resetState, [code, treeSitterParser])

    const evaluate = () => {
        if (state.isErr()) {
            return;
        }
        if (state.isOk() &&
            state.value.kind === "applyCont"
            && state.value.cont.isEmpty()) {
            setComplete(true);
            return;
        }

        setState(CKMachine.executeStep(state.value))
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
                state.match(
                    (state) => <CKStateVis state={state} />,
                    (err) => err.message
                )
            }
        </Container>
        <AppBar position="sticky" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar>
                <Button variant="contained"
                    onClick={evaluate}
                    disabled={isComplete}>
                    {isComplete ? "Eval Completed" : "Eval Step"}
                </Button>

                <Button variant="contained"
                    onClick={resetState}>
                    Reset
                </Button>
            </Toolbar>
        </AppBar>
    </Box>
}
