/**
 * @file useFeatureGate.js
 * @description React hook to check if a user can access IDE features.
 * Calls FeatureGate contract + caches results for UX speed.
 */

import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { ethers } from 'ethers';

// ABI for FeatureGate contract (canAccess function)
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
  {
    inputs: [
      { internalType: 'string[]', name: 'featureNames', type: 'string[]' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'checkMultiple',
    outputs: [
      { internalType: 'bool[]', name: '', type: 'bool[]' },
      { internalType: 'string[]', name: '', type: 'string[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Hook: Check a single feature access
 * Usage: const { canAccess, reason, isLoading } = useFeatureGate('deploy-mainnet', userAddress);
 */
export function useFeatureGate(featureName, userAddress, contractAddress) {
  const [canAccess, setCanAccess] = useState(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userAddress || !contractAddress || !featureName) {
      setIsLoading(false);
      return;
    }

    async function checkAccess() {
      try {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, FEATURE_GATE_ABI, provider);

        const [access, msg] = await contract.canAccess(featureName, userAddress);
        setCanAccess(access);
        setReason(msg);
        setError(null);
      } catch (err) {
        console.error('Error checking feature gate:', err);
        setError(err.message);
        setCanAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [featureName, userAddress, contractAddress]);

  return { canAccess, reason, isLoading, error };
}

/**
 * Hook: Check multiple features at once
 * Usage: const { features, isLoading } = useFeatureGateMultiple(['deploy-mainnet', 'ai-review'], userAddress);
 * Returns: { deploy-mainnet: true, ai-review: false }
 */
export function useFeatureGateMultiple(featureNames, userAddress, contractAddress) {
  const [features, setFeatures] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userAddress || !contractAddress || featureNames.length === 0) {
      setIsLoading(false);
      return;
    }

    async function checkAccess() {
      try {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, FEATURE_GATE_ABI, provider);

        const [accessList, reasons] = await contract.checkMultiple(featureNames, userAddress);

        // Build feature map
        const featureMap = {};
        featureNames.forEach((name, index) => {
          featureMap[name] = {
            canAccess: accessList[index],
            reason: reasons[index],
          };
        });

        setFeatures(featureMap);
        setError(null);
      } catch (err) {
        console.error('Error checking multiple gates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [featureNames, userAddress, contractAddress]);

  return { features, isLoading, error };
}
