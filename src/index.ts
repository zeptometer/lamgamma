import * as monaco from 'monaco-editor';

// Register a new language
monaco.languages.register({ id: 'myLang' });

// Define the language configuration
monaco.languages.setMonarchTokensProvider('myLang', {
    tokenizer: {
        root: [
            // Add your language syntax rules here
            [/function/, 'keyword'],
            [/[a-z_$][\w$]*/, 'identifier'],
            [/[{}()\[\]]/, '@brackets'],
            [/\s+/, 'white'],
            [/".*"/, 'string'],
        ]
    }
});

// Create the editor
monaco.editor.create(document.getElementById('container')!, {
    value: `function hello() {
    console.log("Hello, world!");
}`,
    language: 'myLang'
});
