/**
 * @file RewardPanel.jsx
 * @description React component showing user's BROSKI earnings, leaderboard, and quests.
 * Display this on the IDE dashboard.
 */

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import './RewardPanel.css';

export function RewardPanel() {
  const { address } = useAccount();
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRewards();
    fetchLeaderboard();
    fetchQuests();
  }, [address]);

  const fetchUserRewards = async () => {
    try {
      const res = await fetch(`/api/rewards/${address}`);
      const data = await res.json();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/rewards/leaderboard?timeframe=month');
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/quests');
      const data = await res.json();
      setQuests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quests:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reward-panel loading">⏳ Loading rewards...</div>;
  }

  return (
    <div className="reward-panel">
      {/* Header */}
      <div className="reward-header">
        <h2>🎯 Your Rewards</h2>
        <p className="user-balance">
          Balance: <span className="broski-amount">{rewards?.totalEarned || 0}</span> BROSKI$
        </p>
      </div>

      {/* Quick Stats */}
      <div className="reward-stats">
        <div className="stat">
          <span className="stat-label">Deployments</span>
          <span className="stat-value">{rewards?.deployments || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">From Deploy</span>
          <span className="stat-value">+{rewards?.deploymentEarnings || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">From Contributions</span>
          <span className="stat-value">+{rewards?.contributionEarnings || 0}</span>
        </div>
      </div>

      {/* Active Quests */}
      <section className="quests-section">
        <h3>📋 Active Quests</h3>
        <div className="quests-list">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onComplete={fetchUserRewards} />
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="leaderboard-section">
        <h3>🏆 Monthly Leaderboard</h3>
        <div className="leaderboard">
          {leaderboard.map((user) => (
            <div key={user.rank} className="leaderboard-row">
              <span className="rank-badge">{user.badge} #{user.rank}</span>
              <span className="rank-address">{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
              <span className="rank-deployments">{user.deployments} deploys</span>
              <span className="rank-earned">+{user.earned} BROSKI$</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <div className="cta-section">
        <p>💡 <strong>Deploy a contract to earn BROSKI$.</strong></p>
        <p className="small-text">Every mainnet deploy = +50 BROSKI$. First deploy bonus = +500 BROSKI$!</p>
      </div>
    </div>
  );
}

/**
 * QuestCard — Individual quest with progress bar and claim button.
 */
function QuestCard({ quest, onComplete }) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(quest.completed);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch(`/api/quests/${quest.id}/claim`, { method: 'POST' });
      if (res.ok) {
        setClaimed(true);
        onComplete();
      }
    } catch (error) {
      console.error('Error claiming quest:', error);
    } finally {
      setClaiming(false);
    }
  };

  const progressPercent = (quest.progress / quest.required) * 100;

  return (
    <div className={`quest-card ${claimed ? 'completed' : ''}`}>
      <div className="quest-header">
        <span className="quest-emoji">{quest.emoji}</span>
        <span className="quest-title">{quest.title}</span>
        <span className="quest-reward">+{quest.reward} BROSKI$</span>
      </div>

      <p className="quest-description">{quest.description}</p>

      <div className="quest-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="progress-text">
          {quest.progress} / {quest.required}
        </span>
      </div>

      {claimed ? (
        <button className="quest-btn claimed" disabled>
          ✓ Claimed
        </button>
      ) : progressPercent >= 100 ? (
        <button className="quest-btn claimable" onClick={handleClaim} disabled={claiming}>
          {claiming ? '⏳ Claiming...' : '🎁 Claim Reward'}
        </button>
      ) : (
        <button className="quest-btn disabled" disabled>
          {Math.ceil(quest.required - quest.progress)} remaining
        </button>
      )}
    </div>
  );
}

export default RewardPanel;
