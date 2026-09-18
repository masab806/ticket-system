require("dotenv").config();
const { ethers } = require("ethers");
const { provider, signer } = require("../config/ether");
const { Event } = require("../models/Event");
const { Ticket } = require("../models/Ticket");

const EVENT_TICKETS_ABI = [
  "function mintTickets(address to, uint256 quantity)",
  "function getTotalTickets() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const contractAddress = process.env.EVENT_TICKETS_ADDRESS;
const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;

// if (!ethers.isAddress(contractAddress)) {
//   throw new Error(
//     `EVENT_TICKETS_ADDRESS is not a valid address: ${JSON.stringify(contractAddress)}`
//   );
// }
// if (!ethers.isAddress(platformWalletAddress)) {
//   throw new Error(
//     `PLATFORM_WALLET_ADDRESS is not a valid address: ${JSON.stringify(platformWalletAddress)}`
//   );
// }

const contract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, signer);
const readOnlyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, provider);

async function mintBatch(eventId, quantity) {
  if (!quantity || quantity <= 0) {
    const err = new Error("Invalid quantity");
    err.status = 400;
    throw err;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
  }

  const alreadyMinted = await Ticket.countDocuments({ eventId });
  if (alreadyMinted + quantity > event.totalTickets) {
    const err = new Error("This would exceed the event's totalTickets");
    err.status = 400;
    throw err;
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

  return {
    txHash: receipt.hash,
    mintedCount: ticketDocs.length,
    tokenIds,
  };
}

async function getTotalTickets() {
  const total = await readOnlyContract.getTotalTickets();
  return total.toString();
}

module.exports = { mintBatch, getTotalTickets };