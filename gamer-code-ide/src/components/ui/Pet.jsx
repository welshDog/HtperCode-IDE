// src/components/ui/Pet.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  Pets as PetIcon,
  EmojiEmotions as MoodIcon,
  Palette as PaletteIcon,
  Close as CloseIcon,
  Favorite as HeartIcon,
  Star as StarIcon,
  Coffee as CoffeeIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useGame } from '../../../contexts/GameContext';

// Pet types with their emojis and colors
const PET_TYPES = {
  cat: { emoji: '🐱', color: '#ffb74d' },
  dog: { emoji: '🐶', color: '#a1887f' },
  fox: { emoji: '🦊', color: '#ff8a65' },
  robot: { emoji: '🤖', color: '#90caf9' },
  dragon: { emoji: '🐉', color: '#7e57c2' }
};

// Pet moods with their emojis
const PET_MOODS = {
  idle: '😐',
  happy: '😊',
  working: '👨‍💻',
  sleeping: '😴',
  excited: '🤩',
  thinking: '🤔'
};

const Pet = () => {
  const { codeSaveCount, level, xp } = useGame();
  const [mood, setMood] = useState('idle');
  const [showThought, setShowThought] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [petType, setPetType] = useState('cat');
  const [petColor, setPetColor] = useState('#ffb74d');
  const [petScale, setPetScale] = useState(1);
  const [happiness, setHappiness] = useState(50);
  const [energy, setEnergy] = useState(100);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Update pet stats over time
  useEffect(() => {
    const interval = setInterval(() => {
      setHappiness(prev => Math.max(0, prev - 0.5));
      setEnergy(prev => Math.max(0, prev - 0.2));
      
      // Pet gets grumpy if unhappy or tired
      if (happiness < 20 || energy < 20) {
        setMood('thinking');
        setShowThought(happiness < 20 ? 'Play with me!' : 'I\'m tired...');
      } else if (mood === 'thinking') {
        setMood('idle');
        setShowThought('');
      }
      
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [happiness, energy, mood]);

  // React to code saving
  useEffect(() => {
    if (codeSaveCount > 0) {
      setMood('happy');
      setHappiness(prev => Math.min(100, prev + 10));
      setShowThought('Nice code!');
      const timer = setTimeout(() => {
        setMood('idle');
        setShowThought('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [codeSaveCount]);

  // React to level up
  useEffect(() => {
    if (level > 1) {
      setMood('excited');
      setHappiness(100);
      setEnergy(100);
      setShowThought(`Level ${level}! 🎉`);
      const timer = setTimeout(() => {
        setMood('happy');
        setShowThought('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  // Pet gets sleepy if inactive
  useEffect(() => {
    const inactivityTimer = setTimeout(() => {
      if (mood !== 'sleeping' && energy < 30) {
        setMood('sleeping');
        setShowThought('Zzz...');
      }
    }, 30000);

    return () => clearTimeout(inactivityTimer);
  }, [mood, energy, lastInteraction]);

  // Handle interaction with the pet
  const handlePetInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    
    if (mood === 'sleeping') {
      setMood('happy');
      setEnergy(prev => Math.min(100, prev + 20));
      setShowThought('Good morning!');
    } else {
      setMood(prev => prev === 'happy' ? 'excited' : 'happy');
      setHappiness(prev => Math.min(100, prev + 15));
      setShowThought('Hello! 👋');
    }
    
    setTimeout(() => setShowThought(''), 2000);
  }, [mood]);

  // Feed the pet
  const feedPet = useCallback(() => {
    setEnergy(prev => Math.min(100, prev + 30));
    setHappiness(prev => Math.min(100, prev + 10));
    setMood('happy');
    setShowThought('Yummy! 🍖');
    setTimeout(() => setShowThought(''), 2000);
  }, []);

  const getPetEmoji = () => {
    return PET_MOODS[mood] || PET_TYPES[petType]?.emoji || '🐱';
  };

  const renderPetStats = () => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'background.paper',
        minWidth: 200
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        {PET_TYPES[petType]?.emoji} Level {Math.floor(level)}
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">Happiness</Typography>
          <Typography variant="caption">{Math.round(happiness)}%</Typography>
        </Box>
        <Slider 
          value={happiness} 
          size="small" 
          disabled 
          sx={{ color: PET_TYPES[petType]?.color }}
        />
      </Box>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">Energy</Typography>
          <Typography variant="caption">{Math.round(energy)}%</Typography>
        </Box>
        <Slider 
          value={energy} 
          size="small" 
          disabled 
          color="secondary"
        />
      </Box>
      <Button 
        fullWidth 
        size="small" 
        variant="outlined" 
        startIcon={<CoffeeIcon />}
        onClick={feedPet}
        disabled={energy >= 100}
      >
        Feed
      </Button>
    </Paper>
  );

  const renderCustomization = () => (
    <Dialog open={showCustomize} onClose={() => setShowCustomize(false)}>
      <DialogTitle>Customize Your Pet</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Pet Type</Typography>
          <ToggleButtonGroup
            value={petType}
            exclusive
            onChange={(e, newType) => newType && setPetType(newType)}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {Object.entries(PET_TYPES).map(([key, { emoji }]) => (
              <ToggleButton key={key} value={key} sx={{ fontSize: '1.5rem' }}>
                {emoji}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Size: {Math.round(petScale * 100)}%</Typography>
          <Slider
            value={petScale * 100}
            onChange={(e, value) => setPetScale(value / 100)}
            min={50}
            max={200}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}%`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCustomize(false)}>Done</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 2
    }}>
      {showStats && (
        <Box sx={{ position: 'relative' }}>
          <IconButton
            size="small"
            onClick={() => setShowStats(false)}
            sx={{ 
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 1,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.default' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          {renderPetStats()}
        </Box>
      )}
      
      {showThought && (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 2,
          mb: 1,
          maxWidth: 200,
          textAlign: 'center',
          boxShadow: 3,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            right: 20,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${theme => theme.palette.background.paper}`,
          }
        }}>
          <Typography variant="body2">{showThought}</Typography>
        </Box>
      )}
      
      <Box sx={{ position: 'relative' }}>
        <Box 
          sx={{
            fontSize: `${3 * petScale}rem`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: mood === 'excited' ? 'rotate(10deg)' : 'none',
            '&:hover': {
              transform: `scale(${1.1 * petScale}) ${mood === 'excited' ? 'rotate(-10deg)' : ''}`,
              filter: 'brightness(1.1)'
            },
            animation: mood === 'happy' ? 'bounce 0.5s infinite alternate' : 'none',
            '@keyframes bounce': {
              'from': { transform: 'translateY(0)' },
              'to': { transform: 'translateY(-10px)' }
            }
          }}
          onClick={handlePetInteraction}
        >
          {getPetEmoji()}
        </Box>
        
        <Box sx={{ 
          position: 'absolute', 
          bottom: -10, 
          right: -10,
          display: 'flex',
          gap: 0.5
        }}>
          <Tooltip title="Pet Stats">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                setShowStats(!showStats);
              }}
              sx={{ 
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.default' }
              }}
            >
              <HeartIcon fontSize="small" color={showStats ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Customize">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                setShowCustomize(true);
              }}
              sx={{ 
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.default' }
              }}
            >
              <PaletteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {renderCustomization()}
    </Box>
  );
};

export default Pet;