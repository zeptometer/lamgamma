import { AppBar, Box, Container, IconButton, Toolbar } from "@mui/material"
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import React, { useEffect, useState } from "react"
import Parser from "web-tree-sitter";

import { parseNode } from '../interpreter/parseNode';
import { CKMachine } from "../interpreter/ckmachine";
import { CKState } from "../interpreter/ckstate";
import { Result } from "neverthrow";

interface Props {
    code: string,
    treeSitterParser: Parser
}

export const EvaluatorContainer: React.FC<Props> = ({ code, treeSitterParser }) => {

    const tree = treeSitterParser.parse(code)
    const exprResult = parseNode(tree.rootNode)
    const initialState = exprResult.map((expr) => CKMachine.initState(expr))

    const [state, setState] = useState<Result<CKState, Error>>(initialState);

    useEffect(() => {
        const tree = treeSitterParser.parse(code)
        const exprResult = parseNode(tree.rootNode)

        setState(exprResult.map(expr => CKMachine.initState(expr)))
    }, [code, treeSitterParser])

    const evaluate = () => {
        if (state.isErr()) {
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
                >
                    <PlayCircleFilledIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
        <Container>
            {JSON.stringify(state)}
        </Container>
    </Box>
}
