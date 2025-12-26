
# HyperCode Web3 IDE - Architecture Specification

## 🌐 System Overview

HyperCode is a **Web3-Integrated Development Environment** that combines traditional coding tools with blockchain-based rewards and features. The system is built on a modular architecture that allows for extensibility and customization.

## 🏗️ Core Architecture

### Frontend (React + Web3)
- **Web3 Integration**
  - Wallet connection (Web3Modal)
  - Token balance display
  - Transaction handling
- **Code Editor**
  - Monaco Editor integration
  - Syntax highlighting for multiple languages
  - Code completion and IntelliSense
- **User Interface**
  - Responsive design
  - Dark/light theme support
  - Customizable layout

### Backend (Node.js + Express)
- **Authentication**
  - Wallet-based auth
  - JWT token management
- **API Services**
  - Smart contract interaction
  - Feature access verification
  - Rewards distribution
- **Database**
  - User profiles
  - Project storage
  - Transaction history

### Smart Contracts (Solidity)
- **BROskiToken (ERC-20)**
  - Token minting and burning
  - Transfer and approval
  - Pausable transfers
- **FeatureGate**
  - Access control based on token holdings
  - Feature whitelisting
  - Admin controls
- **BROskiPass (ERC-721)**
  - NFT-based premium features
  - Transferable access passes
  - Tiered benefits

## 🔄 Data Flow

1. User connects wallet to the application
2. System verifies token balance and feature access
3. User interacts with IDE features
4. Actions are validated against access rules
5. Rewards are distributed for qualifying activities

## 🔒 Security Model

- **Wallet Integration**
  - No private key storage
  - All transactions require user approval
  - Session management
- **Smart Contract Security**
  - Access control modifiers
  - Reentrancy protection
  - Emergency pause functionality
- **Data Protection**
  - Encrypted storage
  - Secure API endpoints
  - Rate limiting

## 📦 Data Model

```json
{
  "user": {
    "id": "0x123...abc",
    "username": "web3dev",
    "walletAddress": "0x123...abc",
    "xp": 3420,
    "brokski_coins": 1250,
    "streak": 14,
    "achievements": [],
    "unlocked_modes": ["hypercode_v2", "minimalflow"],
    "current_mode": "gamercode",
    "code_files": [
      {"id": "f1", "name": "main.js", "content": "...", "created": "2025-12-24"}
    ]
  },
  "shop": {
    "modes": [
      {"id": "gamercode", "name": "GamerCode", "cost": 500, "owned": false, "active": false},
      {"id": "minimalflow", "name": "MinimalFlow", "cost": 300, "owned": true, "active": false},
      {"id": "quantumviz", "name": "QuantumViz", "cost": 750, "owned": false, "active": false},
      {"id": "collabpro", "name": "CollabPro", "cost": 600, "owned": false, "active": false}
    ],
    "cosmetics": [
      {"id": "pet_dragon", "name": "Dragon Pet", "cost": 200, "owned": false},
      {"id": "font_dyslexic", "name": "OpenDyslexic", "cost": 0, "owned": true},
      {"id": "theme_neon", "name": "Neon Theme", "cost": 150, "owned": false}
    ]
  }
}
```

---

## SHOP SYSTEM:

### IDE Modes (Add-ons):

| Mode | Cost | Description | Unlocked By |
|------|------|-------------|-------------|
| **HyperCode-V2** | FREE | 3-column classic (default) | Start |
| **GamerCode** | 500 BROski$ | RPG mode: XP/pet/quests | Purchase OR reach Level 5 |
| **MinimalFlow** | 300 BROski$ | Distraction-free hyperfocus | Purchase OR reach Level 3 |
| **QuantumViz** | 750 BROski$ | Quantum circuits + DNA viz | Purchase OR reach Level 8 |
| **CollabPro** | 600 BROski$ | Real-time multiplayer | Purchase OR invite 3 friends |

### Cosmetic Add-ons:

| Item | Cost | Effect |
|------|------|--------|
| **Pet Skins** | 100–300 BROski$ | Dragon, Cat, Phoenix, Void Beast |
| **Themes** | 150–200 BROski$ | Neon, Retro 80s, Matrix, Light Mode |
| **Fonts** | FREE–100 BROski$ | OpenDyslexic (free), Monaco (100), Comic Code (150) |
| **Editor Skins** | 75 BROski$ | Dracula, Monokai, Nord, Solarized |
| **Particles** | 200 BROski$ | Code rain, matrix, fireflies, stars |

