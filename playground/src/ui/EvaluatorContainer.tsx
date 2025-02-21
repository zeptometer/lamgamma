import { AppBar, Box, Container, IconButton, Toolbar } from "@mui/material"
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
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

    useEffect(() => {
        const tree = treeSitterParser.parse(code)
        const exprResult = parseNode(tree.rootNode)

        setState(exprResult.map(expr => CKMachine.initState(expr)))
    }, [code, treeSitterParser])

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

    return <Box>
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={evaluate}
                    disabled={isComplete}
                >
                    <PlayCircleFilledIcon />
                </IconButton>
                {
                    isComplete ? "completed" : ""
                }
            </Toolbar>
        </AppBar>
        <Container sx={{
            fontFamily: "MonaSpace Neon",
            paddingTop: "1em"
        }}>
            {
                state.match(
                    (state) => <CKStateVis state={state} />,
                    (err) => err.message
                )
            }
        </Container>
    </Box>
}
