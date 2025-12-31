const { ethers } = require("hardhat");

/**
 * Deployment script for ReliefChain contracts
 * 
 * This script deploys:
 * 1. ReliefStablecoin - The ERC-20 token representing relief funds
 * 2. ProgramManager - Manages programs, beneficiaries, and merchants
 * 3. DonorDAO - Governance for donors to vote on program changes
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=".repeat(60));
  console.log("RELIEFCHAIN CONTRACT DEPLOYMENT");
  console.log("=".repeat(60));
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Network: ${network.name}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("=".repeat(60));
  
  // 1. Deploy ReliefStablecoin
  console.log("\n[1/3] Deploying ReliefStablecoin...");
  const ReliefStablecoin = await ethers.getContractFactory("ReliefStablecoin");
  const stablecoin = await ReliefStablecoin.deploy();
  await stablecoin.waitForDeployment();
  const stablecoinAddress = await stablecoin.getAddress();
  console.log(`    ✓ ReliefStablecoin deployed to: ${stablecoinAddress}`);
  
  // 2. Deploy ProgramManager
  console.log("\n[2/3] Deploying ProgramManager...");
  const ProgramManager = await ethers.getContractFactory("ProgramManager");
  const programManager = await ProgramManager.deploy(stablecoinAddress);
  await programManager.waitForDeployment();
  const programManagerAddress = await programManager.getAddress();
  console.log(`    ✓ ProgramManager deployed to: ${programManagerAddress}`);
  
  // 3. Deploy DonorDAO
  console.log("\n[3/3] Deploying DonorDAO...");
  const DonorDAO = await ethers.getContractFactory("DonorDAO");
  const donorDAO = await DonorDAO.deploy(stablecoinAddress, programManagerAddress);
  await donorDAO.waitForDeployment();
  const donorDAOAddress = await donorDAO.getAddress();
  console.log(`    ✓ DonorDAO deployed to: ${donorDAOAddress}`);
  
  // 4. Configure contracts
  console.log("\n[Config] Setting ProgramManager in ReliefStablecoin...");
  await stablecoin.setProgramManager(programManagerAddress);
  console.log("    ✓ ProgramManager set as authorized caller");
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`
Contract Addresses:
  ReliefStablecoin:  ${stablecoinAddress}
  ProgramManager:    ${programManagerAddress}
  DonorDAO:          ${donorDAOAddress}

Save these addresses to your .env file:
  VITE_STABLECOIN_ADDRESS=${stablecoinAddress}
  VITE_PROGRAM_MANAGER_ADDRESS=${programManagerAddress}
  VITE_DONOR_DAO_ADDRESS=${donorDAOAddress}
`);
  console.log("=".repeat(60));
  
  return {
    stablecoin: stablecoinAddress,
    programManager: programManagerAddress,
    donorDAO: donorDAOAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
