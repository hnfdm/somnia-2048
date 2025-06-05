let web3;
let contract;
let userAccount;
let blockchainBestScore = "0"; // Track contract's high score

const contractAddress = "0x2c416ae233643aa582b2efdf8d74ae5586a890ec";
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "LeaderboardUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "ScoreUpdated",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_score", "type": "uint256" }],
    "name": "updateScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLeaderboard",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "score", "type": "uint256" }
        ],
        "internalType": "struct ScoreStorage.LeaderboardEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_player", "type": "address" }],
    "name": "getScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "highScores",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "leaderboard",
    "outputs": [
      { "internalType": "address", "name": "player", "type": "address" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize Web3
async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        throw new Error("No accounts found in MetaMask");
      }
      userAccount = accounts[0];
      const walletAddressElement = document.getElementById("wallet-address");
      if (walletAddressElement) {
        walletAddressElement.innerText = `Connected: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
      }
      contract = new web3.eth.Contract(contractABI, contractAddress);
      const walletButton = document.getElementById("connect-wallet");
      if (walletButton) {
        walletButton.innerText = "Disconnect Wallet";
        walletButton.classList.remove("disconnected");
        walletButton.classList.add("connected");
        walletButton.removeEventListener("click", initWeb3);
        walletButton.addEventListener("click", disconnectWallet);
      }
      await loadHighScore();
      await loadLeaderboard();
    } catch (error) {
      console.error("Wallet connection error:", error.message, error.stack);
      alert("Failed to connect wallet. Ensure MetaMask is installed, set to Somnia Testnet (Chain ID: 0xc488), and unlocked.");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// Disconnect wallet
function disconnectWallet() {
  userAccount = null;
  contract = null;
  blockchainBestScore = "0";
  const walletAddressElement = document.getElementById("wallet-address");
  if (walletAddressElement) {
    walletAddressElement.innerText = "No wallet connected";
  }
  const walletButton = document.getElementById("connect-wallet");
  if (walletButton) {
    walletButton.innerText = "Connect Wallet";
    walletButton.classList.remove("connected");
    walletButton.classList.add("disconnected");
    walletButton.removeEventListener("click", disconnectWallet);
    walletButton.addEventListener("click", initWeb3);
  }
  const bestContainer = document.getElementById("best-container");
  if (bestContainer) {
    bestContainer.innerText = "0";
  }
  const leaderboardBody = document.getElementById("leaderboard-body");
  if (leaderboardBody) {
    leaderboardBody.innerHTML = "";
  }
}

// Load user's high score from contract
async function loadHighScore() {
  const bestContainer = document.getElementById("best-container");
  if (!bestContainer) {
    console.error("best-container element not found in DOM");
    return "0";
  }
  if (contract && userAccount) {
    try {
      const score = await contract.methods.getScore(userAccount).call();
      blockchainBestScore = score ? score.toString() : "0";
      bestContainer.innerText = blockchainBestScore;
      console.log("High score loaded for", userAccount, ":", blockchainBestScore);
      return blockchainBestScore;
    } catch (error) {
      console.error("Error loading high score:", error.message, error.stack);
      blockchainBestScore = "0";
      bestContainer.innerText = "0";
      return "0";
    }
  } else {
    console.warn("Cannot load high score: No contract or user account");
    blockchainBestScore = "0";
    bestContainer.innerText = "0";
    return "0";
  }
}

// Load leaderboard
async function loadLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboard-body");
  if (!leaderboardBody) {
    console.error("leaderboard-body element not found in DOM");
    return;
  }
  if (contract) {
    try {
      const leaderboard = await contract.methods.getLeaderboard().call();
      console.log("Leaderboard data:", JSON.stringify(leaderboard, null, 2));
      leaderboardBody.innerHTML = "";
      if (leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0) {
        leaderboard.forEach((entry, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.player.slice(0, 6)}...${entry.player.slice(-4)}</td>
            <td>${entry.score}</td>
          `;
          leaderboardBody.appendChild(row);
        });
      } else {
        leaderboardBody.innerHTML = "<tr><td colspan='3'>No scores yet</td></tr>";
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error.message, error.stack);
      leaderboardBody.innerHTML = "<tr><td colspan='3'>Failed to load leaderboard: " + error.message + "</td></tr>";
    }
  } else {
    console.warn("Cannot load leaderboard: No contract instance");
    leaderboardBody.innerHTML = "<tr><td colspan='3'>Connect wallet to view leaderboard</td></tr>";
  }
}

