// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts-upgradeable/access/AccessControlCrossChainUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/// @custom:security-contact Johel Castillo johel.castillov@gmail.com
contract NFT is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;

    struct NftItem{
        uint256 tokenId;
        string tokenURI;
    }

    struct NftUser{
        uint256 tokenId;
        string tokenURI;
        address owner;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }


    function initialize() initializer public {
        __ERC721_init("NFT", "MYNFT");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @notice this function allows you to create a new NFT indicating the uri
     * @param uri token uri
     */
    function mint(string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }
    /**
     * 
     * @notice this function return a list of nftItems(tokenId, tokenURI) of the contract
     */
    function getAllNfts() public view returns (NftUser[] memory) {
        uint256 tokenIdLast = _tokenIdCounter.current();
        NftUser[] memory items = new NftUser[](tokenIdLast);
        for (uint i = 0; i < tokenIdLast; i++) {
            NftUser memory item = NftUser(i,tokenURI(i), ownerOf(i));
            items[i] = item;
        }
        return items;
    }

        /**
     * 
     * @notice this function return a list of nftItems(tokenId, tokenURI) of the current sender
     */
    function getOwnedNfts() public view returns (NftItem[] memory) {
        uint ownedItemsCount = balanceOf(msg.sender);
        NftItem[] memory items = new NftItem[](ownedItemsCount);
        for (uint i = 0; i < ownedItemsCount; i++) {
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            NftItem memory item = NftItem(tokenId,tokenURI(tokenId));
            items[i] = item;
        }
        return items;
    }


    // The following functions are overrides required by Solidity.
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}


    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
