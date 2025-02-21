import '@fontsource/monaspace-neon';
import { useEffect, useState } from 'react';
import Parser from 'web-tree-sitter';
import { OnChange } from '@monaco-editor/react';

import { parseNode } from './interpreter/parseNode';
import { EditorContainer } from './ui/EditorContainer';
import { Grid2 } from '@mui/material';
import { EvaluatorContainer } from './ui/EvaluatorContainer';

const App: React.FC = () => {
  const [treeSitterParser, setTreeSitterParser] = useState<Parser | null>(null);
  const [code, setCode] = useState('code content is put here');

  useEffect(() => {
    (async () => {
      await Parser.init();
      const parser = new Parser();
      const Lang = await Parser.Language.load(import.meta.env.BASE_URL + 'tree-sitter-lamgamma_parser.wasm');
      parser.setLanguage(Lang);
      setTreeSitterParser(parser);
    })();
  }, []);

  const onEditorChange: OnChange = (code) => {
    if (code == null) return;
    setCode(code);
  }

  return <Grid2
    container
    spacing={0}
    height="100vh"
  >
    <Grid2 size={6} minWidth={0}>
      <EditorContainer
        onChange={onEditorChange}
      />
    </Grid2>
    <Grid2 size={6} minWidth={0}>
      <EvaluatorContainer
        code={code}
        parser={treeSitterParser}
      />
    </Grid2>
  </Grid2 >;
};

export default App;