---

## EARNING BROski$ (Economy):

### Coding Activities:
- **Save Code**: +50 BROski$ (auto-save every 2s counts)
- **Run Code**: +25 BROski$ (if no errors), -10 if errors
- **Fix Bug**: +100 BROski$ (auto-detect: code shortened/error count decreased)
- **Daily Streak**: +100 BROski$ (code for 7 days = streak bonus)
- **Share Code**: +150 BROski$ (export + share link gets others to click)
- **Complete Quest**: +50–200 BROski$ (varies by quest)

### Bonuses:
- **First of the Day Bonus**: +50 BROski$ (code at least once)
- **Streak Multiplier**: +10% per streak day (day 5 = +10%, day 14 = +140%)
- **Level Milestone Bonus**: +500 BROski$ (every 10 levels)

---

## UI ARCHITECTURE:

### Always Visible:
1. **Top Bar**:
   - Level + XP bar
   - BROski$ balance (clickable → opens shop)
   - Current mode badge
   - Settings gear icon

2. **Main Editor** (center):
   - Core code editor (same for all modes)
   - Syntax highlighting
   - Execution output

3. **Mode-Specific Sidebar** (right):
   - Switches based on active mode
   - GamerCode: Pet + Quests
   - MinimalFlow: Hidden (toggle available)
   - QuantumViz: Circuit preview
   - CollabPro: User list + chat

### Modal/Overlay:
- **Shop Modal**: Browse & purchase modes/cosmetics
- **Settings Modal**: Font, theme, accessibility options
- **Achievements Modal**: Badges, stats

---

## MODE SWITCHING LOGIC:

### Flow:
1. User starts → **HyperCode-V2 mode** (default, free)
2. User earns 300 BROski$ → **Can buy MinimalFlow**
3. User activates MinimalFlow → **UI transforms** (same code, new layout)
4. User switches back → **Back to HyperCode-V2**
5. All code is **preserved** regardless of mode

### Key: **Modes are skins on the core engine, not separate apps!**

---

## IMPLEMENTATION STRATEGY:

### React Component Structure:
```
HyperCodeHub (Main App)
├── TopBar (Level, Coins, Mode Badge)
├── Editor (Universal Code Editor)
├── ModeSidebar (Conditional: GamerCode / MinimalFlow / QuantumViz / CollabPro)
├── Shop (Modal)
├── Settings (Modal)
└── Output (Execution results)
```

### State Management (localStorage):
```javascript
// All data persists in localStorage as JSON
{
  user: {...},
  shop: {...},
  settings: {...},
  files: {...}
}
```

### CSS Variables for Modes:
```css
/* Base theme vars */
--color-primary: #32b8c6;
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI';

/* Mode overrides */
@media[data-mode="gamercode"] {
  --show-gamification: true;
  --show-pet: true;
}

@media[data-mode="minimalflow"] {
  --sidebar-display: none;
  --font-size: 1.2em;
  --line-height: 2;
}
```

---

## MVP (MINIMUM VIABLE PRODUCT):

**What ships in v1.0:**

✅ Core IDE (editor + execution)
✅ HyperCode-V2 mode (default, free)
✅ GamerCode mode (purchasable)
✅ MinimalFlow mode (purchasable)
✅ BROski$ shop (buy modes + basic cosmetics)
✅ Earn coins from coding
✅ Persist data to localStorage
✅ Level/XP system
✅ Settings (font, theme, accessibility)

**Not in v1 (Phase 2+):**
- Real multiplayer (CollabPro – needs backend)
- QuantumViz (needs quantum simulation library)
- Advanced cosmetics (pets, particles)

---

## SUCCESS METRICS:

✅ **Single app**, **infinite modes** (scalable architecture)
✅ **Users earn coins** → **Users stay engaged**
✅ **Shop drives monetization** → **Sustainable business model**
✅ **Switching modes is instant** → **Try before you buy** mentality
✅ **All code preserved** → **Zero friction mode switching**

---

## THE PITCH:

**"HyperCode Hub: One IDE. Infinite Ways to Code."**

Think of it like:
- **Spotify**: One player, infinite playlists (modes)
- **Fortnite**: One game, infinite cosmetics (skins)
- **Discord**: One chat engine, infinite themes

**You buy the MODE that fits YOUR BRAIN. Same powerful core. Different vibes.**

That's the revolution. ✨

---
