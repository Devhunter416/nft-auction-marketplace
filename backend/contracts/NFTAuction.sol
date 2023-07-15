// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/// @custom:security-contact Johel Castillo johel.castillov@gmail.com
contract NFTAuction is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    uint8 public constant STATUS_OPEN = 1;
    uint8 public constant STATUS_DONE = 2;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _auctionIdCounter;
    IERC721Upgradeable nftContract;
    uint256 public minAuctionIncrement;
    uint256[] public activeAuctions;

    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 price;
        uint256 startAt;
        uint256 endAt;
        uint8 status;
    }

    event AuctionCreated(
        uint256 auctionId,
        address indexed seller,
        uint256 price,
        uint256 tokenId,
        uint256 startAt,
        uint256 endAt
    );
    event BidCreated(uint256 indexed auctionId, address indexed bidder, uint256 bid);
    event AuctionCompleted(
        uint256 auctionId,
        address indexed seller,
        address indexed bidder,
        uint256 bid
    );
    event WithdrawBid(uint256 indexed auctionId, address indexed bidder, uint256 bid);

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;

    mapping(uint256 => address) public highestBidder;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _nftAddress) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        nftContract = IERC721Upgradeable(_nftAddress);
        minAuctionIncrement = 10;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * @notice this function allows to create an auction
     * @param price initial price of the auction
     * @param tokenId tokenId of the NFT contract
     * @param durationInSeconds duration of the auction in seconds
     */
    function createAuction(
        uint256 price,
        uint256 tokenId,
        uint256 durationInSeconds
    ) public returns (uint256) {
        uint256 auctionId = _auctionIdCounter.current();
        _auctionIdCounter.increment();
        uint256 startAt = block.timestamp;
        uint256 endAt = startAt + durationInSeconds;

        auctions[auctionId] = Auction({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            status: STATUS_OPEN,
            startAt: startAt,
            endAt: endAt
        });
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        emit AuctionCreated(
            auctionId,
            msg.sender,
            price,
            tokenId,
            startAt,
            endAt
        );
        return auctionId;
    }

    /**
     * @notice this function will place a bid at the auction
     * @param auctionId identifier of the auction
     */
    function bid(uint256 auctionId) public payable nonReentrant {
        require(_isAuctionOpen(auctionId), "auction has ended");
        Auction storage auction = auctions[auctionId];
        require(msg.sender != auction.seller, "cannot bid on what you own");
        uint256 newBid = bids[auctionId][msg.sender] + msg.value;
        uint256 incentive = auction.price / minAuctionIncrement;
        require(newBid >= auction.price + incentive, "Not enough funds to bid on NFT");
        bids[auctionId][msg.sender] = newBid;
        highestBidder[auctionId] = msg.sender;
        auction.price = newBid;
        emit BidCreated(auctionId, msg.sender, newBid);
    }

    /**
     * @notice this function allows the auction to be completed by either the seller or the highest bidder
     * @param auctionId identifier of the auction
     */
    function completeAuction(uint256 auctionId) public nonReentrant {
        require(!_isAuctionOpen(auctionId), "auction is still open");

        Auction storage auction = auctions[auctionId];
        address winner = highestBidder[auctionId];
        require(
            msg.sender == auction.seller || msg.sender == winner,
            "only seller or winner can complete auction"
        );

        if (winner != address(0)) {
            nftContract.transferFrom(address(this), winner, auction.tokenId);
            uint256 amount = bids[auctionId][winner];
            bids[auctionId][winner] = 0;
            _transferFund(payable(auction.seller), amount);
        } else {
            nftContract.transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
        }

        auction.status = STATUS_DONE;

        emit AuctionCompleted(
            auctionId,
            auction.seller,
            winner,
            bids[auctionId][winner]
        );
    }

    function _transferFund(address payable to, uint256 amount) internal {
        require(to != address(0), "Error, cannot transfer to address(0)");
        (bool transferSent, ) = to.call{value: amount}("");
        require(transferSent, "Error, failed to send Ether");
    }

    /**
     * @notice this function allows a user to withdraw their bid if the auction has ended and they are not the highest bidder
     * @param auctionId identifier of the auction
     */
    function withdrawBid(uint256 auctionId) public nonReentrant {
        require(_isAuctionExpired(auctionId), "auction must be ended");
        require(
            highestBidder[auctionId] != msg.sender,
            "highest bidder cannot withdraw bid"
        );
        require(
            bids[auctionId][msg.sender] != 0,
            "user  has no bids to withdraw"
        );
        uint256 balance = bids[auctionId][msg.sender];

        bids[auctionId][msg.sender] = 0;
        _transferFund(payable(msg.sender), balance);
        emit WithdrawBid(auctionId, msg.sender, balance);
    }

    function _isAuctionExpired(uint256 id) internal view returns (bool) {
        return auctions[id].endAt <= block.timestamp;
    }

    function _isAuctionOpen(uint256 id) internal view returns (bool) {
        return
            auctions[id].status == STATUS_OPEN &&
            auctions[id].endAt > block.timestamp;
    }

    function getAllAuctions() public view returns (Auction[] memory Auctions) {
        uint totalItemsCount = _auctionIdCounter.current();
        Auctions = new Auction[](totalItemsCount);

        for (uint i = 0; i < totalItemsCount; i++) {
            Auctions[i] = auctions[i];
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
