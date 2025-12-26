// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FeatureGate
 * @dev Access control oracle for HyperCode IDE.
 * Checks if a wallet can access features like Deploy, AI Tools, etc.
 * 
 * Access rules are defined as "gates" — each gate has requirements.
 * Requirements can be:
 *   - Token balance (e.g., >= 10 BROski$)
 *   - NFT ownership (e.g., has BROskiPass)
 *   - Staked amount (e.g., >= 100 BROski$ staked)
 *   - Burn proof (e.g., has burned BROski$ recently)
 */
contract FeatureGate is Ownable {

    // Gate types
    enum GateType {
        TOKEN_BALANCE,      // Requires min BROski$ balance
        NFT_OWNERSHIP,      // Requires BROskiPass NFT
        STAKED_AMOUNT,      // Requires BROski$ staked (tracked via Staking contract)
        BURN_PROOF          // Requires recent burn (burn tx recorded on-chain)
    }

    // Feature gate definition
    struct Gate {
        GateType gateType;
        address contractAddress;  // Token, NFT, or Staking contract
        uint256 threshold;         // Min balance, min stake, or burn within X blocks
        bool enabled;
    }

    // Tracked gates
    mapping(string => Gate) public gates;  // featureName => Gate definition
    mapping(address => uint256) public lastBurnBlock; // track when user last burned tokens

    // Events
    event GateCreated(string featureName, GateType gateType, uint256 threshold);
    event GateUpdated(string featureName, uint256 newThreshold);
    event GateEnabled(string featureName, bool enabled);
    event BurnRecorded(address indexed user, uint256 burnAmount);

    constructor() {}

    /**
     * @dev Create a new feature gate (owner only).
     * Example: createGate("deploy-mainnet", GateType.NFT_OWNERSHIP, broskiPassAddress, 1)
     */
    function createGate(
        string calldata featureName,
        GateType gateType,
        address contractAddress,
        uint256 threshold
    ) external onlyOwner {
        gates[featureName] = Gate({
            gateType: gateType,
            contractAddress: contractAddress,
            threshold: threshold,
            enabled: true
        });
        emit GateCreated(featureName, gateType, threshold);
    }

    /**
     * @dev Update a gate's threshold (owner only).
     */
    function updateGateThreshold(string calldata featureName, uint256 newThreshold) 
        external 
        onlyOwner 
    {
        require(bytes(gates[featureName].contractAddress).length > 0, "Gate not found");
        gates[featureName].threshold = newThreshold;
        emit GateUpdated(featureName, newThreshold);
    }

    /**
     * @dev Enable or disable a gate (owner only).
     */
    function setGateEnabled(string calldata featureName, bool enabled) 
        external 
        onlyOwner 
    {
        gates[featureName].enabled = enabled;
        emit GateEnabled(featureName, enabled);
    }

    /**
     * @dev Check if user can access a feature.
     * Returns: (canAccess, reason)
     */
    function canAccess(string calldata featureName, address user) 
        external 
        view 
        returns (bool, string memory) 
    {
        Gate memory gate = gates[featureName];

        // Check if gate exists and is enabled
        if (bytes(gate.contractAddress).length == 0) {
            return (false, "Gate not found");
        }
        if (!gate.enabled) {
            return (false, "Feature disabled");
        }

        // Check based on gate type
        if (gate.gateType == GateType.TOKEN_BALANCE) {
            return _checkTokenBalance(gate.contractAddress, user, gate.threshold);
        } 
        else if (gate.gateType == GateType.NFT_OWNERSHIP) {
            return _checkNFTOwnership(gate.contractAddress, user);
        } 
        else if (gate.gateType == GateType.STAKED_AMOUNT) {
            return _checkStakedAmount(gate.contractAddress, user, gate.threshold);
        } 
        else if (gate.gateType == GateType.BURN_PROOF) {
            return _checkBurnProof(user, gate.threshold);
        }

        return (false, "Unknown gate type");
    }

    /**
     * @dev Internal: Check token balance.
     */
    function _checkTokenBalance(address tokenAddress, address user, uint256 minBalance) 
        internal 
        view 
        returns (bool, string memory) 
    {
        uint256 balance = IERC20(tokenAddress).balanceOf(user);
        if (balance >= minBalance) {
            return (true, "Token balance sufficient");
        }
        return (false, "Insufficient token balance");
    }

    /**
     * @dev Internal: Check if user owns a specific NFT.
     */
    function _checkNFTOwnership(address nftAddress, address user) 
        internal 
        view 
        returns (bool, string memory) 
    {
        uint256 balance = IERC721(nftAddress).balanceOf(user);
        if (balance > 0) {
            return (true, "NFT owned");
        }
        return (false, "No NFT owned");
    }

    /**
     * @dev Internal: Check staked amount (via Staking contract).
     * Calls Staking.stakedBalance(user).
     */
    function _checkStakedAmount(address stakingAddress, address user, uint256 minStake) 
        internal 
        view 
        returns (bool, string memory) 
    {
        uint256 staked = IStaking(stakingAddress).stakedBalance(user);
        if (staked >= minStake) {
            return (true, "Staked amount sufficient");
        }
        return (false, "Insufficient staked amount");
    }

    /**
     * @dev Internal: Check if user has burned tokens recently.
     * "Recently" = within the threshold blocks.
     */
    function _checkBurnProof(address user, uint256 withinBlocks) 
        internal 
        view 
        returns (bool, string memory) 
    {
        uint256 lastBurn = lastBurnBlock[user];
        if (lastBurn == 0) {
            return (false, "No burn recorded");
        }

        uint256 blocksSinceBurn = block.number - lastBurn;
        if (blocksSinceBurn <= withinBlocks) {
            return (true, "Recent burn confirmed");
        }
        return (false, "Burn too old");
    }

    /**
     * @dev Record a burn event (called by BROski token contract via callback).
     * In practice, you'd integrate this via a BROski token hook.
     * For now, owner can manually record burns.
     */
    function recordBurn(address user, uint256 amount) external {
        // In production, only BROski token contract should call this.
        // For MVP, owner can manually record (or integrate token hook).
        lastBurnBlock[user] = block.number;
        emit BurnRecorded(user, amount);
    }

    /**
     * @dev Convenience: check multiple features at once.
     * Returns an array of (featureName, canAccess, reason).
     */
    function checkMultiple(string[] calldata featureNames, address user) 
        external 
        view 
        returns (bool[] memory, string[] memory) 
    {
        bool[] memory results = new bool[](featureNames.length);
        string[] memory reasons = new string[](featureNames.length);

        for (uint256 i = 0; i < featureNames.length; i++) {
            (results[i], reasons[i]) = this.canAccess(featureNames[i], user);
        }

        return (results, reasons);
    }
}

/**
 * @dev Minimal ERC20 interface.
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @dev Minimal ERC721 interface.
 */
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @dev Minimal Staking interface.
 */
interface IStaking {
    function stakedBalance(address user) external view returns (uint256);
}
