import { AppBar, Box, Container, IconButton, Toolbar } from "@mui/material"
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import React from "react"
import Parser from "web-tree-sitter";

interface Props {
    code: string,
    parser: Parser | null
}

export const EvaluatorContainer: React.FC<Props> = (props) => {
    return <Box>
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <PlayCircleFilledIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
        <Container>
            <pre>{props.code}</pre>
        </Container>
    </Box>
}
