import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CodeEditor from './components/CodeEditor';
import XpBar from './components/ui/XpBar';
import LevelUpAnimation from './components/ui/LevelUpAnimation';
import SoundControls from './components/ui/SoundControls';
import { GameProvider, useGame } from './contexts/GameContext';
import 'react-confetti/dist/index.css';
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
  const { 
    saveCode, 
    runCode, 
    clearSave, 
    showLevelUp, 
    newLevel, 
    onLevelUpComplete 
  } = useGame();

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
      {showLevelUp && (
        <LevelUpAnimation 
          level={newLevel} 
          onComplete={onLevelUpComplete} 
        />
      )}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <XpBar />
            <SoundControls />
          </Box>
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
// In App.jsx
import Pet from './components/ui/Pet';

// Add this inside the main App return, right after the ThemeProvider
<ThemeProvider theme={darkTheme}>
  <CssBaseline />
  {showLevelUp && (
    <LevelUpAnimation 
      level={newLevel} 
      onComplete={onLevelUpComplete} 
    />
  )}
  <Pet /> {/* Add this line */}
  {/* Rest of your app */}
</ThemeProvider>
export default App;
