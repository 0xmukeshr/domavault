// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockDomainNFT is ERC721, Ownable {
    
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => string) public domainNames;
    
    constructor() ERC721("Mock Domain", "DOMAIN") Ownable(msg.sender) {}
    
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        
        // Set mock domain names
        if (tokenId == 1) domainNames[tokenId] = "crypto.io";
        if (tokenId == 2) domainNames[tokenId] = "web3.io";
        if (tokenId == 3) domainNames[tokenId] = "defi.io";
    }
    
    function getDomainName(uint256 tokenId) external view returns (string memory) {
        return domainNames[tokenId];
    }
}