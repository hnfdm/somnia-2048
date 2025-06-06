const hre = require("hardhat");

async function main() {
    const contractAddress = "0x88A2A00eF93E008Ef6Ffc6448c5ae63252749b18"; // Your deployed contract address
    console.log("Fetching transaction hash for contract:", contractAddress);

    // Get the provider for Somnia Testnet
    const provider = hre.ethers.provider;

    // Get the contract's creation transaction receipt
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
        throw new Error("Contract not found at the specified address.");
    }

    // Get the latest block number
    const latestBlock = await provider.getBlockNumber();
    console.log("Latest block number:", latestBlock);

    // Search for the contract creation transaction in the last 1000 blocks (or all blocks if fewer)
    const startBlock = Math.max(0, latestBlock - 1000);
    let transactionHash = null;
    let blockNumber = 0;

    for (let i = latestBlock; i >= startBlock; i--) {
        try {
            // Fetch block without transactions (prefetchTxs: false)
            const block = await provider.getBlock(i);
            if (!block || !block.transactions) continue;

            // Fetch each transaction in the block
            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                const receipt = await provider.getTransactionReceipt(txHash);
                if (receipt && receipt.contractAddress && receipt.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
                    transactionHash = tx.hash;
                    blockNumber = i;
                    break;
                }
            }
            if (transactionHash) break;

            // Log progress every 100 blocks to monitor script execution
            if (i % 100 === 0) {
                console.log(`Scanned block ${i}, ${latestBlock - i} blocks processed...`);
            }
        } catch (error) {
            console.error(`Error fetching block ${i}:`, error.message);
            // Wait 1 second before retrying to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    if (!transactionHash) {
        throw new Error("Could not find deployment transaction for the contract. Try increasing the block range or checking MetaMask/explorer directly.");
    }

    console.log("Contract deployed in block:", blockNumber);
    console.log("Deployment transaction hash:", transactionHash);
    console.log("View transaction on explorer: https://shannon-explorer.somnia.network/tx/" + transactionHash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Failed to fetch transaction hash:", error);
        process.exit(1);
    });