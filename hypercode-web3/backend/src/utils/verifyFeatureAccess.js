/**
 * @file verifyFeatureAccess.js
 * @description Express middleware to verify feature access on backend.
 * Checks user has valid access before allowing deploy, AI calls, etc.
 * 
 * Usage:
 *   router.post('/deploy', verifyFeatureAccess('deploy-mainnet'), deployController);
 */

const { ethers } = require('ethers');

const FEATURE_GATE_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'featureName', type: 'string' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'canAccess',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' },
      { internalType: 'string', name: '', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Middleware factory: creates middleware for a specific feature.
 * @param {string} featureName - e.g., 'deploy-mainnet', 'ai-review'
 * @param {string} featureGateAddress - Contract address
 * @param {string} rpcUrl - RPC endpoint
 */
function verifyFeatureAccess(featureName, featureGateAddress, rpcUrl) {
  return async (req, res, next) => {
    try {
      // Get user address from request (from auth middleware or wallet connection)
      const userAddress = req.user?.address || req.body?.address || req.query?.address;

      if (!userAddress || !ethers.isAddress(userAddress)) {
        return res.status(400).json({
          error: 'Invalid or missing user address',
        });
      }

      // Check feature access via contract
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(featureGateAddress, FEATURE_GATE_ABI, provider);

      const [canAccess, reason] = await contract.canAccess(featureName, userAddress);

      if (!canAccess) {
        return res.status(403).json({
          error: 'Access denied',
          reason,
          feature: featureName,
        });
      }

      // Access granted, attach to request for controller
      req.featureAccess = {
        feature: featureName,
        userAddress,
        canAccess: true,
      };

      next();
    } catch (error) {
      console.error('Error verifying feature access:', error);
      return res.status(500).json({
        error: 'Failed to verify access',
        message: error.message,
      });
    }
  };
}

/**
 * Batch check: verify multiple features at once.
 * Used for initial IDE load to check all feature access in one call.
 */
async function checkMultipleFeaturesBackend(userAddress, featureNames, featureGateAddress, rpcUrl) {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(featureGateAddress, FEATURE_GATE_ABI, provider);

    const [accessList, reasons] = await contract.checkMultiple(featureNames, userAddress);

    const result = {};
    featureNames.forEach((name, index) => {
      result[name] = {
        canAccess: accessList[index],
        reason: reasons[index],
      };
    });

    return result;
  } catch (error) {
    console.error('Error checking multiple features:', error);
    throw error;
  }
}

module.exports = {
  verifyFeatureAccess,
  checkMultipleFeaturesBackend,
};
