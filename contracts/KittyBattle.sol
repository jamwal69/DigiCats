// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DigiCats.sol";
import "./KittyToken.sol";

/**
 * @title KittyBattle
 * @dev Battle system for DigiCats with turn-based combat
 */
contract KittyBattle is ReentrancyGuard, Ownable {
    DigiCats public digiCats;
    KittyToken public kittyToken;
    
    uint256 public constant BATTLE_ENTRY_FEE = 5 * 10**18; // 5 KITTY tokens
    uint256 public constant BATTLE_REWARD = 8 * 10**18; // 8 KITTY tokens (after 1 token burn)
    uint256 public constant BATTLE_TIMEOUT = 24 hours;
    
    enum BattleState { Pending, Active, Finished, Cancelled }
    
    struct Battle {
        uint256 battleId;
        address challenger;
        address opponent;
        uint256 challengerKittyId;
        uint256 opponentKittyId;
        BattleState state;
        address winner;
        uint256 createdAt;
        uint256 startedAt;
        uint256 finishedAt;
        uint8 turn; // 0 = challenger, 1 = opponent
        BattleStats challengerStats;
        BattleStats opponentStats;
    }
    
    struct BattleStats {
        uint16 health;
        uint16 maxHealth;
        uint16 strength;
        uint16 agility;
        uint16 intelligence;
        uint8 criticalChance; // Percentage
        uint8 dodgeChance; // Percentage
    }
    
    struct BattleMove {
        uint8 actionType; // 0 = attack, 1 = defend, 2 = special
        uint256 damage;
        bool isCritical;
        bool isDodged;
        uint256 timestamp;
    }
    
    // State variables
    uint256 private _battleIdCounter;
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => BattleMove[]) public battleActions;
    mapping(uint256 => bool) public kittyInBattle;
    mapping(address => uint256[]) public userBattles;
    
    uint256[] public pendingBattles;
    uint256[] public activeBattles;
    
    // Leaderboard
    mapping(address => uint256) public wins;
    mapping(address => uint256) public losses;
    mapping(address => uint256) public totalBattles;
    
    // Events
    event BattleCreated(
        uint256 indexed battleId,
        address indexed challenger,
        uint256 indexed challengerKittyId,
        uint256 timestamp
    );
    
    event BattleJoined(
        uint256 indexed battleId,
        address indexed opponent,
        uint256 indexed opponentKittyId,
        uint256 timestamp
    );
    
    event BattleAction(
        uint256 indexed battleId,
        address indexed player,
        uint8 actionType,
        uint256 damage,
        bool isCritical,
        bool isDodged
    );
    
    event BattleFinished(
        uint256 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 timestamp
    );
    
    constructor(address _digiCatsAddress, address _kittyTokenAddress) Ownable(msg.sender) {
        digiCats = DigiCats(_digiCatsAddress);
        kittyToken = KittyToken(_kittyTokenAddress);
        _battleIdCounter = 1;
    }
    
    /**
     * @dev Create a new battle challenge
     */
    function createBattle(uint256 kittyId) external nonReentrant {
        require(digiCats.ownerOf(kittyId) == msg.sender, "Not the owner");
        require(!kittyInBattle[kittyId], "Kitty already in battle");
        require(
            kittyToken.balanceOf(msg.sender) >= BATTLE_ENTRY_FEE,
            "Insufficient balance for entry fee"
        );
        
        // Transfer entry fee
        require(
            kittyToken.transferFrom(msg.sender, address(this), BATTLE_ENTRY_FEE),
            "Entry fee payment failed"
        );
        
        uint256 battleId = _battleIdCounter++;
        
        // Get kitty stats
        digiCats.Kitty memory kitty = digiCats.getKitty(kittyId);
        BattleStats memory challengerStats = _generateBattleStats(kitty);
        
        battles[battleId] = Battle({
            battleId: battleId,
            challenger: msg.sender,
            opponent: address(0),
            challengerKittyId: kittyId,
            opponentKittyId: 0,
            state: BattleState.Pending,
            winner: address(0),
            createdAt: block.timestamp,
            startedAt: 0,
            finishedAt: 0,
            turn: 0,
            challengerStats: challengerStats,
            opponentStats: BattleStats(0, 0, 0, 0, 0, 0, 0)
        });
        
        kittyInBattle[kittyId] = true;
        userBattles[msg.sender].push(battleId);
        pendingBattles.push(battleId);
        
        emit BattleCreated(battleId, msg.sender, kittyId, block.timestamp);
    }
    
    /**
     * @dev Join an existing battle
     */
    function joinBattle(uint256 battleId, uint256 kittyId) external nonReentrant {
        require(battles[battleId].state == BattleState.Pending, "Battle not available");
        require(battles[battleId].challenger != msg.sender, "Cannot join your own battle");
        require(digiCats.ownerOf(kittyId) == msg.sender, "Not the owner");
        require(!kittyInBattle[kittyId], "Kitty already in battle");
        require(
            kittyToken.balanceOf(msg.sender) >= BATTLE_ENTRY_FEE,
            "Insufficient balance for entry fee"
        );
        
        // Transfer entry fee
        require(
            kittyToken.transferFrom(msg.sender, address(this), BATTLE_ENTRY_FEE),
            "Entry fee payment failed"
        );
        
        Battle storage battle = battles[battleId];
        
        // Get kitty stats
        digiCats.Kitty memory kitty = digiCats.getKitty(kittyId);
        BattleStats memory opponentStats = _generateBattleStats(kitty);
        
        battle.opponent = msg.sender;
        battle.opponentKittyId = kittyId;
        battle.state = BattleState.Active;
        battle.startedAt = block.timestamp;
        battle.opponentStats = opponentStats;
        
        kittyInBattle[kittyId] = true;
        userBattles[msg.sender].push(battleId);
        
        // Move from pending to active
        _removeFromPendingBattles(battleId);
        activeBattles.push(battleId);
        
        emit BattleJoined(battleId, msg.sender, kittyId, block.timestamp);
    }
    
    /**
     * @dev Execute a battle action
     */
    function performAction(uint256 battleId, uint8 actionType) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.state == BattleState.Active, "Battle not active");
        require(
            (battle.turn == 0 && msg.sender == battle.challenger) ||
            (battle.turn == 1 && msg.sender == battle.opponent),
            "Not your turn"
        );
        require(actionType <= 2, "Invalid action type");
        
        // Check timeout
        require(
            block.timestamp <= battle.startedAt + BATTLE_TIMEOUT,
            "Battle timed out"
        );
        
        BattleStats storage attackerStats = battle.turn == 0 ? 
            battle.challengerStats : battle.opponentStats;
        BattleStats storage defenderStats = battle.turn == 0 ? 
            battle.opponentStats : battle.challengerStats;
        
        uint256 damage = 0;
        bool isCritical = false;
        bool isDodged = false;
        
        if (actionType == 0) { // Attack
            (damage, isCritical, isDodged) = _calculateAttackDamage(
                attackerStats, 
                defenderStats,
                battleId
            );
            
            if (!isDodged) {
                defenderStats.health = defenderStats.health > damage ? 
                    defenderStats.health - uint16(damage) : 0;
            }
        } else if (actionType == 1) { // Defend
            // Defending increases dodge chance for next turn
            defenderStats.dodgeChance = defenderStats.dodgeChance < 50 ? 
                defenderStats.dodgeChance + 10 : 50;
        } else if (actionType == 2) { // Special attack
            damage = _calculateSpecialAttack(attackerStats, defenderStats, battleId);
            defenderStats.health = defenderStats.health > damage ? 
                defenderStats.health - uint16(damage) : 0;
        }
        
        // Record action
        battleActions[battleId].push(BattleMove({
            actionType: actionType,
            damage: damage,
            isCritical: isCritical,
            isDodged: isDodged,
            timestamp: block.timestamp
        }));
        
        emit BattleAction(battleId, msg.sender, actionType, damage, isCritical, isDodged);
        
        // Check for battle end
        if (battle.challengerStats.health == 0 || battle.opponentStats.health == 0) {
            _finishBattle(battleId);
        } else {
            // Switch turns
            battle.turn = battle.turn == 0 ? 1 : 0;
        }
    }
    
    /**
     * @dev Generate battle stats from kitty genetics
     */
    function _generateBattleStats(digiCats.Kitty memory kitty) 
        internal 
        pure 
        returns (BattleStats memory) 
    {
        uint16 baseHealth = 100;
        uint16 health = baseHealth + (kitty.strength / 4) + (kitty.intelligence / 6);
        
        // Calculate secondary stats
        uint8 criticalChance = uint8((kitty.agility / 8) + 5); // 5-30%
        uint8 dodgeChance = uint8((kitty.agility / 10) + 3); // 3-23%
        
        // Cap the chances
        criticalChance = criticalChance > 30 ? 30 : criticalChance;
        dodgeChance = dodgeChance > 25 ? 25 : dodgeChance;
        
        return BattleStats({
            health: health,
            maxHealth: health,
            strength: kitty.strength,
            agility: kitty.agility,
            intelligence: kitty.intelligence,
            criticalChance: criticalChance,
            dodgeChance: dodgeChance
        });
    }
    
    /**
     * @dev Calculate attack damage with critical and dodge mechanics
     */
    function _calculateAttackDamage(
        BattleStats memory attacker,
        BattleStats memory defender,
        uint256 battleId
    ) internal view returns (uint256 damage, bool isCritical, bool isDodged) {
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            battleId,
            attacker.strength
        )));
        
        // Check for dodge
        if ((randomSeed % 100) < defender.dodgeChance) {
            return (0, false, true);
        }
        
        // Calculate base damage
        damage = attacker.strength + (randomSeed % 20) - 10; // ±10 variance
        damage = damage < 5 ? 5 : damage; // Minimum damage
        
        // Check for critical hit
        if (((randomSeed >> 8) % 100) < attacker.criticalChance) {
            damage = damage * 15 / 10; // 1.5x damage
            isCritical = true;
        }
        
        return (damage, isCritical, false);
    }
    
    /**
     * @dev Calculate special attack damage
     */
    function _calculateSpecialAttack(
        BattleStats memory attacker,
        BattleStats memory defender,
        uint256 battleId
    ) internal view returns (uint256) {
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            battleId,
            attacker.intelligence
        )));
        
        // Special attack uses intelligence and has guaranteed hit
        uint256 damage = (attacker.intelligence * 12 / 10) + (randomSeed % 15);
        return damage < 8 ? 8 : damage; // Minimum special damage
    }
    
    /**
     * @dev Finish the battle and distribute rewards
     */
    function _finishBattle(uint256 battleId) internal {
        Battle storage battle = battles[battleId];
        
        address winner;
        address loser;
        
        if (battle.challengerStats.health > 0) {
            winner = battle.challenger;
            loser = battle.opponent;
        } else {
            winner = battle.opponent;
            loser = battle.challenger;
        }
        
        battle.winner = winner;
        battle.state = BattleState.Finished;
        battle.finishedAt = block.timestamp;
        
        // Update stats
        wins[winner]++;
        losses[loser]++;
        totalBattles[winner]++;
        totalBattles[loser]++;
        
        // Distribute rewards (2 entry fees = 10 KITTY, burn 1, give 8 to winner, keep 1 as fee)
        kittyToken.burn(1 * 10**18); // Burn 1 KITTY for deflation
        require(
            kittyToken.transfer(winner, BATTLE_REWARD),
            "Reward transfer failed"
        );
        
        // Free kitties from battle
        kittyInBattle[battle.challengerKittyId] = false;
        kittyInBattle[battle.opponentKittyId] = false;
        
        // Remove from active battles
        _removeFromActiveBattles(battleId);
        
        emit BattleFinished(battleId, winner, loser, block.timestamp);
    }
    
    /**
     * @dev Cancel a pending battle (only by challenger)
     */
    function cancelBattle(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.state == BattleState.Pending, "Cannot cancel non-pending battle");
        require(battle.challenger == msg.sender, "Only challenger can cancel");
        
        battle.state = BattleState.Cancelled;
        kittyInBattle[battle.challengerKittyId] = false;
        
        // Refund entry fee
        require(
            kittyToken.transfer(msg.sender, BATTLE_ENTRY_FEE),
            "Refund failed"
        );
        
        _removeFromPendingBattles(battleId);
    }
    
    /**
     * @dev Force finish battle if timed out
     */
    function timeoutBattle(uint256 battleId) external {
        Battle storage battle = battles[battleId];
        require(battle.state == BattleState.Active, "Battle not active");
        require(
            block.timestamp > battle.startedAt + BATTLE_TIMEOUT,
            "Battle not timed out yet"
        );
        
        // Player whose turn it is loses by timeout
        address loser = battle.turn == 0 ? battle.challenger : battle.opponent;
        address winner = battle.turn == 0 ? battle.opponent : battle.challenger;
        
        battle.winner = winner;
        battle.state = BattleState.Finished;
        battle.finishedAt = block.timestamp;
        
        // Update stats
        wins[winner]++;
        losses[loser]++;
        totalBattles[winner]++;
        totalBattles[loser]++;
        
        // Distribute rewards
        kittyToken.burn(1 * 10**18);
        require(
            kittyToken.transfer(winner, BATTLE_REWARD),
            "Reward transfer failed"
        );
        
        // Free kitties
        kittyInBattle[battle.challengerKittyId] = false;
        kittyInBattle[battle.opponentKittyId] = false;
        
        _removeFromActiveBattles(battleId);
        
        emit BattleFinished(battleId, winner, loser, block.timestamp);
    }
    
    /**
     * @dev Get battle details with actions
     */
    function getBattleWithActions(uint256 battleId) 
        external 
        view 
        returns (Battle memory battle, BattleMove[] memory actions) 
    {
        return (battles[battleId], battleActions[battleId]);
    }
    
    /**
     * @dev Get user's battle history
     */
    function getUserBattles(address user) external view returns (uint256[] memory) {
        return userBattles[user];
    }
    
    /**
     * @dev Get pending battles
     */
    function getPendingBattles() external view returns (uint256[] memory) {
        return pendingBattles;
    }
    
    /**
     * @dev Get active battles
     */
    function getActiveBattles() external view returns (uint256[] memory) {
        return activeBattles;
    }
    
    /**
     * @dev Get leaderboard data
     */
    function getLeaderboardData(address user) 
        external 
        view 
        returns (uint256 userWins, uint256 userLosses, uint256 userTotal) 
    {
        return (wins[user], losses[user], totalBattles[user]);
    }
    
    // Internal helper functions
    function _removeFromPendingBattles(uint256 battleId) internal {
        for (uint256 i = 0; i < pendingBattles.length; i++) {
            if (pendingBattles[i] == battleId) {
                pendingBattles[i] = pendingBattles[pendingBattles.length - 1];
                pendingBattles.pop();
                break;
            }
        }
    }
    
    function _removeFromActiveBattles(uint256 battleId) internal {
        for (uint256 i = 0; i < activeBattles.length; i++) {
            if (activeBattles[i] == battleId) {
                activeBattles[i] = activeBattles[activeBattles.length - 1];
                activeBattles.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Emergency function to withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = kittyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        kittyToken.transfer(owner(), balance);
    }
}
