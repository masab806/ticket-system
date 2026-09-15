import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const eventTickets = await ethers.deployContract("EventTickets");
  await eventTickets.waitForDeployment();

  const address = await eventTickets.getAddress();
  console.log("EventTickets deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});