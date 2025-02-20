import '@fontsource/monaspace-neon';
import { useEffect, useState } from 'react';
import Parser from 'web-tree-sitter';
import Editor, { OnChange } from '@monaco-editor/react';
import styled from 'styled-components'

import { parseNode } from './interpreter/parseNode';

const App: React.FC = () => {
  const [treeSitterParser, setTreeSitterParser] = useState<Parser | null>(null);
  const [parseResult, setParseResult] = useState('parse result is shown here');

  useEffect(() => {
    (async () => {
      await Parser.init();
      const parser = new Parser();
      const Lang = await Parser.Language.load(import.meta.env.BASE_URL + 'tree-sitter-lamgamma_parser.wasm');
      parser.setLanguage(Lang);
      setTreeSitterParser(parser);
    })();
  }, []);

  const onEditorChange: OnChange = (code, _) => {
    if (!treeSitterParser || !code) { return; }

    const tree = treeSitterParser.parse(code);
    const msg = parseNode(tree.rootNode).match(
      ast => JSON.stringify(ast, null, 2),
      err => `(${err.node.startPosition.row},${err.node.startPosition.column})-(${err.node.endPosition.row},${err.node.endPosition.column}): ${err.message}`
    )
    setParseResult(msg);
  }

  const PlayGroundContainer = styled.div`
    display: flex;
  `

  const EditorContainer = styled.div`
    flex: 1;
  `

  const ResultContainer = styled.div`
    flex: 1;
    font-size: 20px;
    padding: 10px;
  `

  return (<PlayGroundContainer>
    <EditorContainer>
      <Editor
        height="100vh"
        width="100%"
        defaultLanguage="plaintext"
        defaultValue="(fn x -> x)"
        theme="vs-dark"
        onChange={onEditorChange}
        options={{
          fontSize: 20,
          fontFamily: "Monaspace Neon"
        }}
      />
    </EditorContainer>
    <ResultContainer>
      <pre>{parseResult}</pre>
    </ResultContainer>
  </PlayGroundContainer>
  );
};

export default App;