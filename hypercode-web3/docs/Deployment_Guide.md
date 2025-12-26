# HyperCode Web3 IDE - Deployment Guide

## 🚀 Quick Start

This guide provides instructions for deploying the HyperCode Web3 IDE with BROSKI token integration.

## Project Structure

```
hypercode-web3/
├── contracts/           # Smart contracts
│   └── src/             # Solidity source files
├── frontend/            # React frontend
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # React contexts
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utility libraries
├── backend/             # Node.js backend
│   └── src/
│       └── utils/       # Utility functions
├── scripts/             # Deployment and utility scripts
└── docs/                # Documentation
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Hardhat
- MetaMask or other Web3 wallet

## Phase 1: Smart Contract Deployment

### 1. Install Dependencies

```bash
# Install project dependencies
npm install

# Install contract dependencies
cd contracts
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root with the following variables:

```env
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### 3. Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Or deploy to testnet
npx hardhat run scripts/deploy.js --network goerli
```

### 4. Verify Contracts

```bash
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS "Constructor Argument 1"
```

Copy these files into `contracts/`:
- `BROskiToken.sol`
- `BROskiPass.sol`
- `FeatureGate.sol`

### 3. Create Deployment Script

Save as `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying BROski$ ecosystem...");

  // 1. Deploy BROskiToken
  const BROskiToken = await hre.ethers.getContractFactory("BROskiToken");
  const broskiToken = await BROskiToken.deploy();
  await broskiToken.waitForDeployment();
  const tokenAddr = await broskiToken.getAddress();
  console.log("✓ BROskiToken deployed:", tokenAddr);

  // 2. Deploy BROskiPass
  // Treasury is where payments go (e.g., your wallet)
  const treasuryAddr = process.env.TREASURY_ADDRESS || (await hre.ethers.provider.getSigner()).address;
  
  const BROskiPass = await hre.ethers.getContractFactory("BROskiPass");
  const broskiPass = await BROskiPass.deploy(
    tokenAddr,
    process.env.USDC_ADDRESS || "0x0000000000000000000000000000000000000000", // Update with real USDC
    treasuryAddr
  );
  await broskiPass.waitForDeployment();
  const passAddr = await broskiPass.getAddress();
  console.log("✓ BROskiPass deployed:", passAddr);

  // 3. Deploy FeatureGate
  const FeatureGate = await hre.ethers.getContractFactory("FeatureGate");
  const featureGate = await FeatureGate.deploy();
  await featureGate.waitForDeployment();
  const gateAddr = await featureGate.getAddress();
  console.log("✓ FeatureGate deployed:", gateAddr);

  // 4. Setup gates in FeatureGate
  const tx1 = await featureGate.createGate(
    "deploy-testnet",
    0, // TOKEN_BALANCE
    tokenAddr,
    hre.ethers.parseEther("10") // 10 BROski$
  );
  console.log("✓ Gate 'deploy-testnet' created");

  const tx2 = await featureGate.createGate(
    "deploy-mainnet",
    1, // NFT_OWNERSHIP
    passAddr,
    1 // at least 1 NFT
  );
  console.log("✓ Gate 'deploy-mainnet' created");

  const tx3 = await featureGate.createGate(
    "ai-review",
    1, // NFT_OWNERSHIP
    passAddr,
    1
  );
  console.log("✓ Gate 'ai-review' created");

  // 5. Save addresses to .env
  console.log("\n📝 Add to your .env:");
  console.log(`BROSKI_TOKEN_ADDRESS=${tokenAddr}`);
  console.log(`BROSKI_PASS_ADDRESS=${passAddr}`);
  console.log(`FEATURE_GATE_ADDRESS=${gateAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 4. Deploy to Testnet (Sepolia)

```bash
# Set .env
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="your_wallet_private_key"

# Deploy
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia TOKEN_ADDRESS
npx hardhat verify --network sepolia PASS_ADDRESS TOKEN_ADDRESS USDC_ADDRESS TREASURY_ADDRESS
npx hardhat verify --network sepolia GATE_ADDRESS
```

---

## Phase 2: Frontend Integration

### 1. Add Contract Addresses to Config

Create `frontend/src/config/contracts.js`:

```javascript
export const CONTRACT_ADDRESSES = {
  BROSKI_TOKEN: process.env.REACT_APP_BROSKI_TOKEN_ADDRESS,
  BROSKI_PASS: process.env.REACT_APP_BROSKI_PASS_ADDRESS,
  FEATURE_GATE: process.env.REACT_APP_FEATURE_GATE_ADDRESS,
};

export const FEATURES = {
  DEPLOY_TESTNET: 'deploy-testnet',
  DEPLOY_MAINNET: 'deploy-mainnet',
  AI_REVIEW: 'ai-review',
  MULTI_CHAIN: 'multi-chain-deploy',
};
```

### 2. Add .env Variables

`frontend/.env.local`:

```
REACT_APP_BROSKI_TOKEN_ADDRESS=0x...
REACT_APP_BROSKI_PASS_ADDRESS=0x...
REACT_APP_FEATURE_GATE_ADDRESS=0x...
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 3. Wire Up Hooks

In your IDE editor component (`EditorPage.jsx`):

```jsx
import { useAccount } from 'wagmi';
import { FeatureLock, FeatureLockButton } from '../components/FeatureLock';
import { useFeatureGateMultiple } from '../hooks/useFeatureGate';
import { CONTRACT_ADDRESSES, FEATURES } from '../config/contracts';

export function EditorPage() {
  const { address } = useAccount();
  const { features } = useFeatureGateMultiple(
    [FEATURES.DEPLOY_TESTNET, FEATURES.DEPLOY_MAINNET, FEATURES.AI_REVIEW],
    address,
    CONTRACT_ADDRESSES.FEATURE_GATE
  );

  return (
    <div className="editor-layout">
      {/* Code Editor */}
      <div className="editor-section">
        <MonacoEditor />
      </div>

      {/* Actions Panel */}
      <div className="actions-panel">
        {/* Deploy to Testnet - Basic gate */}
        <FeatureLock
          featureName={FEATURES.DEPLOY_TESTNET}
          featureGateAddress={CONTRACT_ADDRESSES.FEATURE_GATE}
        >
          <button onClick={deployTestnet}>Deploy to Testnet</button>
        </FeatureLock>

        {/* Deploy to Mainnet - Locked feature */}
        <FeatureLock
          featureName={FEATURES.DEPLOY_MAINNET}
          featureGateAddress={CONTRACT_ADDRESSES.FEATURE_GATE}
        >
          <button onClick={deployMainnet}>Deploy to Mainnet</button>
        </FeatureLock>

        {/* AI Review - Button variant */}
        <FeatureLockButton
          featureName={FEATURES.AI_REVIEW}
          featureGateAddress={CONTRACT_ADDRESSES.FEATURE_GATE}
          onClick={openAIReview}
        >
          🤖 AI Review
        </FeatureLockButton>
      </div>

      {/* Show user what they can access */}
      <div className="feature-status">
        <h4>Your Access</h4>
        <ul>
          {Object.entries(features).map(([name, { canAccess, reason }]) => (
            <li key={name}>
              <span>{canAccess ? '✅' : '❌'}</span>
              <span>{name}</span>
              {!canAccess && <small>{reason}</small>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## Phase 3: Backend Integration

### 1. Setup Express Routes

Create `backend/src/routes/deploy.js`:

```javascript
const express = require('express');
const router = express.Router();
const { verifyFeatureAccess } = require('../middleware/verifyFeatureAccess');

const FEATURE_GATE = process.env.FEATURE_GATE_ADDRESS;
const RPC_URL = process.env.RPC_URL;

/**
 * POST /api/deploy/testnet
 * No access check needed (free for all)
 */
router.post('/testnet', async (req, res) => {
  try {
    const { contract, chainId } = req.body;
    // Deploy logic here
    res.json({ success: true, txHash: '0x...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/deploy/mainnet
 * Requires: deploy-mainnet access (BROskiPass)
 */
router.post(
  '/mainnet',
  verifyFeatureAccess('deploy-mainnet', FEATURE_GATE, RPC_URL),
  async (req, res) => {
    try {
      const { contract, chainId } = req.body;
      const userAddress = req.featureAccess.userAddress;
      
      // Only verified users reach here
      // Deploy to mainnet
      res.json({ success: true, txHash: '0x...' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
```

### 2. Wire Routes

In `backend/src/app.js`:

```javascript
const deployRoutes = require('./routes/deploy');

app.use('/api/deploy', deployRoutes);
```

### 3. Add .env

`backend/.env`:

```
BROSKI_TOKEN_ADDRESS=0x...
BROSKI_PASS_ADDRESS=0x...
FEATURE_GATE_ADDRESS=0x...
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

---

## Phase 4: Testing

### 1. Test Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Open http://localhost:3000 → should show locked features
```

### 2. Test with Testnet Contract

1. Deploy to Sepolia (see Phase 1)
2. Mint some BROski$ to your test wallet
3. Buy a BROskiPass
4. Verify deploy button unlocks

### 3. Integration Tests

Create `tests/featureGate.test.js`:

```javascript
const { ethers } = require("hardhat");

describe("FeatureGate", function () {
  let featureGate, broskiToken, broskiPass;
  let owner, user;

  before(async () => {
    [owner, user] = await ethers.getSigners();
    
    // Deploy contracts
    const BROskiToken = await ethers.getContractFactory("BROskiToken");
    broskiToken = await BROskiToken.deploy();

    const BROskiPass = await ethers.getContractFactory("BROskiPass");
    broskiPass = await BROskiPass.deploy(
      broskiToken.address,
      "0x0000000000000000000000000000000000000000",
      owner.address
    );

    const FeatureGate = await ethers.getContractFactory("FeatureGate");
    featureGate = await FeatureGate.deploy();
  });

  it("should deny access without NFT", async () => {
    await featureGate.createGate("test-gate", 1, broskiPass.address, 1);
    const [access, reason] = await featureGate.canAccess("test-gate", user.address);
    expect(access).to.be.false;
  });

  it("should allow access with NFT", async () => {
    // User mints pass
    await broskiToken.mint(user.address, ethers.parseEther("10000"));
    await broskiToken.connect(user).approve(broskiPass.address, ethers.parseEther("10000"));
    await broskiPass.connect(user).mintWithBROski();

    // Check access
    const [access, reason] = await featureGate.canAccess("test-gate", user.address);
    expect(access).to.be.true;
  });
});
```

Run tests:
```bash
npx hardhat test
```

---

## Phase 5: Launch Checklist

- [ ] Contracts deployed to testnet (Sepolia)
- [ ] Contracts verified on Etherscan
- [ ] Frontend wired with contract addresses
- [ ] Backend routes protected with `verifyFeatureAccess`
- [ ] Test mint BROskiPass and confirm deploy unlocks
- [ ] Set up wallet treasury for payments
- [ ] Create initial BROski$ supply and airdrop to early users
- [ ] Launch docs/FAQ for users
- [ ] Create video tutorial "How to Get BROskiPass"
- [ ] Deploy to mainnet (Ethereum, Polygon, Arbitrum)
- [ ] Announce 🎉

---

## Environment Variables Checklist

**Frontend (.env.local)**:
```
REACT_APP_BROSKI_TOKEN_ADDRESS=0x...
REACT_APP_BROSKI_PASS_ADDRESS=0x...
REACT_APP_FEATURE_GATE_ADDRESS=0x...
REACT_APP_RPC_URL=...
```

**Backend (.env)**:
```
BROSKI_TOKEN_ADDRESS=0x...
BROSKI_PASS_ADDRESS=0x...
FEATURE_GATE_ADDRESS=0x...
RPC_URL=...
TREASURY_ADDRESS=0x... (where payments go)
PRIVATE_KEY=... (for contract ownership)
```

---

**You're locked & loaded, bro. 🚀 Ready to deploy BROski$?**
