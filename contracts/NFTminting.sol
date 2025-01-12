//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract NFTminting is ERC721URIStorage {
    uint256 private Ids;

    address private NFTMarketplaceAddress ;
    mapping (uint256=>address) private creators;

    event NFTHasBeenMinted(
        uint256 indexed tokenID,
        string tokenURI,
        address marketAddress,
        string text
    );

    constructor(address _NFTMarketplaceAddress) ERC721("Nicklaos", "PAPEI"){
        NFTMarketplaceAddress =_NFTMarketplaceAddress;
    }

    function createNFT(string calldata tokenURI) public returns (uint256) {
        uint256 tokenId = Ids++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        setApprovalForAll(NFTMarketplaceAddress, true);

        emit NFTHasBeenMinted(tokenId, tokenURI, msg.sender, "NFT created");
        return tokenId;
    }

    function returnOwnedTokens() public view returns (uint256[] memory){
        uint256 existingTokens = Ids;
        uint256 ownedTokens = balanceOf(msg.sender);
        uint256[] memory ownedTokensIds = new uint256[](ownedTokens);


        uint256 index = 0;
        for(uint256 i =0; i<existingTokens; i++){
            uint256 id = i +1;
            if(ownerOf(id)!= msg.sender) continue;
            ownedTokensIds[index] = id;
            index += 1;
        }

        return ownedTokensIds;
    }

    function getNFTCreatorById (uint256 tokenId) public view returns (address){
        return creators[tokenId];
    }


    function getNFTsCreatedByMe() public view returns (uint256[] memory){
        uint256 existingTokens = Ids;
        uint256 ownedTokens = 0;

        for(uint256 i =0; i<existingTokens; i++){
            uint256 tokenId = i+1;
            if(creators[tokenId] != msg.sender) continue;
            ownedTokens +=1;
        }

        uint256[] memory createdNFTs = new uint256[](existingTokens);
        uint256 index = 0;
        for (uint256 i=0; i< existingTokens;i++){
            uint256 tokenId = i+1;
            if(creators[tokenId] != msg.sender) continue;
            createdNFTs[index] = tokenId;
            index +=1; 

        }

        return createdNFTs;
    }

}