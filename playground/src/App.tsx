import { useEffect, useState } from 'react';
import Parser from 'web-tree-sitter';
import { OnChange, useMonaco } from '@monaco-editor/react';

import { EditorContainer } from './ui/EditorContainer';
import { Grid2, SelectChangeEvent } from '@mui/material';
import { EvaluatorContainer } from './ui/EvaluatorContainer';
import { Example, ExamplePrograms } from './examples';

const App: React.FC = () => {
  const [treeSitterParser, setTreeSitterParser] = useState<Parser | null>(null);
  const [code, setCode] = useState(ExamplePrograms.quasiquote);
  const [example, setExample] = useState<Example>("quasiquote");

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'lamgamma' });
      monaco.languages.setMonarchTokensProvider('lamgamma', {
        tokenizer: {
          root: [
            [/\b(?:let|in|fn|if|then|else|->|fix)\b/, "keyword"],
          ]
        }
      });
    }
  }, [monaco]);

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

  const onExampleUpdate = (event: SelectChangeEvent<Example>) => {
    const example = event.target.value as Example;

    setCode(ExamplePrograms[example]);
    setExample(example);
  };

  return <Grid2
    container
    spacing={0}
    height="100vh"
  >
    <Grid2
      size={{ xs: 12, md: 6 }}
      height={{ xs: "50vh", md: "100%" }}
      minWidth={0}>
      <EditorContainer
        onChange={onEditorChange}
        onExampleUpdate={onExampleUpdate}
        example={example}
        code={code}
      />
    </Grid2>
    <Grid2
      size={{ xs: 12, md: 6 }}
      height={{ xs: "auto", md: "100%" }}
      minWidth={0}>
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