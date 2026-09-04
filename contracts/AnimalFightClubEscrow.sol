// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AnimalFightClubEscrow
 * @author Animal Fight Club Protocol
 * @notice Pari-mutuel spectator wagering escrow for Animal Fight Club duels on Somnia Shannon Testnet (Chain ID 50312).
 * @dev Supports native STT wagers, pull-payment payouts, on-chain owner exclusion, and zero-pool fallback protection.
 */
contract AnimalFightClubEscrow {
    enum Side { None, BeastA, BeastB }
    enum BattleStatus { Uninitialized, Pending, Resolved, Cancelled }

    struct BattleWagerState {
        address ownerA;
        address ownerB;
        uint256 bettingClosesAt;
        uint256 totalPoolA;
        uint256 totalPoolB;
        BattleStatus status;
        Side winner;
    }

    struct Wager {
        uint256 amount;
        Side side;
        bool claimed;
    }

    /// @notice Protocol administrator authority (backend combat resolver)
    address public immutable protocolAdmin;

    /// @notice Reentrancy lock
    uint256 private _locked = 1;

    /// @notice battleId hash => Battle state
    mapping(bytes32 => BattleWagerState) public battles;

    /// @notice battleId hash => bettor address => Wager
    mapping(bytes32 => mapping(address => Wager)) public wagers;

    // Events
    event BattleRegistered(
        bytes32 indexed battleId,
        address indexed ownerA,
        address indexed ownerB,
        uint256 bettingClosesAt
    );
    event WagerPlaced(
        bytes32 indexed battleId,
        address indexed bettor,
        Side side,
        uint256 amount
    );
    event BattleResolved(bytes32 indexed battleId, Side winner);
    event BattleCancelled(bytes32 indexed battleId);
    event PayoutClaimed(
        bytes32 indexed battleId,
        address indexed bettor,
        uint256 payoutAmount
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == protocolAdmin, "NotAuthorized");
        _;
    }

    modifier nonReentrant() {
        require(_locked == 1, "ReentrantCall");
        _locked = 2;
        _;
        _locked = 1;
    }

    constructor() {
        protocolAdmin = msg.sender;
    }

    /**
     * @notice Registers an accepted duel battle window for spectator betting.
     * @param battleId Unique identifier hash for the battle.
     * @param ownerA Wallet address of Beast A's owner.
     * @param ownerB Wallet address of Beast B's owner.
     * @param bettingClosesAt Unix timestamp when the 1-hour spectator window closes.
     */
    function registerBattle(
        bytes32 battleId,
        address ownerA,
        address ownerB,
        uint256 bettingClosesAt
    ) external onlyAdmin {
        require(battles[battleId].status == BattleStatus.Uninitialized, "BattleAlreadyRegistered");
        require(ownerA != address(0) && ownerB != address(0), "InvalidOwners");
        require(bettingClosesAt > block.timestamp, "InvalidDeadline");

        battles[battleId] = BattleWagerState({
            ownerA: ownerA,
            ownerB: ownerB,
            bettingClosesAt: bettingClosesAt,
            totalPoolA: 0,
            totalPoolB: 0,
            status: BattleStatus.Pending,
            winner: Side.None
        });

        emit BattleRegistered(battleId, ownerA, ownerB, bettingClosesAt);
    }

    /**
     * @notice Places a native STT wager on a combatant for a pending battle.
     * @param battleId The battle to wager on.
     * @param side The predicted victor (BeastA or BeastB).
     */
    function placeWager(bytes32 battleId, Side side) external payable nonReentrant {
        require(msg.value > 0, "ZeroWagerAmount");
        require(side == Side.BeastA || side == Side.BeastB, "InvalidSide");

        BattleWagerState storage b = battles[battleId];
        require(b.status == BattleStatus.Pending, "BattleNotOpenForBetting");
        require(block.timestamp < b.bettingClosesAt, "BettingWindowClosed");

        // Strict On-Chain Owner Exclusion
        require(msg.sender != b.ownerA && msg.sender != b.ownerB, "OwnerCannotWagerOnOwnBattle");

        Wager storage w = wagers[battleId][msg.sender];
        if (w.amount > 0) {
            require(w.side == side, "CannotWagerOnBothSides");
            w.amount += msg.value;
        } else {
            w.amount = msg.value;
            w.side = side;
            w.claimed = false;
        }

        if (side == Side.BeastA) {
            b.totalPoolA += msg.value;
        } else {
            b.totalPoolB += msg.value;
        }

        emit WagerPlaced(battleId, msg.sender, side, msg.value);
    }

    /**
     * @notice Records the final victor of a duel and closes betting settlement.
     * @param battleId The battle being resolved.
     * @param winner The winning side (BeastA or BeastB).
     */
    function resolveBattle(bytes32 battleId, Side winner) external onlyAdmin {
        BattleWagerState storage b = battles[battleId];
        require(b.status == BattleStatus.Pending, "BattleNotPending");
        require(winner == Side.BeastA || winner == Side.BeastB, "InvalidWinner");

        b.status = BattleStatus.Resolved;
        b.winner = winner;

        emit BattleResolved(battleId, winner);
    }

    /**
     * @notice Cancels a battle (e.g. invalid state), allowing all bettors to claim 100% refund.
     * @param battleId The battle to cancel.
     */
    function cancelBattle(bytes32 battleId) external onlyAdmin {
        BattleWagerState storage b = battles[battleId];
        require(b.status == BattleStatus.Pending, "BattleNotPending");

        b.status = BattleStatus.Cancelled;
        emit BattleCancelled(battleId);
    }

    /**
     * @notice Allows winning bettors (or refunded bettors) to claim their proportional payouts.
     * @dev Uses pull-payment pattern. Handles one-sided pools and zero-winner pools defensively.
     * @param battleId The battle to claim payouts from.
     */
    function claimPayout(bytes32 battleId) external nonReentrant {
        BattleWagerState storage b = battles[battleId];
        require(
            b.status == BattleStatus.Resolved || b.status == BattleStatus.Cancelled,
            "BattleNotClaimable"
        );

        Wager storage w = wagers[battleId][msg.sender];
        require(w.amount > 0, "NoWagerFound");
        require(!w.claimed, "AlreadyClaimed");

        w.claimed = true;
        uint256 payout = 0;

        if (b.status == BattleStatus.Cancelled) {
            // CASE 1: 100% Refund if battle was cancelled
            payout = w.amount;
        } else {
            uint256 winningPool = b.winner == Side.BeastA ? b.totalPoolA : b.totalPoolB;
            uint256 losingPool  = b.winner == Side.BeastA ? b.totalPoolB : b.totalPoolA;

            if (w.side == b.winner) {
                if (losingPool == 0) {
                    // CASE 2: 100% Principal refund if nobody bet on the losing side
                    payout = w.amount;
                } else {
                    // CASE 3: Proportional pari-mutuel winnings + principal deposit
                    uint256 profit = (w.amount * losingPool) / winningPool;
                    payout = w.amount + profit;
                }
            } else {
                // CASE 4: If nobody bet on the winner (winningPool == 0),
                // losing bettors receive a 100% refund rather than locking funds forever
                if (winningPool == 0) {
                    payout = w.amount;
                } else {
                    revert("WagerLost");
                }
            }
        }

        // Defensive safety check
        require(payout > 0, "ZeroPayout");

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "TransferFailed");

        emit PayoutClaimed(battleId, msg.sender, payout);
    }

    /**
     * @notice View function to inspect a battle's pool state and status.
     */
    function getBattle(bytes32 battleId) external view returns (BattleWagerState memory) {
        return battles[battleId];
    }

    /**
     * @notice View function to inspect a bettor's wager on a battle.
     */
    function getWager(bytes32 battleId, address bettor) external view returns (Wager memory) {
        return wagers[battleId][bettor];
    }
}
