const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })
const { ethers } = require("ethers")

const rpcUrl = process.env.RPC_URL
const privateKey = process.env.ORGANIZER_PRIVATE_KEY

if (!rpcUrl) {
    throw new Error("RPC_URL is not configured")
}

if (!privateKey) {
    throw new Error("ORGANIZER_PRIVATE_KEY is not configured")
}

const provider = new ethers.JsonRpcProvider(rpcUrl)
const signer = new ethers.Wallet(privateKey, provider)

module.exports = {
    provider,
    signer
}