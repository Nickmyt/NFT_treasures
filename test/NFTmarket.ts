import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { constants as ethersConstants, Contract } from "ethers";
import { ethers } from "hardhat";


describe("NFTMarket Contract", function () {
  let nftMarket: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the NFTMarket contract
    const NFTMarketFactory = await ethers.getContractFactory("NFTMarket");
    nftMarket = await NFTMarketFactory.connect(owner).deploy();
    


    const tokenURI = "ipfs://example-token-uri";
    await nftMarket.connect(addr1).createNFT(tokenURI);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await nftMarket.owner()).to.equal(owner.address);
    });
  });

  describe("createNFT function", function () {
    it("Should create an NFT and emit the NFTTransfer event", async function () {
      const tokenURI = "ipfs://example-token-uri";
      
      // Create NFT and capture the transaction
      const tx = await nftMarket.connect(addr1).createNFT(tokenURI);
      const receipt = await tx.wait();
      console.log('----------------' + receipt);

      // Check that NFTTransfer event was emitted
      const event = receipt.events?.find(e => e.event === "NFTTransfer");
      console.log();
      expect(event).to.not.be.undefined;
      expect(event?.args?.tokenID).to.equal(2); // First token ID should be 1
      expect(event?.args?.from).to.equal(ethers.constants.AddressZero);
      expect(event?.args?.tokenURI).to.equal(tokenURI);
      expect(event?.args?.price).to.equal(0);
      expect(event?.args?.text).to.equal("NFT created");

      // Verify ownership of the new token
      const newTokenOwner = await nftMarket.ownerOf(0);
      expect(newTokenOwner).to.equal(addr1.address);
    });

        it("Should increment the ID with each NFT creation", async function () {
      const tokenURI1 = "ipfs://example-token-uri-1";
      const tokenURI2 = "ipfs://example-token-uri-2";

      // Create two NFTs
      await nftMarket.connect(addr1).createNFT(tokenURI1);
      const tx = await nftMarket.connect(addr1).createNFT(tokenURI2);
      const receipt = await tx.wait();

      // Check that the ID increments correctly
      const event = receipt.events?.find(e => e.event === "NFTTransfer");
      expect(event?.args?.tokenID).to.equal(3);

      // Verify ownership of the tokens
      const ownerOfToken1 = await nftMarket.ownerOf(0);
      const ownerOfToken2 = await nftMarket.ownerOf(1);
      expect(ownerOfToken1).to.equal(addr1.address);
      expect(ownerOfToken2).to.equal(addr1.address);
  });

    });

  describe("listNFT function", function () {
    it("Should list an NFT for sale", async function () {
      const tokenId = 0;
      const price = ethers.utils.parseEther("1");

      // Approve and list NFT from addr1
      await nftMarket.connect(addr1).listNFT(tokenId, price);

      // Check that NFT was transferred to the contract
      expect(await nftMarket.ownerOf(tokenId)).to.equal(nftMarket.address);

      // Check that the listing was created correctly
      const listing = await nftMarket.getListing(tokenId);
      expect(listing.price).to.equal(price);
      expect(listing.seller).to.equal(addr1.address);
    });

    it("Should emit an NFTTransfer event when listing an NFT", async function () {
      const tokenId = 0;
      const price = ethers.utils.parseEther("1");

      await expect(nftMarket.connect(addr1).listNFT(tokenId, price))
        .to.emit(nftMarket, "NFTTransfer")
        .withArgs(tokenId, nftMarket.address, "", price, "NFT has been listed");
    });

    it("Should revert if the price is zero", async function () {
      const tokenId = 0;
      await expect(nftMarket.connect(addr1).listNFT(tokenId, 0)).to.be.revertedWith(
        "NFTMarket: price must be greater than 0"
      );
    });
  });

 describe("buyNFT function", function () {
    it("Should allow buying an NFT, transfer ownership, and emit an event", async function () {
      const tokenId = 0;
      const price = ethers.utils.parseEther("1");

      await nftMarket.connect(addr1).listNFT(tokenId, price);

      expect(await nftMarket.ownerOf(tokenId)).to.equal(nftMarket.address);
      await expect(nftMarket.connect(addr2).buyNFT(tokenId, { value: price, gasLimit: ethers.utils.parseUnits("500000", "wei") }))
        .to.emit(nftMarket, "NFTTransfer")
        .withArgs(price, addr2.address, "", 0, "NFT Bought");

      // Check new ownership and balance transfer
      expect(await nftMarket.ownerOf(tokenId)).to.equal(addr2.address);
      const listing = await nftMarket.getListing(tokenId);
      expect(listing.price).to.equal(0);
      expect(listing.seller).to.equal(ethers.constants.AddressZero);
    });

    it("Should revert if the NFT is not listed", async function () {
     await expect(nftMarket.connect(addr2).buyNFT(2))
    .to.be.revertedWith("NFT must have a non-zero price");
    });


    it("Should revert if the sent value does not match the listing price", async function () {
      const tokenURI = "ipfs://example-token-uri";
      const price = ethers.utils.parseEther("1");

      await nftMarket.connect(addr1).createNFT(tokenURI);
      await nftMarket.connect(addr1).listNFT(0, price);

      await expect(nftMarket.connect(addr2).buyNFT(0, { value: ethers.utils.parseEther("0.5") })).to.be.revertedWith(
        "Price is not correct"
      );
    });
  });

   describe("cancelListing function", function () {
    it("Should allow the owner to cancel a listing and emit an event", async function () {
      const price = ethers.utils.parseEther("1");

      await nftMarket.connect(addr1).listNFT(0, price);

      await expect(nftMarket.connect(addr1).cancelListing(0))
        .to.emit(nftMarket, "NFTTransfer")
        .withArgs(0, addr1.address, "", 0, "Listing Cleared");

      // Verify that ownership is returned to addr1 and listing is cleared
      expect(await nftMarket.ownerOf(0)).to.equal(addr1.address);
      const listing = await nftMarket.getListing(0);
      expect(listing.price).to.equal(0);
      expect(listing.seller).to.equal(ethers.constants.AddressZero);
    });

    it("Should revert if non-owner attempts to cancel listing", async function () {
      const tokenURI = "ipfs://example-token-uri";
      const price = ethers.utils.parseEther("1");

      await nftMarket.connect(addr1).createNFT(tokenURI);
      await nftMarket.connect(addr1).listNFT(0, price);

      await expect(nftMarket.connect(addr2).cancelListing(0)).to.be.revertedWith(
        "You must be the NFTs owner"
      );
    });

    it("Should revert if attempting to cancel an unlisted NFT", async function () {
      await expect(nftMarket.connect(addr1).cancelListing(0)).to.be.revertedWith(
        "NFTmust exist and have a non-zero price"
      );
    });
  });

  describe("withdrawBalance function", function () {
    it("Should allow the owner to withdraw the contract balance", async function () {
      const price = ethers.utils.parseEther("1");
      await nftMarket.connect(addr1).listNFT(0, price);
      await nftMarket.connect(addr2).buyNFT(0, { value: price });

      const contractBalanceBefore = await ethers.provider.getBalance(nftMarket.address);
      expect(contractBalanceBefore).to.equal(price);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await nftMarket.withdrawBalance();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(price).sub(gasUsed));
    });

    it("Should revert if non-owner tries to withdraw balance", async function () {
      await expect(nftMarket.connect(addr1).withdrawBalance()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert if contract balance is zero", async function () {
      await expect(nftMarket.withdrawBalance()).to.be.revertedWith("The funds need to be more than zero");
    });
  });

});