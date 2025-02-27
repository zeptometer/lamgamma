import { Editor, OnChange } from "@monaco-editor/react";

interface Props {
    code: string,
    onChange: OnChange
}

export const EditorContainer: React.FC<Props> = ({ code, onChange }) => {
    return <Editor
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
}