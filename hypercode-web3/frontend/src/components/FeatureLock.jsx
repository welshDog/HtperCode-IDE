/**
 * @file FeatureLock.jsx
 * @description React component to lock/unlock IDE features based on FeatureGate.
 * Shows a lock UI if user doesn't have access, or renders children if they do.
 */

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useFeatureGate } from '../hooks/useFeatureGate';
import { useModal } from '../hooks/useModal'; // Assumed modal hook

export function FeatureLock({
  featureName,
  featureGateAddress,
  children,
  fallbackUI = null,
  onAccessDenied = null,
}) {
  const { address } = useAccount();
  const { canAccess, reason, isLoading } = useFeatureGate(
    featureName,
    address,
    featureGateAddress
  );
  const { openModal } = useModal();

  if (isLoading) {
    return (
      <div className="feature-lock-loading">
        <p>🔍 Checking access...</p>
      </div>
    );
  }

  if (canAccess) {
    // User has access, render children
    return <>{children}</>;
  }

  // User doesn't have access, show lock UI
  const handleGetAccess = () => {
    if (onAccessDenied) {
      onAccessDenied();
    } else {
      openModal('BuyPassModal', { featureName });
    }
  };

  if (fallbackUI) {
    return fallbackUI;
  }

  return (
    <div className="feature-lock-container">
      <div className="feature-lock-overlay">
        <div className="lock-icon">🔒</div>
        <h3>Feature Locked</h3>
        <p className="lock-reason">{reason || 'You need BROskiPass to access this feature.'}</p>

        <div className="unlock-options">
          <button className="btn btn-primary" onClick={handleGetAccess}>
            🎫 Get BROskiPass
          </button>
          <p className="unlock-info">
            Own <strong>BROskiPass NFT</strong> or stake <strong>100+ BROski$</strong> to unlock.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * @file FeatureLockV2.jsx
 * @description Alternative: Disables button instead of blocking entire feature.
 * Good for UI elements like buttons that need a tooltip.
 */

export function FeatureLockButton({
  featureName,
  featureGateAddress,
  children,
  onClick,
  className = '',
  showTooltip = true,
}) {
  const { address } = useAccount();
  const { canAccess, reason, isLoading } = useFeatureGate(
    featureName,
    address,
    featureGateAddress
  );

  const isDisabled = isLoading || !canAccess;

  return (
    <div className="feature-lock-button-wrapper">
      <button
        disabled={isDisabled}
        onClick={onClick}
        className={`${className} ${isDisabled ? 'disabled' : ''}`}
        title={showTooltip && !canAccess ? reason : ''}
      >
        {isLoading ? '⏳' : children}
      </button>

      {showTooltip && !canAccess && !isLoading && (
        <div className="tooltip">
          <p>{reason}</p>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            // Open pass purchase modal
          }}>
            Get BROskiPass →
          </a>
        </div>
      )}
    </div>
  );
}

/* CSS Styles */
const styles = `
.feature-lock-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.feature-lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-lock-overlay h3 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 20px;
}

.lock-reason {
  color: #aaa;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.unlock-options {
  width: 100%;
}

.btn-primary {
  background: #32b8c6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 12px;
}

.btn-primary:hover {
  background: #2da6b4;
}

.unlock-info {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.feature-lock-button-wrapper {
  position: relative;
  display: inline-block;
}

.feature-lock-button-wrapper button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tooltip {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}

.tooltip a {
  color: #32b8c6;
  text-decoration: none;
}

.feature-lock-loading {
  padding: 24px;
  text-align: center;
  color: #666;
}
`;

export const FeatureLockStyles = styles;
