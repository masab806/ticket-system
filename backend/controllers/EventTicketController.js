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

if (!ethers.isAddress(contractAddress)) {
  throw new Error(
    `EVENT_TICKETS_ADDRESS is not a valid address: ${JSON.stringify(contractAddress)}`
  );
}

const contract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, signer);
const readOnlyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, provider);

class EventTicketController {
  static async mintTickets(req, res) {
    const { to, quantity, userId, eventId, pricePaid, currency } = req.body;

    if (!ethers.isAddress(to)) {
      return res.status(400).json({ error: "Invalid recipient address" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    if (!userId || !eventId) {
      return res.status(400).json({ error: "userId and eventId are required" });
    }

    const reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: "published",
        $expr: { $lte: [{ $add: ["$mintedTickets", quantity] }, "$totalTickets"] },
      },
      { $inc: { mintedTickets: quantity } },
      { new: true }
    );

    if (!reservedEvent) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.status !== "published") {
        return res.status(400).json({ error: "Event is not open for minting" });
      }
      return res.status(400).json({
        error: "Not enough tickets remaining",
        remaining: event.remainingTickets(),
      });
    }

    try {
      const tx = await contract.mintTickets(to, quantity);
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
          user: userId,
          eventId,
          txHash: receipt.hash,
          tokenId,
          walletAddress: to.toLowerCase(),
          pricePaid,
          currency,
          status: "confirmed",
        }))
      );

      return res.status(201).json({
        txHash: receipt.hash,
        tokenIds,
        tickets: ticketDocs,
        remainingTickets: reservedEvent.remainingTickets(),
      });
    } catch (error) {
      await Event.updateOne(
        { _id: eventId },
        { $inc: { mintedTickets: -quantity } }
      );

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

module.exports = EventTicketController;