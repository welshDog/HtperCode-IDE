import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

const LevelUpAnimation = ({ level, onComplete }) => {
  const [show, setShow] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (level > 1) { // Don't show on initial load
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [level, onComplete]);

  if (!show) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
      />
      <Box
        sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '20px 40px',
          borderRadius: '8px',
          textAlign: 'center',
          animation: 'pulse 1s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <Typography variant="h3" sx={{ color: '#90caf9', fontWeight: 'bold' }}>
          Level Up! 🎉
        </Typography>
        <Typography variant="h5" sx={{ mt: 1 }}>
          You've reached level {level}!
        </Typography>
      </Box>
    </Box>
  );
};

export default LevelUpAnimation;
