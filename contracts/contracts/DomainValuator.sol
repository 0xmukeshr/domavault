// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DomainValuator is Ownable {
    
    mapping(uint256 => uint256) public domainValues;
    mapping(uint256 => uint256) public aiScores;
    mapping(uint256 => uint256) public lastUpdated;
    
    address public oracleAddress;
    
    event DomainValueUpdated(uint256 indexed tokenId, uint256 value, uint256 aiScore);
    
    constructor(address _oracleAddress) Ownable(msg.sender) {
        oracleAddress = _oracleAddress;
    }
    
    function updateDomainValue(
        uint256 tokenId, 
        uint256 value, 
        uint256 aiScore
    ) external {
        require(msg.sender == oracleAddress || msg.sender == owner(), "Unauthorized");
        require(aiScore <= 100, "Invalid AI score");
        
        domainValues[tokenId] = value;
        aiScores[tokenId] = aiScore;
        lastUpdated[tokenId] = block.timestamp;
        
        emit DomainValueUpdated(tokenId, value, aiScore);
    }
    
    function batchUpdateValues(
        uint256[] calldata tokenIds,
        uint256[] calldata values,
        uint256[] calldata scores
    ) external {
        require(msg.sender == oracleAddress || msg.sender == owner(), "Unauthorized");
        require(tokenIds.length == values.length && values.length == scores.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            domainValues[tokenIds[i]] = values[i];
            aiScores[tokenIds[i]] = scores[i];
            lastUpdated[tokenIds[i]] = block.timestamp;
            
            emit DomainValueUpdated(tokenIds[i], values[i], scores[i]);
        }
    }
    
    function getDomainValue(uint256 tokenId) external view returns (uint256) {
        return domainValues[tokenId];
    }
    
    function getAIScore(uint256 tokenId) external view returns (uint256) {
        return aiScores[tokenId];
    }
    
    function getDomainData(uint256 tokenId) 
        external 
        view 
        returns (uint256 value, uint256 score, uint256 updated) 
    {
        return (domainValues[tokenId], aiScores[tokenId], lastUpdated[tokenId]);
    }
    
    function updateOracleAddress(address newOracle) external onlyOwner {
        oracleAddress = newOracle;
    }
}