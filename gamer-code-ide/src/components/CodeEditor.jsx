import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, theme = 'vs-dark' }) => {
  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      onChange={onChange}
      theme={theme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;
