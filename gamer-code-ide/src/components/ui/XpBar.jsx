import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useGame } from '../../contexts/GameContext';

const XpBar = () => {
  const { level, xp, xpToNextLevel } = useGame();
  const progress = Math.min(100, (xp / xpToNextLevel) * 100);

  return (
    <Box sx={{ 
      width: '300px', 
      p: 1,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="primary">Level {level}</Typography>
        <Typography variant="body2" color="text.secondary">
          {xp} / {xpToNextLevel} XP
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #90caf9, #64b5f6)',
          }
        }} 
      />
    </Box>
  );
};

export default XpBar;
