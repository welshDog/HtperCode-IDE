# HyperCode Web3 IDE - Developer Documentation

## 📋 Project Overview

HyperCode Web3 IDE is a decentralized development environment with integrated Web3 functionality, enabling developers to build, test, and deploy smart contracts while earning BROSKI tokens through coding activities. The platform features a token-based economy with feature gating, staking, and governance mechanisms.

## 🚀 Current Status (Dec 2025)

### ✅ Completed
- Web3 wallet integration with Web3Modal
- BROskiToken (ERC-20) implementation with minting/burning
- FeatureGate contract for access control
- Basic IDE interface with Monaco Editor
- Initial project structure and documentation

### 🚧 In Development
- BROskiPass NFT contract
- Staking and rewards system
- Token faucet for testnet
- Transaction history and activity feed
- Enhanced developer tools

## 🌟 Key Features

### Core Functionality
- 🔐 Multi-chain Web3 wallet integration (Ethereum, Polygon, BSC)
- 💻 Advanced code editor with Solidity/JavaScript support
- 💰 BROSKI token integration for platform features
- 🔒 Feature gating based on token holdings/NFT ownership
- 🏦 Built-in token swap and staking interfaces

### Developer Tools
- 📦 One-click contract deployment
- 🧪 Integrated testing framework
- 🔍 Contract verification
- 📊 Transaction analytics
- 🔗 Multi-chain support

## 🛠 Tech Stack

### Frontend
- React 18 with Hooks
- Vite 4
- Ethers.js 5.7.2
- Web3Modal 1.9.10
- TailwindCSS 3.3.0
- Monaco Editor
- MUI Components

### Backend
- Node.js 18+
- Express 4.18.2
- Web3.js 4.0.3
- Hardhat 2.12.0
- IPFS (for decentralized storage)

### Smart Contracts
- Solidity ^0.8.20
- OpenZeppelin Contracts 4.8.0
- Hardhat + Hardhat-deploy
- OpenZeppelin Upgrades (for upgradeable contracts)

## 🏗 Project Structure (Updated)

```
hypercode-web3/
├── frontend/                  # React frontend application
│   ├── public/                # Static assets
│   └── src/
│       ├── assets/            # Images, fonts, etc.
│       ├── components/        # Reusable UI components
│       │   ├── common/        # Common UI elements
│       │   ├── wallet/        # Wallet connection components
│       │   ├── editor/        # Code editor components
│       │   └── features/      # Feature-specific components
│       │
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       ├── services/          # API and Web3 services
│       ├── styles/            # Global styles and themes
│       ├── utils/             # Utility functions
│       └── App.jsx            # Main app component
│
├── contracts/                 # Smart contracts
│   ├── src/                   # Solidity source files
│   │   ├── BROskiToken.sol    # BROSKI ERC-20 token
│   │   ├── FeatureGate.sol    # Access control system
│   │   └── BROskiPass.sol     # NFT-based premium features
│   ├── test/                  # Test files
│   ├── scripts/               # Deployment scripts
│   └── hardhat.config.js      # Hardhat configuration
│
├── docs/                      # Documentation
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── INTEGRATION.md         # Integration guide
│
└── scripts/                   # Utility scripts
    ├── deploy/                # Deployment scripts
    ├── test/                  # Test scripts
    └── utils/                 # Helper scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm 9+
- Git
- MetaMask or Web3 wallet browser extension
- Hardhat (for local development)
- IPFS (for decentralized storage)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hypercode-web3/ide.git
   cd ide
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install contract dependencies
   cd ../contracts
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp contracts/.env.example contracts/.env
   
   # Update with your configuration
   # - INFURA_API_KEY for Web3 provider
   # - PRIVATE_KEY for deployment
   # - ETHERSCAN_API_KEY for verification
   ```

4. **Start local development**
   ```bash
   # In separate terminals:
   
   # Terminal 1: Start local blockchain
   npx hardhat node
   
   # Terminal 2: Deploy contracts
   npx hardhat run scripts/deploy.js --network localhost
   
   # Terminal 3: Start frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000 in your browser
   - Connect your wallet (MetaMask on Localhost:8545)
   - Start coding!

### Running Locally

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

3. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fixes

### Commit Message Convention

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or tooling changes

### Code Style
- ESLint & Prettier configured
- Follow Airbnb JavaScript Style Guide
- 2-space indentation
- Single quotes for strings
- Semicolons at the end of statements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the HyperCode Team
- Special thanks to all contributors
- Inspired by the Web3 developer community
