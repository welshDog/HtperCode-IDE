import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

// Web3Modal configuration
const providerOptions = {};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions,
});

export default function WalletConnect({ onConnect, onDisconnect, onBalanceUpdate }) {
  const [provider, setProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  // Connect to wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Open wallet modal and get provider
      const provider = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      
      // Get accounts
      const accounts = await web3Provider.listAccounts();
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      
      // Get balance
      const balance = await web3Provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      // Update state
      setProvider(provider);
      setWeb3Provider(web3Provider);
      setAccount(address);
      
      // Notify parent component
      onConnect(address, formattedBalance);
      
      // Subscribe to accounts change
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          onConnect(accounts[0], formattedBalance);
        }
      });
      
      // Subscribe to chainId change
      provider.on('chainChanged', () => {
        window.location.reload();
      });
      
      // Subscribe to disconnect
      provider.on('disconnect', (error) => {
        console.log('Provider disconnected:', error);
        disconnectWallet();
      });
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = async () => {
    if (provider && provider.close) {
      await provider.close();
    }
    
    if (web3Modal.cachedProvider) {
      web3Modal.clearCachedProvider();
    }
    
    setProvider(null);
    setWeb3Provider(null);
    setAccount('');
    
    // Notify parent component
    onDisconnect();
  };
  
  // Check if wallet is already connected
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
    
    return () => {
      // Cleanup event listeners
      if (provider && provider.removeAllListeners) {
        provider.removeAllListeners();
      }
    };
  }, []);
  
  return (
    <div className="wallet-connect">
      {!account ? (
        <button 
          onClick={connectWallet} 
          disabled={loading}
          className="connect-button"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <button 
          onClick={disconnectWallet}
          className="disconnect-button"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
