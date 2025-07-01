// sds.js
const SDS_CONTRACT_ADDRESS = "0xDB4e0A5E7b0d03aA41cBB7940c5e9Bab06cc7157";
const SDS_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "reverseLookup",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
];

async function getPrimarySomName(walletAddress) {
  if (!window.web3) {
    console.error("Web3 not initialized in SDS lookup");
    return null;
  }
  
  try {
    const contract = new web3.eth.Contract(SDS_ABI, SDS_CONTRACT_ADDRESS);
    console.log(`Looking up SDS name for: ${walletAddress}`);
    
    const name = await contract.methods.reverseLookup(walletAddress).call();
    console.log(`SDS lookup result for ${walletAddress}:`, name);
    
    // Return name only if it's not empty
    return name && name.trim() !== "" ? name : null;
  } catch (err) {
    console.error("Somnia name lookup failed:", {
      error: err,
      message: err.message,
      stack: err.stack
    });
    return null;
  }
}