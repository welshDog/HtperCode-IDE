/**
 * @file deployRewardSystem.js
 * @description Backend service to track deployments + award BROski$ tokens.
 * Wire this into your IDE's deploy endpoint.
 */

const { ethers } = require('ethers');
const db = require('./database'); // Your DB client

const BROSKI_TOKEN_ADDRESS = process.env.BROSKI_TOKEN_ADDRESS;
const REWARD_WALLET = process.env.REWARD_WALLET_ADDRESS; // Treasury wallet
const RPC_URL = process.env.RPC_URL;

const DEPLOY_REWARDS = {
  testnet: 10,           // 10 BROski$
  mainnet: 50,           // 50 BROski$
  multiChain: 100,       // 100 BROski$ (3+ chains)
  firstDeploy: 500,      // 500 BROski$ (one-time bonus)
};

/**
 * Track a deployment and award BROski$.
 * Call this AFTER a successful contract deployment.
 *
 * @param {string} userAddress - Dev's wallet address
 * @param {string} contractAddress - Deployed contract address
 * @param {string} chainName - 'mainnet', 'polygon', 'arbitrum', etc.
 * @param {string} txHash - Deployment transaction hash
 */
async function rewardDeployment(userAddress, contractAddress, chainName, txHash) {
  try {
    // Determine reward amount
    let rewardAmount = 0;
    let rewardType = 'standard';

    // Check if testnet or mainnet
    const isMainnet = ['mainnet', 'ethereum'].includes(chainName.toLowerCase());
    rewardAmount = isMainnet ? DEPLOY_REWARDS.mainnet : DEPLOY_REWARDS.testnet;

    // Check if user's first deploy (bonus)
    const existingDeploys = await db.query(
      'SELECT COUNT(*) as count FROM deployments WHERE user_address = ?',
      [userAddress]
    );

    if (existingDeploys[0].count === 0) {
      rewardAmount = DEPLOY_REWARDS.firstDeploy;
      rewardType = 'first_deploy';
    }

    // Check if multi-chain (deployed same contract to 3+ chains in past 7 days)
    const recentContracts = await db.query(
      `SELECT COUNT(DISTINCT chain) as chainCount 
       FROM deployments 
       WHERE user_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userAddress]
    );

    if (recentContracts[0].chainCount >= 3) {
      rewardAmount = DEPLOY_REWARDS.multiChain;
      rewardType = 'multi_chain';
    }

    // Save deployment record to DB
    await db.query(
      `INSERT INTO deployments 
       (user_address, contract_address, chain, tx_hash, reward_amount, reward_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userAddress, contractAddress, chainName, txHash, rewardAmount, rewardType]
    );

    // Transfer BROski$ from reward wallet to user
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const rewardWallet = new ethers.Wallet(process.env.REWARD_WALLET_PRIVATE_KEY, provider);

    // Minimal ERC20 transfer ABI
    const erc20ABI = [
      'function transfer(address to, uint256 amount) public returns (bool)',
    ];

    const tokenContract = new ethers.Contract(BROSKI_TOKEN_ADDRESS, erc20ABI, rewardWallet);
    const tx = await tokenContract.transfer(
      userAddress,
      ethers.parseEther(rewardAmount.toString())
    );

    await tx.wait();

    // Log the reward
    console.log(`✓ Rewarded ${rewardAmount} BROSKI to ${userAddress} for ${chainName} deploy`);

    // Emit event (so frontend can celebrate)
    return {
      success: true,
      rewardAmount,
      rewardType,
      txHash: tx.hash,
      message: `🎉 +${rewardAmount} BROski$ earned!`,
    };
  } catch (error) {
    console.error('Error rewarding deployment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process contribution rewards (called manually by team or webhook from GitHub).
 *
 * @param {string} userAddress - Dev's wallet
 * @param {string} contributionType - 'pr_merge', 'code_review', 'bug_bounty', 'tutorial', etc.
 * @param {string} reference - PR link, issue link, blog URL, etc.
 * @param {number} customAmount - Override default reward if needed
 */
async function rewardContribution(userAddress, contributionType, reference, customAmount = null) {
  try {
    const CONTRIBUTION_REWARDS = {
      pr_merge: 100,
      code_review: 50,
      bug_bounty_critical: 1000,
      bug_bounty_medium: 500,
      bug_bounty_minor: 100,
      tutorial: 500,
      youtube_video: 1000,
      moderation: 100,
      translation: 300,
    };

    const rewardAmount = customAmount || CONTRIBUTION_REWARDS[contributionType] || 0;

    if (rewardAmount === 0) {
      return { success: false, error: 'Unknown contribution type' };
    }

    // Save to DB
    await db.query(
      `INSERT INTO contributions 
       (user_address, contribution_type, reference, reward_amount, approved_by, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userAddress, contributionType, reference, rewardAmount, process.env.ADMIN_ADDRESS]
    );

    // Transfer BROSKI
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const rewardWallet = new ethers.Wallet(process.env.REWARD_WALLET_PRIVATE_KEY, provider);

    const erc20ABI = ['function transfer(address to, uint256 amount) public returns (bool)'];
    const tokenContract = new ethers.Contract(BROSKI_TOKEN_ADDRESS, erc20ABI, rewardWallet);

    const tx = await tokenContract.transfer(
      userAddress,
      ethers.parseEther(rewardAmount.toString())
    );

    await tx.wait();

    console.log(`✓ Rewarded ${rewardAmount} BROSKI for ${contributionType}`);

    return {
      success: true,
      rewardAmount,
      message: `🎉 +${rewardAmount} BROSKI for your contribution!`,
    };
  } catch (error) {
    console.error('Error rewarding contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's deployment stats + total BROSKI earned.
 */
async function getUserRewards(userAddress) {
  try {
    const deployments = await db.query(
      'SELECT COUNT(*) as total, SUM(reward_amount) as earned FROM deployments WHERE user_address = ?',
      [userAddress]
    );

    const contributions = await db.query(
      'SELECT COUNT(*) as total, SUM(reward_amount) as earned FROM contributions WHERE user_address = ?',
      [userAddress]
    );

    const totalEarned = (deployments[0].earned || 0) + (contributions[0].earned || 0);

    return {
      deployments: deployments[0].total || 0,
      deploymentEarnings: deployments[0].earned || 0,
      contributions: contributions[0].total || 0,
      contributionEarnings: contributions[0].earned || 0,
      totalEarned,
    };
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return null;
  }
}

/**
 * Leaderboard: Top 10 deployers this month.
 */
async function getLeaderboard(timeframe = 'month') {
  try {
    const dateFilter =
      timeframe === 'week'
        ? 'DATE_SUB(NOW(), INTERVAL 7 DAY)'
        : 'DATE_SUB(NOW(), INTERVAL 30 DAY)';

    const leaderboard = await db.query(
      `SELECT 
        user_address, 
        COUNT(*) as deployments, 
        SUM(reward_amount) as total_earned
       FROM deployments 
       WHERE created_at > ${dateFilter}
       GROUP BY user_address 
       ORDER BY total_earned DESC 
       LIMIT 10`
    );

    return leaderboard.map((row, index) => ({
      rank: index + 1,
      address: row.user_address,
      deployments: row.deployments,
      earned: row.total_earned,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊',
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

module.exports = {
  rewardDeployment,
  rewardContribution,
  getUserRewards,
  getLeaderboard,
};
