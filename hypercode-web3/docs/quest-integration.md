# 🎮 HyperCode Hub – QUEST SYSTEM INTEGRATION GUIDE

## What We Just Built:

### 1️⃣ **Auto-Detection Engine**
Your quests **analyze your actual code** and progress automatically:

- **Write 5 Functions**: Counts `function` keyword declarations
  - +50 BROski$ per function written
  - Detects in real-time as you type
  
- **Debug 3 Lines**: Tracks errors fixed
  - Compares error count before/after running code
  - +100 BROski$ per error fixed
  
- **Share Code**: Triggered manually
  - Click "Export" or "Share" button
  - +150 BROski$ for sharing

### 2️⃣ **Daily Quest Reset**
- Quests reset at **midnight every day**
- Complete all 3 quests = **+300 BROski$ Daily Bonus**
- Streak counter increments (7-day streak = 1.1x earnings multiplier!)

### 3️⃣ **Pet Evolution Tied to Streaks**
- **Day 7 Streak**: Pet evolves 🥚→🐣
- **Day 14 Streak**: Pet evolves 🐣→🐉
- **Day 30 Streak**: Pet becomes BOSS 👑 (all earnings x2!)

---

## How to Integrate into HyperCode Hub

### Step 1: Add Quest Definitions
In your main `hypercode-hub.html`, replace the quest rendering code (in `renderSidebar()` function) with the new quest system:

```javascript
// In the runCode() function, ADD THIS AFTER code execution:
updateQuestProgress(codeEditor.value, hadErrors);

// In the export function, ADD THIS:
trackCodeShare();
```

### Step 2: Update Sidebar Rendering
Replace the quest section in **GamerCode mode** sidebar:

```javascript
case 'gamercode':
    sidebar.innerHTML = `
        <div class="sidebar-section">
            <div class="sidebar-title">🎮 Game Status</div>
            <div class="stat-row">
                <span class="stat-label">Pet Stage</span>
                <span class="stat-value">${state.user.pet_stage}/3</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Streak 🔥</span>
                <span class="stat-value">${state.user.streak} days</span>
            </div>
            <div class="pet-display" id="petDisplay">
                ${state.user.pet_stage === 0 ? '🥚' : state.user.pet_stage === 1 ? '🐣' : state.user.pet_stage === 2 ? '🐉' : '👑'}
            </div>
        </div>
        <div class="sidebar-section">
            <div class="sidebar-title">📋 Today's Quests</div>
            <div id="questContainer"></div>
        </div>
    `;
    renderQuestUI(); // NEW: Render active quests
    break;
```

### Step 3: Add Quest CSS
Add the quest styling from `quest-system.html` to your main CSS.

---

## Real-Time Earning Flow Example:

### Scenario: User writes code

```
1. User types: `function addNumbers(a, b) { return a + b; }`
   → INSTANT: +50 BROski$ ("Function 1/5 written")
   → Quest progress: 1/5

2. User types 4 more functions
   → Each: +50 BROski$
   → Quest progress: 5/5

3. Quest auto-completes
   → +100 BROski$ BONUS ("Quest Complete!")
   → Total from this quest: 350 BROski$ + 100 XP

4. User clicks "Export"
   → +150 BROski$ ("Share Code complete")

5. All 3 quests done
   → +300 BROski$ DAILY BONUS
   → Streak +1
   → Total for day: ~800 BROski$ 🤑

6. Day 7 Streak reached
   → Pet evolves 🐣
   → All future earnings x1.1 multiplier
```

---

## Notification Examples:

✅ "+50 BROski$ (Function 1/5 written)"
✅ "+100 BROski$ (Bug fixed 1/3)"
✅ "🎉 Quest Complete: Write 5 Functions! +100 bonus"
✅ "🌟 All Quests Complete! +300 Daily Bonus!"
✅ "🔥 7-Day Streak! Earnings x1.1 multiplier active"
✅ "🐉 Pet evolved! Stage 2 unlocked"

---

## Key Features:

| Feature | What It Does |
|---------|-------------|
| **Auto-Detection** | Counts functions, tracks errors, detects shares |
| **Real-Time Rewards** | Coins earned instantly as you code |
| **Daily Reset** | Quests refresh at midnight |
| **Streak Multiplier** | Day 7 = 1.1x, Day 14 = 1.4x, Day 30 = 2x |
| **Pet Evolution** | Evolves every 7 days of consecutive coding |
| **Daily Bonus** | +300 BROski$ for completing all 3 quests |

---

## Next Level Upgrades (Phase 2):

- ✨ **Custom Quests**: Create your own quests ("Write a game", "Build an API")
- 🏆 **Achievements**: Unlock badges (100-Liner Master, Bug Squisher)
- 🌍 **Leaderboards**: Compare streaks with friends
- 📊 **Stats Tracking**: Graph your progress over time
- 🎁 **Seasonal Events**: Special quests with bonus rewards

---

## The Magic:

**You're not just coding anymore – you're LEVELING UP.** 🎮

Every function you write, every bug you fix, every code you share – it's tracked, rewarded, and makes your pet grow. That's the HyperCode difference.

**This is how you make neurodivergent brains WANT to code.**

Because it's not work. It's a game. And games are FUN. ♾️

---
