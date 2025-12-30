// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DigiCats.sol";
import "./KittyToken.sol";

/**
 * @title KittyMarketplace
 * @dev Marketplace for trading digiCats NFTs with fixed price and auction support
 */
contract KittyMarketplace is ReentrancyGuard, Ownable {
    digiCats public digiCats;
    KittyToken public kittyToken;
    
    // Marketplace fee (2.5%)
    uint256 public constant MARKETPLACE_FEE = 250; // 250 basis points = 2.5%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }
    
    // Auction structure
    struct Auction {
        uint256 tokenId;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 auctionEnd;
        bool active;
        uint256 minBidIncrement;
    }
    
    // State variables
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => bool) public isAuctioned;
    
    uint256[] public activeListings;
    uint256[] public activeAuctions;
    
    // Sales tracking
    struct Sale {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
        bool isAuction;
    }
    
    mapping(address => Sale[]) public userSaleHistory;
    Sale[] public allSales;
    
    // Events
    event KittyListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event KittyPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    
    event AuctionCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration
    );
    
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 finalPrice
    );
    
    constructor(address _digiCatsAddress, address _kittyTokenAddress) Ownable(msg.sender) {
        digiCats = digiCats(_digiCatsAddress);
        kittyToken = KittyToken(_kittyTokenAddress);
    }
    
    /**
     * @dev List a kitty for fixed price sale
     */
    function listKitty(uint256 tokenId, uint256 price) external nonReentrant {
        require(digiCats.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!isListed[tokenId] && !isAuctioned[tokenId], "Already listed or auctioned");
        require(price > 0, "Price must be greater than 0");
        require(
            digiCats.isApprovedForAll(msg.sender, address(this)) ||
            digiCats.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        
        isListed[tokenId] = true;
        activeListings.push(tokenId);
        
        emit KittyListed(tokenId, msg.sender, price, block.timestamp);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        require(isListed[tokenId], "Not listed");
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Listing not active");
        
        listings[tokenId].active = false;
        isListed[tokenId] = false;
        _removeFromActiveListings(tokenId);
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Purchase a listed kitty
     */
    function purchaseKitty(uint256 tokenId) external nonReentrant {
        require(isListed[tokenId], "Not listed");
        require(listings[tokenId].active, "Listing not active");
        
        Listing memory listing = listings[tokenId];
        require(msg.sender != listing.seller, "Cannot buy your own kitty");
        require(
            kittyToken.balanceOf(msg.sender) >= listing.price,
            "Insufficient balance"
        );
        
        // Calculate fees
        uint256 marketplaceFee = (listing.price * MARKETPLACE_FEE) / BASIS_POINTS;
        uint256 sellerAmount = listing.price - marketplaceFee;
        
        // Transfer payment
        require(
            kittyToken.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Payment to seller failed"
        );
        require(
            kittyToken.transferFrom(msg.sender, owner(), marketplaceFee),
            "Fee payment failed"
        );
        
        // Transfer NFT
        digiCats.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        // Update listing state
        listings[tokenId].active = false;
        isListed[tokenId] = false;
        _removeFromActiveListings(tokenId);
        
        // Record sale
        Sale memory sale = Sale({
            tokenId: tokenId,
            seller: listing.seller,
            buyer: msg.sender,
            price: listing.price,
            timestamp: block.timestamp,
            isAuction: false
        });
        
        userSaleHistory[listing.seller].push(sale);
        userSaleHistory[msg.sender].push(sale);
        allSales.push(sale);
        
        emit KittyPurchased(tokenId, msg.sender, listing.seller, listing.price, block.timestamp);
    }
    
    /**
     * @dev Create an auction for a kitty
     */
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration,
        uint256 minBidIncrement
    ) external nonReentrant {
        require(digiCats.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!isListed[tokenId] && !isAuctioned[tokenId], "Already listed or auctioned");
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(reservePrice >= startingPrice, "Reserve price too low");
        require(duration >= 1 hours && duration <= 7 days, "Invalid auction duration");
        require(minBidIncrement > 0, "Min bid increment must be greater than 0");
        require(
            digiCats.isApprovedForAll(msg.sender, address(this)) ||
            digiCats.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            currentBid: 0,
            currentBidder: address(0),
            auctionEnd: block.timestamp + duration,
            active: true,
            minBidIncrement: minBidIncrement
        });
        
        isAuctioned[tokenId] = true;
        activeAuctions.push(tokenId);
        
        emit AuctionCreated(tokenId, msg.sender, startingPrice, reservePrice, duration);
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 tokenId, uint256 bidAmount) external nonReentrant {
        require(isAuctioned[tokenId], "Not auctioned");
        require(auctions[tokenId].active, "Auction not active");
        require(block.timestamp < auctions[tokenId].auctionEnd, "Auction ended");
        
        Auction storage auction = auctions[tokenId];
        require(msg.sender != auction.seller, "Cannot bid on your own auction");
        
        uint256 minBid = auction.currentBid == 0 ? 
            auction.startingPrice : 
            auction.currentBid + auction.minBidIncrement;
        
        require(bidAmount >= minBid, "Bid too low");
        require(
            kittyToken.balanceOf(msg.sender) >= bidAmount,
            "Insufficient balance"
        );
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            require(
                kittyToken.transfer(auction.currentBidder, auction.currentBid),
                "Refund failed"
            );
        }
        
        // Lock new bid
        require(
            kittyToken.transferFrom(msg.sender, address(this), bidAmount),
            "Bid payment failed"
        );
        
        auction.currentBid = bidAmount;
        auction.currentBidder = msg.sender;
        
        emit BidPlaced(tokenId, msg.sender, bidAmount, block.timestamp);
    }
    
    /**
     * @dev End an auction and transfer the kitty
     */
    function endAuction(uint256 tokenId) external nonReentrant {
        require(isAuctioned[tokenId], "Not auctioned");
        require(auctions[tokenId].active, "Auction not active");
        require(block.timestamp >= auctions[tokenId].auctionEnd, "Auction still active");
        
        Auction storage auction = auctions[tokenId];
        
        if (auction.currentBid >= auction.reservePrice && auction.currentBidder != address(0)) {
            // Calculate fees
            uint256 marketplaceFee = (auction.currentBid * MARKETPLACE_FEE) / BASIS_POINTS;
            uint256 sellerAmount = auction.currentBid - marketplaceFee;
            
            // Transfer payment to seller
            require(
                kittyToken.transfer(auction.seller, sellerAmount),
                "Payment to seller failed"
            );
            require(
                kittyToken.transfer(owner(), marketplaceFee),
                "Fee payment failed"
            );
            
            // Transfer NFT to winner
            digiCats.safeTransferFrom(auction.seller, auction.currentBidder, tokenId);
            
            // Record sale
            Sale memory sale = Sale({
                tokenId: tokenId,
                seller: auction.seller,
                buyer: auction.currentBidder,
                price: auction.currentBid,
                timestamp: block.timestamp,
                isAuction: true
            });
            
            userSaleHistory[auction.seller].push(sale);
            userSaleHistory[auction.currentBidder].push(sale);
            allSales.push(sale);
            
            emit KittyPurchased(
                tokenId, 
                auction.currentBidder, 
                auction.seller, 
                auction.currentBid, 
                block.timestamp
            );
            emit AuctionEnded(tokenId, auction.currentBidder, auction.currentBid);
        } else {
            // Reserve not met, refund bidder
            if (auction.currentBidder != address(0)) {
                require(
                    kittyToken.transfer(auction.currentBidder, auction.currentBid),
                    "Refund failed"
                );
            }
            emit AuctionEnded(tokenId, address(0), 0);
        }
        
        // Cleanup auction
        auction.active = false;
        isAuctioned[tokenId] = false;
        _removeFromActiveAuctions(tokenId);
    }
    
    /**
     * @dev Get active listings with pagination
     */
    function getActiveListings(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        require(offset < activeListings.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > activeListings.length) {
            end = activeListings.length;
        }
        
        Listing[] memory result = new Listing[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = listings[activeListings[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get active auctions with pagination
     */
    function getActiveAuctions(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Auction[] memory) 
    {
        require(offset < activeAuctions.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > activeAuctions.length) {
            end = activeAuctions.length;
        }
        
        Auction[] memory result = new Auction[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = auctions[activeAuctions[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get user's sale history
     */
    function getUserSaleHistory(address user) external view returns (Sale[] memory) {
        return userSaleHistory[user];
    }
    
    /**
     * @dev Get total number of sales
     */
    function getTotalSales() external view returns (uint256) {
        return allSales.length;
    }
    
    /**
     * @dev Get recent sales with pagination
     */
    function getRecentSales(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Sale[] memory) 
    {
        require(offset < allSales.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allSales.length) {
            end = allSales.length;
        }
        
        Sale[] memory result = new Sale[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allSales[allSales.length - 1 - i]; // Reverse order for recent first
        }
        
        return result;
    }
    
    /**
     * @dev Internal function to remove from active listings array
     */
    function _removeFromActiveListings(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Internal function to remove from active auctions array
     */
    function _removeFromActiveAuctions(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeAuctions.length; i++) {
            if (activeAuctions[i] == tokenId) {
                activeAuctions[i] = activeAuctions[activeAuctions.length - 1];
                activeAuctions.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Emergency function to cancel auction by owner
     */
    function emergencyCancelAuction(uint256 tokenId) external onlyOwner {
        require(isAuctioned[tokenId], "Not auctioned");
        require(auctions[tokenId].active, "Auction not active");
        
        Auction storage auction = auctions[tokenId];
        
        // Refund current bidder if any
        if (auction.currentBidder != address(0)) {
            require(
                kittyToken.transfer(auction.currentBidder, auction.currentBid),
                "Refund failed"
            );
        }
        
        auction.active = false;
        isAuctioned[tokenId] = false;
        _removeFromActiveAuctions(tokenId);
    }
}
