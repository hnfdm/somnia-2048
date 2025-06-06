// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScoreStorage {
    address public owner;
    uint256 public constant ENTRY_FEE = 0.01 ether; // 0.01 STT
    mapping(address => uint256) public highScores;
    mapping(address => bool) public hasPaidEntryFee; // Tracks if player has paid
    uint256 public totalFees; // Accumulated fees in contract

    struct LeaderboardEntry {
        address player;
        uint256 score;
    }
    LeaderboardEntry[] public leaderboard;

    event ScoreUpdated(address indexed player, uint256 score);
    event LeaderboardUpdated(address indexed player, uint256 score);
    event EntryFeePaid(address indexed player, uint256 amount);
    event EntryFeeRefunded(address indexed player, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Player pays entry fee to play
    function payEntryFee() external payable {
        require(msg.value == ENTRY_FEE, "Entry fee must be 0.01 STT");
        require(!hasPaidEntryFee[msg.sender], "Entry fee already paid for this session");
        hasPaidEntryFee[msg.sender] = true;
        totalFees += msg.value;
        emit EntryFeePaid(msg.sender, msg.value);
    }

    // Update score and refund entry fee if new high score
    function updateScore(uint256 _score) external {
        require(hasPaidEntryFee[msg.sender], "Must pay entry fee to play");
        bool newHighScore = _score > highScores[msg.sender];

        if (newHighScore) {
            highScores[msg.sender] = _score;
            emit ScoreUpdated(msg.sender, _score);
            updateLeaderboard(msg.sender, _score);

            // Automatically refund entry fee
            if (totalFees >= ENTRY_FEE) {
                totalFees -= ENTRY_FEE;
                (bool success, ) = msg.sender.call{value: ENTRY_FEE}("");
                require(success, "Refund failed");
                emit EntryFeeRefunded(msg.sender, ENTRY_FEE);
            }
        }

        // Reset entry fee status after each game attempt
        hasPaidEntryFee[msg.sender] = false;
    }

    // Owner withdraws accumulated fees
    function withdrawFees() external onlyOwner {
        require(totalFees > 0, "No fees to withdraw");
        uint256 amount = totalFees;
        totalFees = 0;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FeesWithdrawn(owner, amount);
    }

    function updateLeaderboard(address _player, uint256 _score) internal {
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == _player) {
                leaderboard[i] = leaderboard[leaderboard.length - 1];
                leaderboard.pop();
                break;
            }
        }
        leaderboard.push(LeaderboardEntry(_player, _score));
        if (leaderboard.length > 1) {
            for (uint256 i = leaderboard.length - 1; i > 0; i--) {
                if (leaderboard[i].score > leaderboard[i - 1].score) {
                    LeaderboardEntry memory temp = leaderboard[i];
                    leaderboard[i] = leaderboard[i - 1];
                    leaderboard[i - 1] = temp;
                }
            }
        }
        if (leaderboard.length > 10) {
            leaderboard.pop();
        }
        emit LeaderboardUpdated(_player, _score);
    }

    function getScore(address _player) public view returns (uint256) {
        return highScores[_player];
    }

    function getLeaderboard() public view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }

    // Allow contract to receive STT
    receive() external payable {}
}