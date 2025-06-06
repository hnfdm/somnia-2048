let web3;
let contract;
let userAccount;

const contractAddress = "0x3dff2d1be115447ba3ee61e16be61b58c30fba56"; // Current contract address
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "EntryFeePaid",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "EntryFeeRefunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FeesWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "GameEnded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "LeaderboardUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "ScoreUpdated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ENTRY_FEE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLeaderboard",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "player",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "score",
                        "type": "uint256"
                    }
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
        "inputs": [
            {
                "internalType": "address",
                "name": "_player",
                "type": "address"
            }
        ],
        "name": "getScore",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasPaidEntryFee",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "highScores",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "leaderboard",
        "outputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payEntryFee",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_score",
                "type": "uint256"
            }
        ],
        "name": "updateScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

let blockchainBestScore = "0"; // Track contract's high score
let hasPaidEntryFee = false; // Track if user has paid entry fee for the current game

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
    hasPaidEntryFee = false;
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

// Check if user has paid the entry fee
async function checkEntryFeeStatus() {
    if (contract && userAccount) {
        try {
            hasPaidEntryFee = await contract.methods.hasPaidEntryFee(userAccount).call();
            console.log("Entry fee status for", userAccount, ":", hasPaidEntryFee);
            if (!hasPaidEntryFee) {
                await promptEntryFeePayment();
            }
        } catch (error) {
            console.error("Error checking entry fee status:", error.message, error.stack);
            hasPaidEntryFee = false;
            await promptEntryFeePayment();
        }
    } else {
        console.warn("Cannot check entry fee status: No contract or user account");
        hasPaidEntryFee = false;
        await promptEntryFeePayment();
    }
    return hasPaidEntryFee;
}

// Prompt user to pay entry fee
async function promptEntryFeePayment() {
    if (!userAccount || !contract || !(await web3.eth.getAccounts()).length) {
        console.log("Wallet not connected, prompting user to connect");
        const prompt = document.getElementById("wallet-prompt");
        if (!prompt) {
            console.error("wallet-prompt element not found, falling back to confirm");
            const shouldConnect = confirm("Please connect your wallet to pay the entry fee and play. Click OK to connect.");
            if (shouldConnect) {
                await initWeb3();
                if (!userAccount || !contract) {
                    alert("Wallet connection failed. Please try again.");
                    return false;
                }
            } else {
                console.log("User declined to connect wallet");
                return false;
            }
        } else {
            prompt.style.display = "block";
            return new Promise((resolve) => {
                const connectNow = document.getElementById("connect-now");
                const cancelPrompt = document.getElementById("cancel-prompt");
                if (!connectNow || !cancelPrompt) {
                    console.error("Modal buttons not found");
                    prompt.style.display = "none";
                    resolve(false);
                    return;
                }
                connectNow.onclick = async () => {
                    prompt.style.display = "none";
                    await initWeb3();
                    if (userAccount && contract) {
                        await payEntryFee();
                    }
                    resolve(true);
                };
                cancelPrompt.onclick = () => {
                    prompt.style.display = "none";
                    console.log("User declined to connect wallet");
                    resolve(false);
                };
            });
        }
    } else {
        await payEntryFee();
        return true;
    }
}

// Pay the entry fee
async function payEntryFee() {
    try {
        const entryFee = await contract.methods.ENTRY_FEE().call();
        console.log("Paying entry fee:", web3.utils.fromWei(entryFee, "ether"), "STT");
        const walletButton = document.getElementById("connect-wallet");
        if (walletButton) {
            walletButton.innerText = "Paying Entry Fee...";
            walletButton.disabled = true;
        }
        await contract.methods.payEntryFee().send({ from: userAccount, value: entryFee });
        hasPaidEntryFee = true;
        alert("Entry fee paid successfully! You can now play. You will need to pay the entry fee again for each new game.");
    } catch (error) {
        console.error("Error paying entry fee:", error.message, error.stack);
        alert("Failed to pay entry fee. Ensure you have enough STT tokens. Error: " + error.message);
        hasPaidEntryFee = false;
    } finally {
        const walletButton = document.getElementById("connect-wallet");
        if (walletButton) {
            walletButton.innerText = userAccount ? "Disconnect Wallet" : "Connect Wallet";
            walletButton.disabled = false;
        }
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
        const walletButton = document.getElementById("connect-wallet");
        if (walletButton) {
            walletButton.innerText = "Updating Score...";
            walletButton.disabled = true;
        }
        console.log("Sending transaction to update score:", score);
        const tx = await contract.methods.updateScore(score).send({ from: userAccount });
        console.log("Score updated on blockchain:", score);
        await loadHighScore();
        await loadLeaderboard();
        hasPaidEntryFee = false; // Reset fee status locally after game ends
        if (parseInt(score) > parseInt(currentHighScore)) {
            alert("New high score updated successfully! Your entry fee of 0.01 STT has been refunded. You will need to pay the entry fee again to start a new game.");
        } else {
            alert("Score updated. No new high score achieved, so no refund issued. You will need to pay the entry fee again to start a new game.");
        }
    } catch (error) {
        console.error("Error updating score:", error.message, error.stack);
        alert("Failed to update score. Ensure you have paid the entry fee and have enough STT tokens. Error: " + error.message);
        hasPaidEntryFee = false; // Reset fee status on failure
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
window.hasPaidEntryFee = () => hasPaidEntryFee;
window.checkEntryFeeStatus = checkEntryFeeStatus; // Expose for game_manager.js to call