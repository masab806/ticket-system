require("dotenv").config();
const { ethers } = require("ethers");
const { provider, signer } = require("../config/ether");
const { Ticket } = require("../models/Ticket");
const { Event } = require("../models/Event");

const EVENT_TICKETS_ABI = [
  "function mintTickets(address to, uint256 quantity)",
  "function registerMintTransaction(bytes32 txHash, uint256[] tokenIds)",
  "function verifyTransaction(bytes32 txHash) view returns (bool)",
  "function verifyTicket(uint256 tokenId, bytes32 txHash) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function owner() view returns (address)",
  "function getTotalTickets() view returns (uint256)",
  "function transferTicket(address to, uint256 tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const contractAddress = process.env.EVENT_TICKETS_ADDRESS;
const mintRecipient = process.env.PLATFORM_WALLET_ADDRESS || signer.address;
const nonceManagedSigner = new ethers.NonceManager(signer);
const custodySigner = process.env.PLATFORM_WALLET_PRIVATE_KEY
  ? new ethers.Wallet(process.env.PLATFORM_WALLET_PRIVATE_KEY, provider)
  : signer;
const nonceManagedCustodySigner = new ethers.NonceManager(custodySigner);

if (!contractAddress || !ethers.isAddress(contractAddress)) {
  throw new Error("EVENT_TICKETS_ADDRESS is missing or invalid");
}

if (!mintRecipient || !ethers.isAddress(mintRecipient)) {
  throw new Error("PLATFORM_WALLET_ADDRESS or signer address is required");
}

const contract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, nonceManagedSigner);
const custodyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, nonceManagedCustodySigner);
const readOnlyContract = new ethers.Contract(contractAddress, EVENT_TICKETS_ABI, provider);
let contractWriteQueue = Promise.resolve();

function queueContractWrite(operation) {
  const queuedOperation = contractWriteQueue.then(operation);
  contractWriteQueue = queuedOperation.catch(() => {});
  return queuedOperation;
}

async function getMintedTokenId(receipt) {
  for (const log of receipt.logs) {
    try {
      const parsed = log.fragment
        ? log
        : contract.interface.parseLog(log);

      if (parsed?.name === "Transfer") {
        return parsed.args.tokenId.toString();
      }
    } catch {
      // Ignore logs emitted by other contracts in the transaction.
    }
  }

  // Supports receipts returned as raw logs by some ethers/provider versions.
  const transferTopic = ethers.id("Transfer(address,address,uint256)");
  for (const log of receipt.logs) {
    if (log.topics?.[0]?.toLowerCase() === transferTopic.toLowerCase() && log.topics.length >= 4) {
      return BigInt(log.topics[3]).toString();
    }
  }

  // The contract mints sequential IDs. This fallback is safe because mintTicket
  // submits exactly one mint transaction at a time.
  const total = await readOnlyContract.getTotalTickets();
  if (total > 0n) {
    return total.toString();
  }

  return null;
}

async function performMintTicket() {
  try {
  const deployedCode = await provider.getCode(contractAddress);
  if (deployedCode === "0x") {
    const err = new Error(`No contract code found at EVENT_TICKETS_ADDRESS ${contractAddress}`);
    err.status = 503;
    throw err;
  }

  const tx = await contract.mintTickets(mintRecipient, 1);
  const receipt = await tx.wait();
  if (receipt.status !== 1) {
    const err = new Error("Ticket mint transaction failed");
    err.status = 502;
    throw err;
  }

  const tokenId = await getMintedTokenId(receipt);
  if (!tokenId) {
    const err = new Error("Mint transaction did not return a token ID");
    err.status = 502;
    throw err;
  }

  const registrationTx = await contract.registerMintTransaction(receipt.hash, [tokenId]);
  await registrationTx.wait();

  const verified = await readOnlyContract.verifyTicket(tokenId, receipt.hash);
  if (!verified) {
    const err = new Error("Minted ticket could not be verified on-chain");
    err.status = 502;
    throw err;
  }

  return {
    tokenId,
    mintTxHash: receipt.hash,
    walletAddress: mintRecipient.toLowerCase(),
  };
  } catch (error) {
    nonceManagedSigner.reset();
    nonceManagedCustodySigner.reset();
    throw error;
  }
}

function mintTicket() {
  return queueContractWrite(performMintTicket);
}

