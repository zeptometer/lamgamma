import { useEffect, useRef, useState } from 'react'
import './App.css'
import Parser from 'web-tree-sitter'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

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
      });

      editorInstance.current.onDidChangeModelContent(() => {
        const code = editorInstance.current?.getValue() || '';
        if (!treeSitterParser) { return; }
        const tree = treeSitterParser.parse(code);
        setParseResult(tree.rootNode.toString());
      });
    }

    return () => {
      editorInstance.current?.dispose();
    };
  }, [editorContainer.current]);
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左側: Monaco Editor */}
      <div ref={editorContainer} style={{ width: '50%' }}></div>
      {/* 右側: 解析結果表示 */}
      <div style={{ width: '50%', padding: '1rem', backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        <pre>{parseResult}</pre>
      </div>
    </div>
  );
};

export default App
