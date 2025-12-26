import React from 'react';
import { Box, IconButton, Slider, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useGame } from '../../../contexts/GameContext';

const SoundControls = () => {
  const { isMuted, volume, toggleMute, setVolume } = useGame();

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue / 100);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 1,
      width: 150,
      px: 1
    }}>
      <Tooltip title={isMuted ? "Unmute" : "Mute"}>
        <IconButton 
          onClick={toggleMute}
          size="small"
          sx={{ color: 'white' }}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </Tooltip>
      <Slider
        value={isMuted ? 0 : volume * 100}
        onChange={handleVolumeChange}
        aria-labelledby="volume-slider"
        min={0}
        max={100}
        size="small"
        sx={{
          color: 'white',
          '& .MuiSlider-track': {
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            '&:hover, &.Mui-focusVisible, &.Mui-active': {
              boxShadow: '0 0 0 4px rgba(144, 202, 249, 0.16)',
            },
          },
        }}
      />
    </Box>
  );
};

export default SoundControls;