async function performTransferTicketToBuyer({ tokenId, recipient }) {
  if (!/^[1-9]\d*$/.test(String(tokenId))) {
    const err = new Error("A valid on-chain token ID is required");
    err.status = 400;
    throw err;
  }
  if (!ethers.isAddress(recipient)) {
    const err = new Error("A valid recipient wallet address is required");
    err.status = 400;
    throw err;
  }

  const custodyAddress = ethers.getAddress(custodySigner.address);
  if (custodyAddress.toLowerCase() !== mintRecipient.toLowerCase()) {
    const err = new Error(
      "The custody signer must match PLATFORM_WALLET_ADDRESS. Configure PLATFORM_WALLET_PRIVATE_KEY for the wallet holding tickets."
    );
    err.status = 503;
    throw err;
  }

  const currentOwner = await readOnlyContract.ownerOf(tokenId);
  if (currentOwner.toLowerCase() === recipient.toLowerCase()) {
    return { txHash: null, alreadyTransferred: true };
  }
  if (currentOwner.toLowerCase() !== custodyAddress.toLowerCase()) {
    const err = new Error("The ticket is not held in the configured platform wallet");
    err.status = 409;
    throw err;
  }

  try {
    const contractOwner = await readOnlyContract.owner();
    if (contractOwner.toLowerCase() !== custodyAddress.toLowerCase()) {
      const err = new Error("The custody signer must be the ticket contract owner to transfer platform-held resale tickets");
      err.status = 503;
      throw err;
    }
    const tx = await custodyContract.transferTicket(recipient, tokenId);
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      const err = new Error("Ticket transfer transaction failed");
      err.status = 502;
      throw err;
    }
    return { txHash: receipt.hash, alreadyTransferred: false };
  } catch (error) {
    nonceManagedSigner.reset();
    nonceManagedCustodySigner.reset();
    throw error;
  }
}

function transferTicketToBuyer(args) {
  return queueContractWrite(() => performTransferTicketToBuyer(args));
}

async function verifyTicket({ tokenId, txHash }) {
  if (!tokenId || !txHash || !ethers.isBytesLike(txHash) || txHash.length !== 66) {
    const err = new Error("tokenId and a valid transaction hash are required");
    err.status = 400;
    throw err;
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1 || receipt.to?.toLowerCase() !== contractAddress.toLowerCase()) {
      return { valid: false, reason: "Transaction was not confirmed by the ticket contract" };
    }

    const transfer = receipt.logs
      .map((log) => {
        try {
          return readOnlyContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(
        (parsed) =>
          parsed?.name === "Transfer" &&
          parsed.args.tokenId.toString() === String(tokenId)
      );

    if (!transfer) {
      return { valid: false, reason: "Transaction did not mint this ticket" };
    }

    const valid = await readOnlyContract.verifyTicket(tokenId, txHash);
    return {
      valid,
      tokenId: String(tokenId),
      txHash,
      owner: valid ? await readOnlyContract.ownerOf(tokenId) : null,
    };
  }

  async function verifyTicketByTokenId(tokenId) {
    if (typeof tokenId !== "string") {
      const err = new Error("A valid ticket ID is required");
      err.status = 400;
      throw err;
    }

    const normalizedTokenId = tokenId.trim();
    const displayTokenId = normalizedTokenId.replace(/^#?TCK#?-?/i, "");
    if (!/^[1-9]\d*$/.test(displayTokenId)) {
      const err = new Error("A valid ticket ID is required");
      err.status = 400;
      throw err;
    }

    const hasTicketPrefix = /^(#?TCK#?-?)/i.test(normalizedTokenId);
    let ticket;
    if (hasTicketPrefix) {
      ticket = await Ticket.findOne({ tokenId: `TCK#-${displayTokenId}` }).lean();
      if (!ticket) {
        ticket = await Ticket.findOne({ tokenId: displayTokenId }).lean();
      }
    } else {
      ticket = await Ticket.findOne({
        $or: [{ chainTokenId: displayTokenId }, { tokenId: displayTokenId }],
      }).lean();
    }

    if (!ticket) {
      return { valid: false, status: "invalid", reason: "Ticket token was not found" };
    }

    const chainTokenId = ticket.chainTokenId || ticket.tokenId;
    const chainResult = await verifyTicket({
      tokenId: chainTokenId,
      txHash: ticket.mintTxHash,
    });

    const event = await Event.findById(ticket.eventId)
      .select("name title")
      .lean();

    return {
      ...chainResult,
      tokenId: ticket.tokenId.startsWith("TCK#-") ? ticket.tokenId : `TCK#-${ticket.tokenId}`,
      chainTokenId,
      status: chainResult.valid ? (ticket.status === "used" ? "used" : "valid") : "invalid",
      event: event?.title || event?.name || "Unknown event",
      owner: chainResult.owner || ticket.walletAddress,
      txHash: ticket.mintTxHash,
      ticketStatus: ticket.status,
  };
}

async function getTotalTickets() {
  const total = await readOnlyContract.getTotalTickets();
  return total.toString();
}

async function getTicketCustodyStatus(tokenId) {
  if (!/^[1-9]\d*$/.test(String(tokenId))) {
    throw new Error("A valid on-chain token ID is required");
  }
  const currentOwner = await readOnlyContract.ownerOf(tokenId);
  return {
    owner: currentOwner,
    heldByPlatform: currentOwner.toLowerCase() === mintRecipient.toLowerCase(),
  };
}

module.exports = {
  mintTicket,
  transferTicketToBuyer,
  verifyTicket,
  verifyTicketByTokenId,
  getTotalTickets,
  getTicketCustodyStatus,
};