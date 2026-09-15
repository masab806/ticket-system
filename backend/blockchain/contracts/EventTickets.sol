// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTickets is ERC721, Ownable {
    uint256 private nextTokenId = 1;
    uint256 private nextEventId = 1;

    enum Currency {
        PKR,
        USD
    }

    struct Event {
        uint256 id;
        string name;
        uint256 ticketPrice;
        Currency currency;
        uint256 totalTickets;
        uint256 mintedTickets;
        bool active;
        address organizer;
    }

    struct Ticket {
        uint256 eventId;
        uint256 ticketNumber;
        bool used;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => bool) public organizers;

    modifier onlyOrganizer() {
        require(
            organizers[msg.sender] || msg.sender == owner(),
            "Not an organizer"
        );
        _;
    }

    constructor() ERC721("EventTicket", "ETKT") Ownable(msg.sender) {
        organizers[msg.sender] = true;
    }

    function addOrganizer(address organizer) external onlyOwner {
        require(organizer != address(0), "Invalid address");
        organizers[organizer] = true;
    }

    function removeOrganizer(address organizer) external onlyOwner {
        organizers[organizer] = false;
    }

    function createEvent(
        string calldata name,
        uint256 ticketPrice,
        Currency currency,
        uint256 totalTickets
    ) external onlyOrganizer returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(totalTickets > 0, "Invalid ticket quantity");

        uint256 eventId = nextEventId++;

        events[eventId] = Event({
            id: eventId,
            name: name,
            ticketPrice: ticketPrice,
            currency: currency,
            totalTickets: totalTickets,
            mintedTickets: 0,
            active: true,
            organizer: msg.sender
        });

        return eventId;
    }

    function mintTickets(
        uint256 eventId,
        uint256 quantity
    ) external onlyOrganizer {
        Event storage eventData = events[eventId];

        require(eventData.id != 0, "Event does not exist");
        require(eventData.active, "Event inactive");
        require(quantity > 0, "Invalid quantity");
        require(
            eventData.mintedTickets + quantity <= eventData.totalTickets,
            "Not enough tickets"
        );

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = nextTokenId++;
            uint256 ticketNumber = eventData.mintedTickets + 1;

            _safeMint(eventData.organizer, tokenId);

            tickets[tokenId] = Ticket({
                eventId: eventId,
                ticketNumber: ticketNumber,
                used: false
            });

            eventData.mintedTickets++;
        }
    }

    function transferTicket(
        uint256 tokenId,
        address buyer
    ) external onlyOrganizer {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        require(buyer != address(0), "Invalid buyer");

        address currentOwner = ownerOf(tokenId);

        _transfer(currentOwner, buyer, tokenId);
    }

    function useTicket(uint256 tokenId) external onlyOrganizer {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");

        Ticket storage ticket = tickets[tokenId];

        require(!ticket.used, "Ticket already used");

        ticket.used = true;
    }

    function cancelEvent(uint256 eventId) external onlyOrganizer {
        require(events[eventId].id != 0, "Event does not exist");

        events[eventId].active = false;
    }

    function getTicket(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256 eventId,
            uint256 ticketNumber,
            address ticketOwner,
            bool used
        )
    {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");

        Ticket memory ticket = tickets[tokenId];

        return (
            ticket.eventId,
            ticket.ticketNumber,
            ownerOf(tokenId),
            ticket.used
        );
    }

    function getEvent(
        uint256 eventId
    )
        external
        view
        returns (
            string memory name,
            uint256 ticketPrice,
            Currency currency,
            uint256 totalTickets,
            uint256 mintedTickets,
            bool active,
            address organizer
        )
    {
        Event memory eventData = events[eventId];

        require(eventData.id != 0, "Event does not exist");

        return (
            eventData.name,
            eventData.ticketPrice,
            eventData.currency,
            eventData.totalTickets,
            eventData.mintedTickets,
            eventData.active,
            eventData.organizer
        );
    }
}