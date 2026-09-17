// controllers/EventTicketController.js
require("dotenv").config();
const { ethers } = require("ethers");
const { provider, signer } = require("../config/ether");

const EVENT_TICKETS_ABI = [
  "function mintTickets(address to, uint256 quantity)",
  "function getTotalTickets() view returns (uint256)",
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
    try {
      const { to, quantity } = req.body;

      if (!ethers.isAddress(to)) {
        return res.status(400).json({ error: "Invalid recipient address" });
      }
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const tx = await contract.mintTickets(to, quantity);
      const receipt = await tx.wait();

      return res.status(201).json({ txHash: receipt.hash });
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

module.exports = EventTicketController;