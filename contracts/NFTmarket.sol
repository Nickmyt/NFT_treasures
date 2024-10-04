// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/SafeMath.sol"

    struct NFTListing {  
        uint256 price;
        address seller;
    }
contract NFTMarket is ERC721URIStorage{
    using SafeMath for uint 256;
    uint256 private Ids;

    constructor() ERC721("PAPEI", "PAPI"){}
    mapping(uint256 => NFTListing) private _listings;

    event NFTTransfer(uint256 tokenID, address from, address to, string tokenURI, uint256 price, string text);

    function createNFT(string calldata tokenURI) public{
        uint256 tokenId = Ids++;
        _safeMint(msg.sender,tokenId);
        _setTokenURI(tokenId,tokenURI);

        emit NFTTransfer(Ids, address(0), msg.sender, tokenURI, 0, "This is the event");


    function listNFT(uint256 tokenId , uint256 price) public {
        require(price > 0, "NFTMarket: price must be greater than 0");
        approve(address(this),tokenId);
        transferFrom(msg.sender, address(this), tokenId);
        _listing[tokenID] = NFTListing(price, msg.sender)
     }    
    }

    function buyNFT(uint256 tokenId) public payable{
        NFTlisting memory listing = _listing[tokenId];
        require(listing.price > 0 , "NFT must have a non-zero price");
        require(listing.price == msg.value, "Price is not correct");
        transferFrom(address(this) , msg.sender, tokenId);
        payable(msg.seller.transfer(listing.price.mul(97).div(100));


    }
 
}