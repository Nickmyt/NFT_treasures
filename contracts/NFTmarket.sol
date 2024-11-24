// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";


struct NFTListing {  
        uint256 price;
        address seller;
    }
contract NFTMarket is ERC721URIStorage, Ownable{
    using Math for uint256;
    uint256 private Ids;

    constructor() ERC721("PAPEI", "PAPI") Ownable(msg.sender) {
    }

    mapping(uint256 => NFTListing) private _listings;

    function getListing(uint256 tokenId) public view returns (NFTListing memory) {
    return _listings[tokenId];
    }

    //Event to notify an NFT related event 
    event NFTTransfer(uint256 tokenID, address from, string tokenURI, uint256 price, string text);

    function createNFT(string calldata tokenURI) public{
        uint256 tokenId = Ids++;
        _safeMint(msg.sender,tokenId);
        _setTokenURI(tokenId,tokenURI);
        
        emit NFTTransfer(Ids, address(0), tokenURI, 0, "NFT created");
    }

    function listNFT(uint256 tokenId , uint256 price) public {
        require(price > 0, "NFTMarket: price must be greater than 0");
        approve(address(this),tokenId);
        transferFrom(msg.sender, address(this), tokenId);
        _listings[tokenId] = NFTListing(price, msg.sender);
        emit NFTTransfer(tokenId, address(this), "", price, "NFT has been listed");
     }    
    
    //TODO : Need to use safe math for the proper calculation
    function buyNFT(uint256 tokenId) public payable{
        NFTListing memory listing = _listings[tokenId];
        require(listing.price > 0 , "NFT must have a non-zero price");
        require(listing.price == msg.value, "Price is not correct");
        transferFrom(address(this) , msg.sender, tokenId);
        payable(msg.sender).transfer(listing.price * 97/100);
        emit NFTTransfer(tokenId,msg.sender, "", 0, "NFT Bought");
    }

    //This cancels the listing of an nft
    function cancelListing(uint256 tokenId) public{
        NFTListing memory listing = _listings[tokenId];
        require(listing.price > 0 , "NFTmust exist and have a non-zero price");
        require(listing.seller == msg.sender , "You must be the NFTs owner");
        transferFrom(address(this), msg.sender, tokenId);
        clearListing(tokenId);
        emit NFTTransfer(tokenId, msg.sender, "",0,"Listing Cleared");
    }

    function withdrawBalance() public onlyOwner{
       uint256 balance =  address(this).balance;
       require(balance > 0 , "The funds need to be more than zero");
       payable(owner()).transfer(balance);
    }

    function clearListing(uint256 tokenId) public {
        _listings[tokenId].price = 0;
        _listings[tokenId].seller = address(0);
    }
}