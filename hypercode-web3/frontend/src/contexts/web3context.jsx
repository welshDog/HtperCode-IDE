// frontend/src/contexts/Web3Context.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import BROskiTokenABI from '../contracts/BROskiToken.json';
import FeatureGateABI from '../contracts/FeatureGate.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [broskiToken, setBroskiToken] = useState(null);
  const [featureGate, setFeatureGate] = useState(null);
  const [balance, setBalance] = useState('0');
  const [features, setFeatures] = useState([]);

  const CONTRACT_ADDRESSES = {
    broskiToken: '0x...', // Replace with your deployed address
    featureGate: '0x...'  // Replace with your deployed address
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const broskiToken = new ethers.Contract(
          CONTRACT_ADDRESSES.broskiToken,
          BROskiTokenABI,
          signer
        );
        const featureGate = new ethers.Contract(
          CONTRACT_ADDRESSES.featureGate,
          FeatureGateABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setBroskiToken(broskiToken);
        setFeatureGate(featureGate);

        // Load initial data
        await loadContractData(broskiToken, featureGate, accounts[0]);

        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return { success: true };
      } catch (error) {
        console.error('Error connecting wallet:', error);
        return { success: false, error };
      }
    } else {
      return { 
        success: false, 
        error: 'Please install MetaMask or another Web3 provider' 
      };
    }
  };

  const loadContractData = async (broskiToken, featureGate, account) => {
    try {
      // Load token balance
      const balance = await broskiToken.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));

      // Load available features
      // This is a simplified example - you might want to fetch feature data differently
      const features = [
        { id: 1, name: 'Premium Editor', required: 1000 },
        { id: 2, name: 'AI Code Completion', required: 5000 },
        { id: 3, name: 'Deployment Tools', required: 10000 }
      ];
      setFeatures(features);
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const checkFeatureAccess = async (featureId) => {
    if (!featureGate || !account) return false;
    try {
      return await featureGate.hasAccess(account, featureId);
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setAccount('');
      setBalance('0');
      setFeatures([]);
    } else {
      setAccount(accounts[0]);
      loadContractData(broskiToken, featureGate, accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum?.selectedAddress) {
      connectWallet();
    }

    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        broskiToken,
        featureGate,
        balance,
        features,
        connectWallet,
        checkFeatureAccess
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};