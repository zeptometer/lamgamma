import '@fontsource/monaspace-neon';
import { useEffect, useState } from 'react';
import Parser from 'web-tree-sitter';
import { OnChange } from '@monaco-editor/react';

import { EditorContainer } from './ui/EditorContainer';
import { Grid2 } from '@mui/material';
import { EvaluatorContainer } from './ui/EvaluatorContainer';
import { ExamplePrograms } from './examples';

const App: React.FC = () => {
  const [treeSitterParser, setTreeSitterParser] = useState<Parser | null>(null);
  const [code, setCode] = useState(ExamplePrograms.ski);

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
        code={code}
        onChange={onEditorChange}
      />
    </Grid2>
    <Grid2 size={6} minWidth={0}>
      {
        treeSitterParser ?
          <EvaluatorContainer
            code={code}
            treeSitterParser={treeSitterParser}
          /> : null
      }
    </Grid2>
  </Grid2 >;
};

export default App;