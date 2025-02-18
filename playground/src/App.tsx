import './App.css';
import { useEffect, useRef, useState } from 'react';
import Parser from 'web-tree-sitter';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { parseNode } from './interpreter/treeParser';

const App: React.FC = () => {
  const editorContainer = useRef<HTMLDivElement>(null);
  const [treeSitterParser, setTreeSitterParser] = useState<Parser | null>(null);
  const [parseResult, setParseResult] = useState('parse result is shown here');
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    (async () => {
      await Parser.init();
      const parser = new Parser();
      const Lang = await Parser.Language.load(import.meta.env.BASE_URL + 'tree-sitter-lamgamma_parser.wasm');
      parser.setLanguage(Lang);
      setTreeSitterParser(parser);
    })();
  }, []);

  useEffect(() => {
    if (editorContainer.current) {
      editorInstance.current = monaco.editor.create(editorContainer.current, {
        value: '',
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
      });

      editorInstance.current.onDidChangeModelContent(() => {
        const code = editorInstance.current?.getValue() || '';
        if (!treeSitterParser) { return; }

        const tree = treeSitterParser.parse(code);
        const msg = parseNode(tree.rootNode).match(
          ast => JSON.stringify(ast, null, 2),
          err => `(${err.node.startPosition.row},${err.node.startPosition.column})-(${err.node.endPosition.row},${err.node.endPosition.column}): ${err.message}`
        )
        setParseResult(msg);
      });
    }

    return () => {
      editorInstance.current?.dispose();
    };
  }, [editorContainer.current]);

  return (<div id="appcontainer">
    <div ref={editorContainer} className="editor-container"></div>
    <div className="result-container">
      <pre>{parseResult}</pre>
    </div>
  </div>
  );
};

export default App;