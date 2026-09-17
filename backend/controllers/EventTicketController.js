require("dotenv").config();
const { ethers } = require("ethers");
const { provider, signer } = require("../config/ether");
const Event = require("../models/Event.model");
const Ticket = require("../models/Ticket.model");

const EVENT_TICKETS_ABI = [
  "function mintTickets(address to, uint256 quantity)",
  "function getTotalTickets() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const contractAddress = process.env.EVENT_TICKETS_ADDRESS;
const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;

if (!ethers.isAddress(contractAddress)) {
  throw new Error(
    `EVENT_TICKETS_ADDRESS is not a valid address: ${JSON.stringify(contractAddress)}`
  );
}
if (!ethers.isAddress(platformWalletAddress)) {
  throw new Error(
    `PLATFORM_WALLET_ADDRESS is not a valid address: ${JSON.stringify(platformWalletAddress)}`
  );
}

const contract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, signer);
const readOnlyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, provider);

class EventTicketController {
  static async mintBatch(req, res) {
    try {
      const { eventId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const alreadyMinted = await Ticket.countDocuments({ eventId });
      if (alreadyMinted + quantity > event.totalTickets) {
        return res.status(400).json({
          error: "This would exceed the event's totalTickets",
          alreadyMinted,
          totalTickets: event.totalTickets,
        });
      }

      const tx = await contract.mintTickets(platformWalletAddress, quantity);
      const receipt = await tx.wait();

      const tokenIds = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((parsed) => parsed && parsed.name === "Transfer")
        .map((parsed) => parsed.args.tokenId.toString());

      const ticketDocs = await Ticket.insertMany(
        tokenIds.map((tokenId) => ({
          eventId,
          tokenId,
          mintTxHash: receipt.hash,
          walletAddress: platformWalletAddress.toLowerCase(),
          status: "available",
        }))
      );

      return res.status(201).json({
        txHash: receipt.hash,
        mintedCount: ticketDocs.length,
        tokenIds,
      });
    } catch (error) {
      return res.status(500).json({ error: error.reason || error.message });
    }
  }

  static async getTotalTickets(req, res) {
    try {
      const total = await readOnlyContract.getTotalTickets();
      return res.status(200).json({ totalTickets: total.toString() });
    } catch (error) {
      return res.status(500).json({ error: error.reason || error.message });
    }
  }
}

module.exports = {
    EventTicketController
};