// Update score on blockchain
async function updateHighScore(score) {
  console.log("updateHighScore called with score:", score);
  if (!userAccount || !contract || !(await web3.eth.getAccounts()).length) {
    console.log("Wallet not connected, prompting user to connect");
    const prompt = document.getElementById("wallet-prompt");
    if (!prompt) {
      console.error("wallet-prompt element not found, falling back to confirm");
      const shouldConnect = confirm("Please connect your wallet to update your high score on the leaderboard. Click OK to connect.");
      if (shouldConnect) {
        await initWeb3();
        if (!userAccount || !contract) {
          alert("Wallet connection failed. Please try again.");
          return;
        }
      } else {
        console.log("User declined to connect wallet");
        return;
      }
    } else {
      prompt.style.display = "block";
      return new Promise((resolve) => {
        const connectNow = document.getElementById("connect-now");
        const cancelPrompt = document.getElementById("cancel-prompt");
        if (!connectNow || !cancelPrompt) {
          console.error("Modal buttons not found");
          prompt.style.display = "none";
          resolve();
          return;
        }
        connectNow.onclick = async () => {
          prompt.style.display = "none";
          await initWeb3();
          if (userAccount && contract) {
            await submitScore(score);
          }
          resolve();
        };
        cancelPrompt.onclick = () => {
          prompt.style.display = "none";
          console.log("User declined to connect wallet");
          resolve();
        };
      });
    }
  } else {
    await submitScore(score);
  }
}

async function submitScore(score) {
  let currentHighScore = "0";
  try {
    currentHighScore = await loadHighScore();
    console.log("Current high score on blockchain:", currentHighScore, "New score:", score);
    if (parseInt(score) <= parseInt(currentHighScore)) {
      console.log("New score is not higher than current high score, skipping update");
      alert("Your new score (" + score + ") is not higher than your current high score (" + currentHighScore + "). Try achieving a higher score!");
      return;
    }
    const walletButton = document.getElementById("connect-wallet");
    if (walletButton) {
      walletButton.innerText = "Updating Score...";
      walletButton.disabled = true;
    }
    console.log("Sending transaction to update score:", score);
    await contract.methods.updateScore(score).send({ from: userAccount });
    console.log("Score updated on blockchain:", score);
    await loadHighScore();
    await loadLeaderboard();
    alert("Score updated successfully!");
  } catch (error) {
    console.error("Error updating score:", error.message, error.stack);
    alert("Failed to update score. Ensure you have enough STT tokens and the score is higher than your current high score (" + currentHighScore + "). Error: " + error.message);
  } finally {
    const walletButton = document.getElementById("connect-wallet");
    if (walletButton) {
      walletButton.innerText = userAccount ? "Disconnect Wallet" : "Connect Wallet";
      walletButton.disabled = false;
    }
  }
}

// Connect Wallet button
document.addEventListener("DOMContentLoaded", () => {
  const walletButton = document.getElementById("connect-wallet");
  if (walletButton) {
    walletButton.addEventListener("click", initWeb3);
  }
});

// Refresh Leaderboard button
document.addEventListener("DOMContentLoaded", () => {
  const refreshButton = document.getElementById("refresh-leaderboard");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      console.log("Refreshing leaderboard");
      await loadLeaderboard();
    });
  }
});

// Export functions
window.updateHighScore = updateHighScore;
window.getBlockchainBestScore = () => blockchainBestScore;