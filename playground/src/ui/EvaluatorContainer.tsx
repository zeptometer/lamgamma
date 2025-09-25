import { AppBar, Box, Button, Container, Toolbar } from "@mui/material"
import React, { useState } from "react"
import Parser from "web-tree-sitter";

import { evaluate } from '../interpreter/Frontend.gen';

interface Props {
    code: string,
    treeSitterParser: Parser
}

export const EvaluatorContainer: React.FC<Props> = ({ code, treeSitterParser }) => {

    const [result, setResult] = useState<string | null>(null);

    const launchEval = () => {
        const result = evaluate(code, treeSitterParser);
        setResult(result)
    }

    return <Box sx={{
        height: "100%"
    }}>
        <Container sx={{
            fontFamily: "MonaSpace Neon",
            paddingTop: "1em",
            height: "100%"
        }}>
            <h1>Result</h1>
            <code>{result}</code>

        </Container>
        <AppBar position="sticky" sx={{ top: 'auto', bottom: 0 }}>
            <Toolbar>
                <Button variant="contained"
                    onClick={launchEval} >
                    Run
                </Button>
                <Box sx={{ flexGrow: 1 }} />
            </Toolbar>
        </AppBar>
    </Box>
}
