# HyperCode Web3 IDE - Rewards Integration Guide

## 🌟 Overview

This guide explains how the BROSKI token rewards system is integrated into the HyperCode IDE, including feature gating, quests, and rewards distribution.

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Smart          │     │  Backend        │     │  Frontend       │
│  Contracts      │◄───►│  Services       │◄───►│  Components     │
│  - BROskiToken  │     │  - Auth         │     │  - WalletConnect│
│  - FeatureGate  │     │  - Rewards      │     │  - RewardPanel  │
│  - BROskiPass   │     │  - Feature Check│     │  - FeatureLock  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🔌 Backend Integration

### 1. Feature Access Verification Middleware

**File**: `backend/src/middleware/verifyFeatureAccess.js`

```javascript
const { FeatureGate } = require('@hypercode/web3-contracts');

async function verifyFeatureAccess(featureName, userAddress) {
  const featureGate = await FeatureGate.deployed();
  const canAccess = await featureGate.canAccess(featureName, userAddress);
  return canAccess;
}

// Middleware for Express routes
function checkFeatureAccess(featureName) {
  return async (req, res, next) => {
    try {
      const userAddress = req.user?.address;
      if (!userAddress) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const hasAccess = await verifyFeatureAccess(featureName, userAddress);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Insufficient BROSKI balance for this feature',
          required: await getFeatureRequirement(featureName)
        });
      }
      next();
    } catch (error) {
      console.error('Feature access check failed:', error);
      res.status(500).json({ error: 'Failed to verify feature access' });
    }
  };
}
```

### 2. Rewards Service

**File**: `backend/src/services/rewards.js`

