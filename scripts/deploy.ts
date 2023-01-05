import { ethers } from "hardhat";

async function main() {
  const Funding = await ethers.getContractFactory("Funding");
  const funding = await Funding.deploy("Hi", "I need money to go to college");

  console.log(`Funding Smart contract depolyed!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
