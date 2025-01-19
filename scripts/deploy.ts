const { ethers } = require("hardhat");

async function main() {

    const contractOwner = await ethers.getSigners();
    console.log(`Deploying contract from: ${contractOwner[0].address}`);

    const NFTMarket = await ethers.getContractFactory('NFTMarket');


    console.log('Deploying NFTMarket...');
    const market = await NFTMarket.deploy();
    await market.deployed();
    console.log(`NonFunToken deployed to: ${market.address}`);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });