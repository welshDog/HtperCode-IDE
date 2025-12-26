// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title BROski$ Token
 * @dev ERC-20 token for HyperCode IDE ecosystem.
 * Features: burnable, pausable, minting (owner only), permit (gasless approvals).
 */
contract BROskiToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("BROski", "BROSKI") ERC20Permit("BROski") {
        // Initial mint: 1,000,000 BROski$ to owner
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens (owner only).
     * Used for community rewards, incentives, etc.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Pause all token transfers (emergency only).
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Burn tokens (any holder can burn their own).
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev BurnFrom (owner or approved can burn someone's tokens).
     * Used for premium AI uses or paid features.
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    // Internal hooks for Pausable
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
