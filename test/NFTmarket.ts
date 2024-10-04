import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const mapping = {} as any;
mapping['tokenID'] = {price: 123 , seller: 'seller'}
mapping['tokenID1'] = {price: 123 , seller: 'seller'}
mapping['tokenID2'] = {price: 123 , seller: 'seller'}


describe('NFTMarket', () => {
  let MyNFT, nft, owner, addr1;
  it("should mint the NFT and emit an event", async function () {
    //deploy the contract we are testing
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.waitForDeployment();


    
    //call the createNFT func
    const tokenURI = "https://some-toke.uri/";
    const transaction = await nftMarket.createNFT(tokenURI);
    const receipt = await transaction.wait();

    //console.log("---------------TRANSACTION-------------");
    //console.log(transaction);
    //console.log("---------------RECEIPT-------------");
    //console.log(receipt?.logs);
    
    const logs = receipt?.logs;
    const event = nftMarket.interface.parseLog(logs[0]);
    console.log(event);

    //const tokenMinted = await nftMarket.tokenURI(tokenID)
    //expect(tokenMinted).to.equal(tokenURI)

    // Check that the NFTTransfer event was emitted
    
    const ownerAddress = await nftMarket.ownerOf(tokenURI);
    const singer = await ethers.getSigners();

    const currentAddress = await singer[0].getAddress();
    expect(ownerAddress).to.equal(currentAddress);
  });

});