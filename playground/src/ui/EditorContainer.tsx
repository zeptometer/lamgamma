import { Editor, OnChange } from "@monaco-editor/react";
import { AppBar, Box, Link, MenuItem, Select, SelectChangeEvent, Toolbar, Typography } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import React from "react";
import { Example } from "../examples";

interface Props {
    code: string,
    example: Example,
    onExampleUpdate: (event: SelectChangeEvent<Example>) => void,
    onChange: OnChange
}

export const EditorContainer: React.FC<Props> = ({ code, example, onExampleUpdate, onChange }) => {
    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h5" component="div" sx={{ marginRight: 4 }}>
                    λγ Playground
                </Typography>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={example}
                    label="Example"
                    onChange={onExampleUpdate}
                >
                    <MenuItem value={"quasiquote"}>quasiquote</MenuItem>
                    <MenuItem value={"runtime_evaluation"}>Runtime Evaluation</MenuItem>
                    <MenuItem value={"runtime_evaluation_csp"}>Runtime Evaluation with cross-stage persistence</MenuItem>
                    <MenuItem value={"nested_quote"}>Nested quotes</MenuItem>
                    <MenuItem value={"ill_staged_variable"}>(ERROR) Ill-staged variable</MenuItem>
                    <MenuItem value={"scope_extrusion"}>(ERROR) Scope Extrusion</MenuItem>
                    <MenuItem value={"spower"}>Specialized power</MenuItem>
                    <MenuItem value={"spower_sqr"}>Specialized power with external function</MenuItem>
                    <MenuItem value={"spower_cont"}>Specialized power with let-insertion</MenuItem>
                    <MenuItem value={"gibonacci"}>Gibonacci</MenuItem>
                </Select>
                <Box sx={{ flexGrow: 1 }} />
                <Link
                    href="https://github.com/zeptometer/lamgamma"
                    target="_blank"
                    color="inherit">
                    <GitHubIcon />
                </Link>
            </Toolbar>
        </AppBar>
        <Editor
            height="100%"
            width="100%"
            defaultLanguage="lamgamma"
            value={code}
            theme="vs-dark"
            onChange={onChange}
            options={{
                fontSize: 16,
                fontFamily: "Monaspace Neon",
                automaticLayout: true
            }}
        />
    </>
}