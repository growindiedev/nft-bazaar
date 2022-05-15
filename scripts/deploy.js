// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const NFTBazaar = await hre.ethers.getContractFactory("NFTBazaar");
  const nftBazaar = await NFTBazaar.deploy();

  await nftBazaar.deployed();

  fs.writeFileSync(
    "./config.js",
    `
  export const marketplaceAddress = "${nftBazaar.address}"
  `
  );

  console.log("NftBazaar deployed to:", nftBazaar.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//npx hardhat run scripts/deploy.js --network localhost