```javascript
const BROSKI_TOKEN_ABI = require('@hypercode/web3-contracts/artifacts/BROskiToken.json');

class RewardsService {
  constructor(web3, tokenAddress) {
    this.web3 = web3;
    this.tokenContract = new web3.eth.Contract(BROSKI_TOKEN_ABI, tokenAddress);
  }

  async awardTokens(userAddress, amount, reason) {
    try {
      // Check if user has reached daily limit
      const canAward = await this.checkDailyLimit(userAddress, amount);
      if (!canAward) {
        throw new Error('Daily reward limit reached');
      }

      // Mint tokens to user
      await this.tokenContract.methods
        .mint(userAddress, amount)
        .send({ from: process.env.REWARDS_ADMIN });

      // Log reward
      await this.logReward({
        userAddress,
        amount,
        reason,
        timestamp: new Date().toISOString()
      });

      return { success: true, amount };
    } catch (error) {
      console.error('Failed to award tokens:', error);
      throw new Error('Failed to process reward');
    }
  }

  // ... other reward methods ...
}
```

    // Deploy contract to blockchain
    const deploymentResult = await deployToBlockchain(contract, chainId);
    const { contractAddress, txHash } = deploymentResult;

    // ✨ Award BROski$ for deployment
    const chainName = getChainName(chainId); // 'ethereum', 'polygon', etc.
    const reward = await rewardDeployment(userAddress, contractAddress, chainName, txHash);

    // Return success with reward info
    res.json({
      success: true,
      contractAddress,
      txHash,
      reward: reward.message, // "🎉 +50 BROski$ earned!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Add Rewards API Endpoints

**File**: `backend/src/routes/rewards.js`

```javascript
const express = require('express');
const { getUserRewards, getLeaderboard, rewardContribution } = require('../services/deployRewardSystem');

const router = express.Router();

/**
 * GET /api/rewards/:address
 * Get user's reward stats.
 */
router.get('/:address', async (req, res) => {
  try {
    const rewards = await getUserRewards(req.params.address);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rewards/leaderboard?timeframe=month
 * Get top deployers.
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const leaderboard = await getLeaderboard(timeframe);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rewards/contribution
 * (Admin only) Award BROski$ for contribution.
 */
router.post('/contribution', async (req, res) => {
  // Verify admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { userAddress, type, reference, customAmount } = req.body;
    const result = await rewardContribution(userAddress, type, reference, customAmount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Wire into app.js**:
```javascript
const rewardsRoutes = require('./routes/rewards');
app.use('/api/rewards', rewardsRoutes);
```

### 3. Add Quest Tracking

**File**: `backend/src/routes/quests.js`

```javascript
const express = require('express');
const db = require('./database');

const router = express.Router();

const QUESTS = [
  {
    id: 1,
    emoji: '🚀',
    title: 'First Blood',
    description: 'Deploy your first contract',
    type: 'first_deploy',
    required: 1,
    reward: 500,
  },
  {
    id: 2,
    emoji: '💪',
    title: 'Mainnet Master',
    description: 'Deploy to mainnet 10 times',
    type: 'mainnet_deploys',
    required: 10,
    reward: 250,
  },
  {
    id: 3,
    emoji: '🔥',
    title: 'Multi-Chain Warrior',
    description: 'Deploy to 3+ different blockchains',
    type: 'multi_chain',
    required: 3,
    reward: 300,
  },
  {
    id: 4,
    emoji: '🧠',
    title: 'AI Enthusiast',
    description: 'Use AI code review 5 times',
    type: 'ai_reviews',
    required: 5,
    reward: 100,
  },
  {
    id: 5,
    emoji: '💰',
    title: 'Diamond Hands',
    description: 'Hold 100+ BROski$ for 30 days',
    type: 'hodl',
    required: 30,
    reward: 150,
  },
];

/**
 * GET /api/quests
 * Get all quests for current user.
 */
router.get('/', async (req, res) => {
  try {
    const userAddress = req.user?.address;

    const questsWithProgress = await Promise.all(
      QUESTS.map(async (quest) => {
        const progress = await getQuestProgress(userAddress, quest.type);
        const completed = await isQuestCompleted(userAddress, quest.id);

        return {
          ...quest,
          progress,
          completed,
        };
      })
    );

    res.json(questsWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/quests/:questId/claim
 * Claim quest reward.
 */
router.post('/:questId/claim', async (req, res) => {
  try {
    const userAddress = req.user?.address;
    const questId = req.params.questId;
    const quest = QUESTS.find((q) => q.id === parseInt(questId));

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if already claimed
    const claimed = await isQuestCompleted(userAddress, questId);
    if (claimed) {
      return res.status(400).json({ error: 'Quest already claimed' });
    }

    // Check progress
    const progress = await getQuestProgress(userAddress, quest.type);
    if (progress < quest.required) {
      return res.status(400).json({ error: 'Quest not complete' });
    }

    // Award BROski$
    const { rewardDeployment } = require('../services/deployRewardSystem');
    await rewardDeployment(userAddress, null, 'quest', null); // Custom call

    // Mark as claimed
    await db.query(
      'INSERT INTO quest_claims (user_address, quest_id, claimed_at) VALUES (?, ?, NOW())',
      [userAddress, questId]
    );

    res.json({ success: true, message: `✓ Claimed quest #${questId}!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function getQuestProgress(userAddress, questType) {
  const queryMap = {
    first_deploy: `SELECT COUNT(*) as count FROM deployments WHERE user_address = ?`,
    mainnet_deploys: `SELECT COUNT(*) as count FROM deployments WHERE user_address = ? AND chain IN ('ethereum', 'mainnet')`,
    multi_chain: `SELECT COUNT(DISTINCT chain) as count FROM deployments WHERE user_address = ?`,
    ai_reviews: `SELECT COUNT(*) as count FROM ai_reviews WHERE user_address = ?`,
    hodl: `SELECT DATEDIFF(NOW(), min_hold_date) as count FROM user_hodl_tracking WHERE user_address = ? AND balance >= 100`,
  };

  const query = queryMap[questType];
  const result = await db.query(query, [userAddress]);
  return result[0]?.count || 0;
}

async function isQuestCompleted(userAddress, questId) {
  const result = await db.query(
    'SELECT 1 FROM quest_claims WHERE user_address = ? AND quest_id = ?',
    [userAddress, questId]
  );
  return result.length > 0;
}

module.exports = router;
```

---

## 🎨 Frontend Integration

### 1. Add RewardPanel to Dashboard

**File**: `frontend/src/pages/Dashboard.jsx`

```jsx
import React from 'react';
import { RewardPanel } from '../components/RewardPanel';
import { EditorPanel } from '../components/EditorPanel';

export function Dashboard() {
  return (
    <div className="dashboard-layout">
      <div className="main-content">
        <EditorPanel />
      </div>
      <aside className="sidebar">
        <RewardPanel />
      </aside>
    </div>
  );
}
```

### 2. Wire Deploy Button to Award Rewards

**File**: `frontend/src/components/DeployButton.jsx`

```jsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';

export function DeployButton({ contract, chainId }) {
  const { address } = useAccount();
  const [deploying, setDeploying] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  const handleDeploy = async () => {
    setDeploying(true);
    setRewardMessage('');

    try {
      // Call deploy endpoint
      const res = await fetch('/api/deploy/mainnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract,
          userAddress: address,
          chainId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Show reward message
        setRewardMessage(result.reward); // "🎉 +50 BROski$ earned!"

        // Celebrate! 🎉
        celebrateReward();
      }
    } catch (error) {
      console.error('Deploy failed:', error);
    } finally {
      setDeploying(false);
    }
  };

  const celebrateReward = () => {
    // Trigger confetti or celebration animation
    // (use react-confetti or similar library)
    console.log('🎉 Celebration triggered!');
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={deploying}>
        {deploying ? '⏳ Deploying...' : '🚀 Deploy to Mainnet'}
      </button>

      {rewardMessage && (
        <div className="reward-toast">
          <p>{rewardMessage}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Track AI Review Usage

**File**: `frontend/src/components/AIReviewButton.jsx`

```jsx
export function AIReviewButton({ code }) {
  const { address } = useAccount();
  const [reviewing, setReviewing] = useState(false);

  const handleReview = async () => {
    setReviewing(true);

    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userAddress: address,
        }),
      });

      const result = await res.json();
      // Show review results + confirm BROski$ was deducted if paid

      if (result.costBROski) {
        showNotification(`Used ${result.costBROski} BROski$ for review`);
      }
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setReviewing(false);
    }
  };

  return <button onClick={handleReview}>🤖 AI Review</button>;
}
```

---

## 🗄️ Database Schema

Create these tables in your DB:

```sql
-- Track deployments
CREATE TABLE deployments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_address VARCHAR(255) NOT NULL,
  contract_address VARCHAR(255),
  chain VARCHAR(50),
  tx_hash VARCHAR(255),
  reward_amount INT,
  reward_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_address),
  INDEX (created_at)
);

-- Track contributions
CREATE TABLE contributions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_address VARCHAR(255) NOT NULL,
  contribution_type VARCHAR(50),
  reference TEXT,
  reward_amount INT,
  approved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_address)
);

-- Track quest claims
CREATE TABLE quest_claims (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_address VARCHAR(255) NOT NULL,
  quest_id INT NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (user_address, quest_id),
  INDEX (user_address)
);

-- Track AI reviews
CREATE TABLE ai_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_address VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255),
  cost_broski INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_address)
);

-- Track hodl duration for quests
CREATE TABLE user_hodl_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_address VARCHAR(255) NOT NULL UNIQUE,
  balance INT,
  min_hold_date TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_address)
);
```

---

## 📦 Deployment Checklist

- [ ] Add `deployRewardSystem.js` to backend
- [ ] Create reward endpoints (`/api/rewards/*`, `/api/quests/*`)
- [ ] Wire deploy button to call reward function
- [ ] Add RewardPanel component to frontend
- [ ] Create database tables
- [ ] Set up reward wallet (with BROski$ balance)
- [ ] Test: Deploy contract → see "🎉 +50 BROski$" message
- [ ] Test: Check leaderboard shows deployment
- [ ] Test: Complete a quest → claim reward
- [ ] Go live! 🚀

---

## 💡 Next Steps

1. **Deploy to testnet first** (Sepolia) with test BROski$ rewards
2. **Invite early testers** to earn/spend BROSKI
3. **Monitor metrics**: active deployers, reward distribution, token velocity
4. **Iterate fast**: adjust reward amounts based on data
5. **Celebrate wins**: Post leaderboard + top earners on Twitter

You're building the demand engine now, bro. 🚀
