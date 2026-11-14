// Measures gas and latency of EventTickets.mintTickets() for several batch sizes.
// Usage (from the backend folder, with your local chain running and .env set):
//   node measure-mint.js
// Needs in .env: RPC_URL, ORGANIZER_PRIVATE_KEY, EVENT_TICKETS_ADDRESS, PLATFORM_WALLET_ADDRESS
require("dotenv").config();
const { ethers } = require("ethers");

const ABI = ["function mintTickets(address to, uint256 quantity)"];
const SIZES = [1];
const RUNS = 5; // repeat each size and average

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.ORGANIZER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.EVENT_TICKETS_ADDRESS, ABI, signer);
  const to = process.env.PLATFORM_WALLET_ADDRESS;

  const rows = [["batch_size", "avg_gas_used", "avg_gas_per_ticket", "avg_time_s"]];
  for (const n of SIZES) {
    let gas = 0n;
    let ms = 0;
    for (let i = 0; i < RUNS; i++) {
      const t0 = Date.now();
      const tx = await contract.mintTickets(to, n);
      const receipt = await tx.wait();
      ms += Date.now() - t0;
      gas += receipt.gasUsed;
    }
    const avgGas = Number(gas) / RUNS;
    rows.push([n, Math.round(avgGas), Math.round(avgGas / n), (ms / RUNS / 1000).toFixed(2)]);
    console.log(`batch ${n}: gas ${Math.round(avgGas)}, per ticket ${Math.round(avgGas / n)}, ${(ms / RUNS / 1000).toFixed(2)} s`);
  }
  require("fs").writeFileSync("mint-measurements.csv", rows.map((r) => r.join(",")).join("\n"));
  console.log("Saved mint-measurements.csv");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});