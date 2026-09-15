const {ethers} = require("ethers")
const {provider, signer} = require("../config/ether")

const EVENT_TICKETS_ABI = [
  "function createEvent(string name, uint256 ticketPrice, uint8 currency, uint256 totalTickets) returns (uint256)",
  "function mintTickets(uint256 eventId, uint256 quantity)",
  "function transferTicket(uint256 tokenId, address buyer)",
  "function useTicket(uint256 tokenId)",
  "function cancelEvent(uint256 eventId)",
  "function getEvent(uint256 eventId) view returns (string name, uint256 ticketPrice, uint8 currency, uint256 totalTickets, uint256 mintedTickets, bool active, address organizer)",
  "function getTicket(uint256 tokenId) view returns (uint256 eventId, uint256 ticketNumber, address ticketOwner, bool used)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const contractAddress = process.env.CONTRACT_ADDRESS

const contract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, signer)

const readOnlyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, signer)

const Currency = {
    PKR: 0,
    USD: 1,
}

const CurrencyNames = Object.keys(Currency)

class EventTicketController {
    static async createEvent(req,res) {
        try {
            const {name, ticketPrice, currency, totalTickets} = req.body

            const currencyCode = Currency[currency]

            if(currencyCode === undefined) {
                return res.status(400).json({
                    error: "Invalid Currency"
                })
            }
            
            const tx = await contract.createEvent(
                name,
                ethers.parseUnits(ticketPrice.toString(), 0),
                currencyCode,
                totalTickets
            )

            const receipt = await tx.wait()

            return res.status(201).json({
                txHash: receipt.hash
            })

        } catch (error) {
            return res.status(500).json({
                error: error.reason || error.message
            })
        }
    }
} 