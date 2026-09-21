// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EventTickets is ERC721, Ownable {
    uint256 private nextTokenId = 1;

    constructor() ERC721("EventTicket", "ETKT") Ownable(msg.sender) {}

    function mintTickets(address to, uint256 quantity) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(quantity > 0, "Invalid quantity");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, nextTokenId++);
        }
    }

    function getTotalTickets() external view returns (uint256) {
        return nextTokenId - 1;
    }
}
