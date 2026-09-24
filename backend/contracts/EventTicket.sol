// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EventTickets is ERC721, Ownable {
    uint256 private nextTokenId = 1;
    mapping(uint256 => bytes32) private ticketMintTxHash;
    mapping(bytes32 => bool) private registeredMintTransactions;

    constructor() ERC721("EventTicket", "ETKT") Ownable(msg.sender) {}

    function mintTickets(address to, uint256 quantity) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(quantity == 1, "Mint one ticket per transaction");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, nextTokenId++);
        }
    }

    function registerMintTransaction(bytes32 txHash, uint256[] calldata tokenIds) external onlyOwner {
        require(txHash != bytes32(0), "Invalid transaction hash");
        require(tokenIds.length > 0, "No token IDs");

        registeredMintTransactions[txHash] = true;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_ownerOf(tokenIds[i]) != address(0), "Unknown token");
            ticketMintTxHash[tokenIds[i]] = txHash;
        }
    }

    function verifyTransaction(bytes32 txHash) external view returns (bool) {
        return registeredMintTransactions[txHash];
    }

    function verifyTicket(uint256 tokenId, bytes32 txHash) external view returns (bool) {
        return _ownerOf(tokenId) != address(0) && ticketMintTxHash[tokenId] == txHash;
    }

    function getTotalTickets() external view returns (uint256) {
        return nextTokenId - 1;
    }
}
