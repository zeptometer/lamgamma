import { Editor, OnChange } from "@monaco-editor/react";

interface Props {
    onChange: OnChange
}

export const EditorContainer: React.FC<Props> = (props) => {
    return <Editor
            height="100%"
            width="100%"
            defaultLanguage="plaintext"
            defaultValue="(fn x -> x)"
            theme="vs-dark"
            onChange={props.onChange}
            options={{
                fontSize: 16,
                fontFamily: "Monaspace Neon",
                automaticLayout: true
            }}
        />
}