// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./KittyToken.sol";

/**
 * @title DigiCats
 * @dev Main NFT contract for DigiCats with advanced genetic system
 */
contract DigiCats is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // Genetic trait ranges
    uint8 public constant BODY_COLOR_MAX = 7;      // 0-7 (8 variations)
    uint8 public constant EYE_COLOR_MAX = 5;       // 0-5 (6 variations)
    uint8 public constant PATTERN_MAX = 4;         // 0-4 (5 variations)
    uint8 public constant ACCESSORY_MAX = 3;       // 0-3 (4 variations)
    uint8 public constant BACKGROUND_MAX = 2;      // 0-2 (3 variations)
    
    // Special traits and breeding constants
    uint8 public constant SPECIAL_TRAIT_CHANCE = 1; // 1% chance for special trait
    uint256 public constant MAX_GENERATION = 10;
    uint256 public constant BREEDING_COOLDOWN = 24 hours;
    uint256 public constant BREEDING_FEE = 10 * 10**18; // 10 KITTY tokens
    uint256 public constant MAX_GEN0_SUPPLY = 1000;
    
    // Rarity levels
    enum Rarity { Common, Uncommon, Rare, Epic, Legendary }
    
    // Kitty structure with complete genetic information
    struct Kitty {
        uint256 tokenId;
        uint8 generation;
        uint256 birthTime;
        uint256 lastBreedTime;
        uint256 matronId;      // Mother's ID (0 if Gen 0)
        uint256 sireId;        // Father's ID (0 if Gen 0)
        
        // Genetic traits
        uint8 bodyColor;
        uint8 eyeColor;
        uint8 pattern;
        uint8 accessory;
        uint8 background;
        bool hasSpecialTrait;
        
        // Battle stats (derived from genetics)
        uint16 strength;
        uint16 agility;
        uint16 intelligence;
    }
    
    // State variables
    KittyToken public kittyToken;
    uint256 private _tokenIdCounter;
    uint256 public gen0Minted;
    
    // Mappings
    mapping(uint256 => Kitty) public kitties;
    mapping(uint256 => bool) public isBreedingApproved;
    mapping(address => uint256[]) public ownerKitties;
    
    // Events
    event KittyBorn(
        uint256 indexed kittyId,
        uint256 indexed matronId,
        uint256 indexed sireId,
        uint8 generation,
        address owner
    );
    
    event BreedingApproved(uint256 indexed kittyId, bool approved);
    event KittyBred(uint256 indexed matronId, uint256 indexed sireId, uint256 indexed offspring);
    
    constructor(address _kittyTokenAddress) 
        ERC721("DigiCats", "DC") 
        Ownable(msg.sender) 
    {
        kittyToken = KittyToken(_kittyTokenAddress);
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @dev Advanced genetic algorithm for trait inheritance
     * Implements sophisticated inheritance with mutation chances
     */
    function _generateOffspringTraits(
        Kitty memory matron,
        Kitty memory sire,
        uint256 randomSeed
    ) internal pure returns (
        uint8 bodyColor,
        uint8 eyeColor,
        uint8 pattern,
        uint8 accessory,
        uint8 background,
        bool hasSpecialTrait
    ) {
        uint256 seed = randomSeed;
        
        // Body Color inheritance
        bodyColor = _inheritTrait(
            matron.bodyColor,
            sire.bodyColor,
            BODY_COLOR_MAX,
            _getRandom(seed, 1)
        );
        
        // Eye Color inheritance
        eyeColor = _inheritTrait(
            matron.eyeColor,
            sire.eyeColor,
            EYE_COLOR_MAX,
            _getRandom(seed, 2)
        );
        
        // Pattern inheritance
        pattern = _inheritTrait(
            matron.pattern,
            sire.pattern,
            PATTERN_MAX,
            _getRandom(seed, 3)
        );
        
        // Accessory inheritance
        accessory = _inheritTrait(
            matron.accessory,
            sire.accessory,
            ACCESSORY_MAX,
            _getRandom(seed, 4)
        );
        
        // Background inheritance
        background = _inheritTrait(
            matron.background,
            sire.background,
            BACKGROUND_MAX,
            _getRandom(seed, 5)
        );
        
        // Special trait inheritance and mutation
        hasSpecialTrait = _inheritSpecialTrait(
            matron.hasSpecialTrait,
            sire.hasSpecialTrait,
            _getRandom(seed, 6)
        );
    }
    
    /**
     * @dev Core trait inheritance logic with mutation
     */
    function _inheritTrait(
        uint8 trait1,
        uint8 trait2,
        uint8 maxValue,
        uint256 randomValue
    ) internal pure returns (uint8) {
        uint256 inheritanceChance = randomValue % 100;
        
        if (inheritanceChance < 45) {
            // 45% chance inherit from parent 1
            return trait1;
        } else if (inheritanceChance < 90) {
            // 45% chance inherit from parent 2
            return trait2;
        } else {
            // 10% chance of mutation within trait range
            return uint8(randomValue % (maxValue + 1));
        }
    }
    
    /**
     * @dev Special trait inheritance with mutation chance
     */
    function _inheritSpecialTrait(
        bool parent1Special,
        bool parent2Special,
        uint256 randomValue
    ) internal pure returns (bool) {
        // If either parent has special trait, 50% chance to inherit
        if (parent1Special || parent2Special) {
            return (randomValue % 100) < 50;
        }
        
        // If neither parent has it, 1% chance of mutation
        return (randomValue % 100) < SPECIAL_TRAIT_CHANCE;
    }
    
    /**
     * @dev Generate battle stats from genetic traits
     */
    function _generateBattleStats(
        uint8 bodyColor,
        uint8 eyeColor,
        uint8 pattern,
        uint8 accessory,
        uint8 background,
        bool hasSpecialTrait
    ) internal pure returns (uint16 strength, uint16 agility, uint16 intelligence) {
        // Base stats from traits
        strength = uint16(bodyColor * 12 + pattern * 8 + 50);
        agility = uint16(eyeColor * 15 + accessory * 10 + 60);
        intelligence = uint16(background * 20 + eyeColor * 8 + 70);
        
        // Special trait bonus
        if (hasSpecialTrait) {
            strength += 25;
            agility += 25;
            intelligence += 25;
        }
        
        // Cap stats at reasonable values
        strength = strength > 200 ? 200 : strength;
        agility = agility > 200 ? 200 : agility;
        intelligence = intelligence > 200 ? 200 : intelligence;
    }
    
    /**
     * @dev Calculate rarity based on traits
     */
    function calculateRarity(uint256 tokenId) public view returns (Rarity) {
        Kitty memory kitty = kitties[tokenId];
        
        if (kitty.hasSpecialTrait) {
            return Rarity.Legendary;
        }
        
        uint8 epicCount = 0;
        uint8 rareCount = 0;
        uint8 uncommonCount = 0;
        
        if (kitty.bodyColor >= 7) epicCount++;
        else if (kitty.bodyColor >= 5) rareCount++;
        else if (kitty.bodyColor >= 3) uncommonCount++;
        
        if (kitty.eyeColor >= 5) rareCount++;
        else if (kitty.eyeColor >= 3) uncommonCount++;
        
        if (kitty.pattern >= 4) uncommonCount++;
        if (kitty.accessory >= 3) uncommonCount++;
        if (kitty.background >= 2) uncommonCount++;
        
        if (epicCount > 0) return Rarity.Epic;
        if (rareCount > 0) return Rarity.Rare;
        if (uncommonCount > 0) return Rarity.Uncommon;
        
        return Rarity.Common;
    }
    
    /**
     * @dev Mint a Generation 0 kitty with random traits
     */
    function mintGen0Kitty(address to) external onlyOwner nonReentrant {
        require(gen0Minted < MAX_GEN0_SUPPLY, "Gen 0 supply exhausted");
        require(to != address(0), "Invalid address");
        
        uint256 tokenId = _tokenIdCounter++;
        gen0Minted++;
        
        // Generate random traits for Gen 0
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tokenId,
            to
        )));
        
        // Generate battle stats
        (uint16 strength, uint16 agility, uint16 intelligence) = _generateBattleStats(
            uint8(_getRandom(randomSeed, 1) % (BODY_COLOR_MAX + 1)),
            uint8(_getRandom(randomSeed, 2) % (EYE_COLOR_MAX + 1)),
            uint8(_getRandom(randomSeed, 3) % (PATTERN_MAX + 1)),
            uint8(_getRandom(randomSeed, 4) % (ACCESSORY_MAX + 1)),
            uint8(_getRandom(randomSeed, 5) % (BACKGROUND_MAX + 1)),
            (_getRandom(randomSeed, 6) % 100) < SPECIAL_TRAIT_CHANCE
        );
        
        // Create kitty
        kitties[tokenId] = Kitty({
            tokenId: tokenId,
            generation: 0,
            birthTime: block.timestamp,
            lastBreedTime: 0,
            matronId: 0,
            sireId: 0,
            bodyColor: uint8(_getRandom(randomSeed, 1) % (BODY_COLOR_MAX + 1)),
            eyeColor: uint8(_getRandom(randomSeed, 2) % (EYE_COLOR_MAX + 1)),
            pattern: uint8(_getRandom(randomSeed, 3) % (PATTERN_MAX + 1)),
            accessory: uint8(_getRandom(randomSeed, 4) % (ACCESSORY_MAX + 1)),
            background: uint8(_getRandom(randomSeed, 5) % (BACKGROUND_MAX + 1)),
            hasSpecialTrait: (_getRandom(randomSeed, 6) % 100) < SPECIAL_TRAIT_CHANCE,
            strength: strength,
            agility: agility,
            intelligence: intelligence
        });
        
        _safeMint(to, tokenId);
        ownerKitties[to].push(tokenId);
        
        emit KittyBorn(tokenId, 0, 0, 0, to);
    }
    
    /**
     * @dev Breed two kitties to create offspring
     */
    function breedKitties(uint256 matronId, uint256 sireId) external nonReentrant {
        require(_exists(matronId) && _exists(sireId), "Kitty does not exist");
        require(matronId != sireId, "Cannot breed with self");
        
        address matronOwner = ownerOf(matronId);
        address sireOwner = ownerOf(sireId);
        
        require(
            matronOwner == msg.sender || 
            sireOwner == msg.sender ||
            (isBreedingApproved[matronId] && isBreedingApproved[sireId]),
            "Not authorized to breed these kitties"
        );
        
        Kitty storage matron = kitties[matronId];
        Kitty storage sire = kitties[sireId];
        
        // Check breeding constraints
        require(
            block.timestamp >= matron.lastBreedTime + BREEDING_COOLDOWN,
            "Matron still in cooldown"
        );
        require(
            block.timestamp >= sire.lastBreedTime + BREEDING_COOLDOWN,
            "Sire still in cooldown"
        );
        
        uint8 newGeneration = matron.generation > sire.generation ? 
            matron.generation + 1 : sire.generation + 1;
        require(newGeneration <= MAX_GENERATION, "Max generation exceeded");
        
        // Charge breeding fee
        require(
            kittyToken.transferFrom(msg.sender, address(this), BREEDING_FEE),
            "Breeding fee payment failed"
        );
        
        // Generate offspring
        uint256 tokenId = _tokenIdCounter++;
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            matronId,
            sireId,
            tokenId
        )));
        
        // Generate offspring traits using advanced genetic algorithm
        (
            uint8 bodyColor,
            uint8 eyeColor,
            uint8 pattern,
            uint8 accessory,
            uint8 background,
            bool hasSpecialTrait
        ) = _generateOffspringTraits(matron, sire, randomSeed);
        
        // Generate battle stats
        (uint16 strength, uint16 agility, uint16 intelligence) = _generateBattleStats(
            bodyColor, eyeColor, pattern, accessory, background, hasSpecialTrait
        );
        
        // Create offspring kitty
        kitties[tokenId] = Kitty({
            tokenId: tokenId,
            generation: newGeneration,
            birthTime: block.timestamp,
            lastBreedTime: 0,
            matronId: matronId,
            sireId: sireId,
            bodyColor: bodyColor,
            eyeColor: eyeColor,
            pattern: pattern,
            accessory: accessory,
            background: background,
            hasSpecialTrait: hasSpecialTrait,
            strength: strength,
            agility: agility,
            intelligence: intelligence
        });
        
        // Update parent breeding times
        matron.lastBreedTime = block.timestamp;
        sire.lastBreedTime = block.timestamp;
        
        // Mint to breeder
        _safeMint(msg.sender, tokenId);
        ownerKitties[msg.sender].push(tokenId);
        
        // Burn 1% of breeding fee for deflationary mechanism
        uint256 burnAmount = BREEDING_FEE / 100;
        kittyToken.burn(burnAmount);
        
        emit KittyBorn(tokenId, matronId, sireId, newGeneration, msg.sender);
        emit KittyBred(matronId, sireId, tokenId);
    }
    
    /**
     * @dev Approve a kitty for breeding
     */
    function setBreedingApproval(uint256 tokenId, bool approved) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        isBreedingApproved[tokenId] = approved;
        emit BreedingApproved(tokenId, approved);
    }
    
    /**
     * @dev Get kitty details
     */
    function getKitty(uint256 tokenId) external view returns (Kitty memory) {
        require(_exists(tokenId), "Kitty does not exist");
        return kitties[tokenId];
    }
    
    /**
     * @dev Get all kitties owned by an address
     */
    function getKittiesByOwner(address owner) external view returns (uint256[] memory) {
        return ownerKitties[owner];
    }
    
    /**
     * @dev Check if kitty can breed
     */
    function canBreed(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        Kitty memory kitty = kitties[tokenId];
        return block.timestamp >= kitty.lastBreedTime + BREEDING_COOLDOWN;
    }
    
    /**
     * @dev Utility function to get random number from seed
     */
    function _getRandom(uint256 seed, uint256 salt) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed, salt)));
    }
    
    /**
     * @dev Required override for URI storage
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Check if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Required override for URI storage
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Emergency function to withdraw accumulated breeding fees
     */
    function withdrawBreedingFees() external onlyOwner {
        uint256 balance = kittyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        kittyToken.transfer(owner(), balance);
    }
}
