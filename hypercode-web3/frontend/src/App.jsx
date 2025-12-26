import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CodeEditor from './components/CodeEditor';
import XpBar from './components/ui/XpBar';
import { GameProvider, useGame } from './contexts/GameContext';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"VT323", monospace',
    fontSize: 16,
  },
});

function AppContent() {
  const [code, setCode] = useState('// Welcome to GamerCode IDE\nconsole.log("Start coding to earn XP!");');
  const { saveCode, runCode, clearSave } = useGame();

  const handleCodeChange = (newCode) => {
    setCode(newCode || '');
  };

  const handleSave = () => {
    saveCode(code);
  };

  const handleRun = () => {
    runCode();
    // In a real app, this would execute the code
    console.log('Running code...');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Box
          component="header"
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1>GamerCode IDE</h1>
          <XpBar />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 250,
              bgcolor: 'background.paper',
              p: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <h3>Explorer</h3>
            <button onClick={handleRun} style={{ 
              padding: '8px 16px', 
              background: '#90caf9', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: '"VT323", monospace',
              fontSize: '16px'
            }}>
              ▶️ Run Code
            </button>
            <button onClick={handleSave} style={{ 
              padding: '8px 16px', 
              background: 'transparent', 
              border: '1px solid #90caf9', 
              borderRadius: '4px',
              color: '#90caf9',
              cursor: 'pointer',
              fontFamily: '"VT323", monospace',
              fontSize: '16px'
            }}>
              💾 Save Code
            </button>
            <button 
              onClick={clearSave}
              style={{ 
                padding: '8px 16px', 
                background: 'transparent', 
                border: '1px solid #f48fb1', 
                borderRadius: '4px',
                color: '#f48fb1',
                cursor: 'pointer',
                fontFamily: '"VT323", monospace',
                fontSize: '16px',
                marginTop: 'auto'
              }}
            >
              🗑️ Clear Save
            </button>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              theme="vs-dark"
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
