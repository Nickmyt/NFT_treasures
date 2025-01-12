
import { Contract } from "ethers"

const { expect } = require('chai')
const { ethers } = require('hardhat')
const { BigNumber } = require('ethers')
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


describe('NFT minting', function (){
    let nftContract : Contract
    let account1 : SignerWithAddress
    let account2 : SignerWithAddress
    const marketplaceAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

    beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFTminting')
        nftContract = await NFT.deploy(marketplaceAddress)
        await nftContract.waitForDeployment();
        [account1, account2] = await ethers.getSigners()
      })

    it("increases token's id after each mint", async function () {
        await expect(nftContract.createNFT('testuri'))
          .to.emit(nftContract, 'NFTHasBeenMinted')
          .withArgs(0, 'testuri', marketplaceAddress, "NFT created")
    
        await expect(nftContract.createNFT('testuri2'))
          .to.emit(nftContract, 'NFTHasBeenMinted')
          .withArgs(1, 'testuri2', marketplaceAddress,"NFT created")
      })


    it ("Fetched the IDs of the NFTs ownded by the sender", async function(){
      await nftContract.createNFT('testur1')
      await nftContract.connect(account2)
      await nftContract.createNFT('testuri2')
      await nftContract.transferFrom(account1.address, account2.address, 1)

      const IdsOfNFTs = await nftContract.returnOwnedTokens()

      expect(IdsOfNFTs).to.equal.length(1)
      expect(IdsOfNFTs).to.equal([BigNumber.from(3)])

    })

    it ('Get NFTs based on ID', async function(){
      await nftContract.createNFT('')
      const creator  = await nftContract.getNFTCreatorById(1)
      expect(creator).to.equal(account1.address)
    })

})