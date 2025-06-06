// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScoreStorage {
    mapping(address => uint256) public highScores;
    struct LeaderboardEntry {
        address player;
        uint256 score;
    }
    LeaderboardEntry[] public leaderboard;
    event ScoreUpdated(address indexed player, uint256 score);
    event LeaderboardUpdated(address indexed player, uint256 score);

    function updateScore(uint256 _score) public {
        require(_score > highScores[msg.sender], "New score must be higher than current high score");
        highScores[msg.sender] = _score;
        emit ScoreUpdated(msg.sender, _score);
        updateLeaderboard(msg.sender, _score);
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
}