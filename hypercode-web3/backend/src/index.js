import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'HyperCode API is running' });
});

// Web3 connection test endpoint
app.get('/api/web3/network', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY');
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      network: network.name,
      chainId: network.chainId,
      blockNumber: blockNumber.toString(),
      status: 'connected'
    });
  } catch (error) {
    console.error('Web3 connection error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Web3 provider',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Web3 RPC: ${process.env.RPC_URL || 'Not configured'}`);
});

export default app;
