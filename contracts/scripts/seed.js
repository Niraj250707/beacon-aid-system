const { ethers } = require("hardhat");

/**
 * Seed script to populate contracts with sample data
 * 
 * Creates:
 * - 3 disaster relief programs
 * - 5 beneficiaries per program
 * - 3 merchants per program
 * - Sample token airdrops
 */
async function main() {
  const [deployer, ...signers] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("RELIEFCHAIN DATA SEEDING");
  console.log("=".repeat(60));
  
  // Get contract addresses from environment or use defaults
  const stablecoinAddress = process.env.STABLECOIN_ADDRESS;
  const programManagerAddress = process.env.PROGRAM_MANAGER_ADDRESS;
  
  if (!stablecoinAddress || !programManagerAddress) {
    console.error("Please set STABLECOIN_ADDRESS and PROGRAM_MANAGER_ADDRESS in your .env file");
    process.exit(1);
  }
  
  // Attach to deployed contracts
  const ReliefStablecoin = await ethers.getContractFactory("ReliefStablecoin");
  const stablecoin = ReliefStablecoin.attach(stablecoinAddress);
  
  const ProgramManager = await ethers.getContractFactory("ProgramManager");
  const programManager = ProgramManager.attach(programManagerAddress);
  
  console.log("\n[1/4] Creating Programs...");
  
  // Program data
  const programs = [
    {
      name: "Kerala Flood Relief 2024",
      disasterType: 0, // Flood
      state: "Kerala",
      district: "Wayanad",
      budget: ethers.parseEther("50000000"), // 5 Cr
      allocation: ethers.parseEther("25000"),
      dailyLimit: ethers.parseEther("5000")
    },
    {
      name: "Odisha Cyclone Recovery",
      disasterType: 2, // Cyclone
      state: "Odisha",
      district: "Puri",
      budget: ethers.parseEther("75000000"), // 7.5 Cr
      allocation: ethers.parseEther("30000"),
      dailyLimit: ethers.parseEther("6000")
    },
    {
      name: "Gujarat Drought Assistance",
      disasterType: 3, // Drought
      state: "Gujarat",
      district: "Kutch",
      budget: ethers.parseEther("40000000"), // 4 Cr
      allocation: ethers.parseEther("20000"),
      dailyLimit: ethers.parseEther("4000")
    }
  ];
  
  const programIds = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (const program of programs) {
    const tx = await programManager.createProgram(
      program.name,
      program.disasterType,
      program.state,
      program.district,
      now - 86400 * 30, // Started 30 days ago
      now + 86400 * 180, // Ends in 180 days
      program.budget,
      program.allocation,
      program.dailyLimit
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment?.name === 'ProgramCreated');
    const programId = event.args[0];
    programIds.push(programId);
    
    // Activate program
    await programManager.updateProgramStatus(programId, 1); // Active
    
    console.log(`    ✓ Created: ${program.name}`);
  }
  
  console.log("\n[2/4] Minting tokens to ProgramManager...");
  
  // Mint tokens to ProgramManager for distribution
  const totalBudget = ethers.parseEther("165000000"); // Total of all programs
  await stablecoin.mint(programManagerAddress, totalBudget, "Initial program funding");
  console.log(`    ✓ Minted ${ethers.formatEther(totalBudget)} RINR to ProgramManager`);
  
  console.log("\n[3/4] Registering Beneficiaries...");
  
  // Generate sample beneficiaries
  const beneficiaryNames = [
    "Ramesh Kumar", "Lakshmi Devi", "Mohammed Ali", "Priya Singh", "Rajesh Sharma",
    "Anita Patel", "Suresh Reddy", "Fatima Begum", "Vijay Nair", "Meena Kumari"
  ];
  
  for (let i = 0; i < programIds.length; i++) {
    const programId = programIds[i];
    for (let j = 0; j < 5; j++) {
      const wallet = ethers.Wallet.createRandom();
      const offChainHash = ethers.keccak256(ethers.toUtf8Bytes(`kyc_${wallet.address}`));
      const region = programs[i].district;
      
      await programManager.registerBeneficiary(programId, wallet.address, offChainHash, region);
      console.log(`    ✓ Registered: ${beneficiaryNames[j]} (${wallet.address.slice(0, 10)}...)`);
    }
  }
  
  console.log("\n[4/4] Registering Merchants...");
  
  const merchantData = [
    { name: "Krishna Groceries", category: 0 }, // Food
    { name: "Shanti Medical", category: 1 }, // Health
    { name: "Quick Mart", category: 0 } // Food
  ];
  
  for (let i = 0; i < programIds.length; i++) {
    const programId = programIds[i];
    for (const merchant of merchantData) {
      const wallet = ethers.Wallet.createRandom();
      
      await programManager.registerMerchant(
        programId, 
        wallet.address, 
        merchant.category, 
        programs[i].district
      );
      console.log(`    ✓ Registered: ${merchant.name} (${wallet.address.slice(0, 10)}...)`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("SEEDING COMPLETE");
  console.log("=".repeat(60));
  console.log(`
Summary:
  Programs created: ${programIds.length}
  Beneficiaries registered: ${programIds.length * 5}
  Merchants registered: ${programIds.length * 3}
  Total tokens minted: ${ethers.formatEther(totalBudget)} RINR
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
