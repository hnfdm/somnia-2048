const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the contract factory (use fully qualified name if needed)
    const ScoreStorage = await hre.ethers.getContractFactory("ScoreStorage");
    // Or use the fully qualified name if you still have duplicates:
    // const ScoreStorage = await hre.ethers.getContractFactory("contracts/ScoreStorage4.sol:ScoreStorage");

    // Deploy the contract
    const scoreStorage = await ScoreStorage.deploy();
    console.log("Deployment transaction hash:", scoreStorage.deploymentTransaction().hash);

    // Wait for deployment to complete
    await scoreStorage.waitForDeployment();
    
    // Get the deployed address
    const deployedAddress = await scoreStorage.getAddress();
    console.log("ScoreStorage deployed to:", deployedAddress);

    // Log the entry fee
    const entryFee = await scoreStorage.ENTRY_FEE();
    console.log("Entry fee:", ethers.formatEther(entryFee), "STT");

    // Provide explorer link
    console.log("View transaction on explorer: https://shannon-explorer.somnia.network/tx/" + scoreStorage.deploymentTransaction().hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });