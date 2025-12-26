// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BROskiPass
 * @dev ERC-721 NFT for HyperCode IDE premium access.
 * Benefits: unlimited mainnet deploys, AI tools, multi-chain features.
 * Mint cost: 10,000 BROski$ OR 99 USDC (whichever is lower).
 */
contract BROskiPass is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdCounter;

    // Pricing and payment
    uint256 public broskiPrice = 10_000 * 10 ** 18; // 10,000 BROski$
    uint256 public usdcPrice = 99 * 10 ** 6; // 99 USDC
    address public broskiTokenAddress;
    address public usdcTokenAddress;
    address public treasuryAddress;

    // Expiration tracking (optional renewal system)
    mapping(uint256 => uint256) public passExpiration; // tokenId => expiration timestamp

    // Events
    event PassMinted(address indexed to, uint256 indexed tokenId, string paymentMethod);
    event PassRenewed(uint256 indexed tokenId, uint256 newExpiration);
    event PricesUpdated(uint256 newBroskiPrice, uint256 newUsdcPrice);

    constructor(
        address _broskiTokenAddress,
        address _usdcTokenAddress,
        address _treasuryAddress
    ) ERC721("BROskiPass", "PASS") {
        broskiTokenAddress = _broskiTokenAddress;
        usdcTokenAddress = _usdcTokenAddress;
        treasuryAddress = _treasuryAddress;
    }

    /**
     * @dev Mint a BROskiPass by paying in BROski$ tokens.
     * Tokens are transferred to treasury (no burn).
     */
    function mintWithBROski() external returns (uint256) {
        require(broskiTokenAddress != address(0), "BROski token not set");

        // Transfer BROski$ from sender to treasury
        IERC20 broski = IERC20(broskiTokenAddress);
        require(
            broski.transferFrom(msg.sender, treasuryAddress, broskiPrice),
            "BROski transfer failed"
        );

        // Mint NFT
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        // Set expiration (1 year from now)
        passExpiration[tokenId] = block.timestamp + 365 days;

        emit PassMinted(msg.sender, tokenId, "BROski");
        return tokenId;
    }

    /**
     * @dev Mint a BROskiPass by paying in USDC.
     * USDC is transferred to treasury.
     */
    function mintWithUSDC() external returns (uint256) {
        require(usdcTokenAddress != address(0), "USDC token not set");

        // Transfer USDC from sender to treasury
        IERC20 usdc = IERC20(usdcTokenAddress);
        require(
            usdc.transferFrom(msg.sender, treasuryAddress, usdcPrice),
            "USDC transfer failed"
        );

        // Mint NFT
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        // Set expiration (1 year from now)
        passExpiration[tokenId] = block.timestamp + 365 days;

        emit PassMinted(msg.sender, tokenId, "USDC");
        return tokenId;
    }

    /**
     * @dev Renew an existing pass (extend expiration by 1 year).
     * Owner can renew their own pass by paying again.
     */
    function renewPass(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not pass owner");
        require(broskiTokenAddress != address(0), "BROski token not set");

        // Transfer BROski$ for renewal
        IERC20 broski = IERC20(broskiTokenAddress);
        require(
            broski.transferFrom(msg.sender, treasuryAddress, broskiPrice),
            "BROski transfer failed"
        );

        // Extend expiration
        passExpiration[tokenId] = block.timestamp + 365 days;

        emit PassRenewed(tokenId, passExpiration[tokenId]);
    }

    /**
     * @dev Check if a pass is still valid (not expired).
     */
    function isPassValid(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId) && block.timestamp < passExpiration[tokenId];
    }

    /**
     * @dev Check if an address owns a valid pass.
     */
    function hasValidPass(address account) external view returns (bool) {
        // Iterate through all passes to find one owned by account that's valid
        // (In production, consider using a mapping for O(1) lookup)
        uint256 totalSupply = tokenIdCounter.current();
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == account && block.timestamp < passExpiration[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Update pricing (owner only).
     */
    function updatePrices(uint256 _newBroskiPrice, uint256 _newUsdcPrice) external onlyOwner {
        broskiPrice = _newBroskiPrice;
        usdcPrice = _newUsdcPrice;
        emit PricesUpdated(_newBroskiPrice, _newUsdcPrice);
    }

    /**
     * @dev Update token addresses (owner only).
     */
    function setTokenAddresses(address _broski, address _usdc) external onlyOwner {
        broskiTokenAddress = _broski;
        usdcTokenAddress = _usdc;
    }

    /**
     * @dev Update treasury address (owner only).
     */
    function setTreasuryAddress(address _treasury) external onlyOwner {
        treasuryAddress = _treasury;
    }

    // ERC721 required override
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }
}

/**
 * @dev Minimal ERC20 interface for transfer operations.
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
