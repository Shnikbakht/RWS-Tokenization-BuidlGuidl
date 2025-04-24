import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Real Estate Tokenization System with updated Compliance handling
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployRealEstateTokenSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  
  console.log("📋 DEPLOYING REAL ESTATE TOKEN SYSTEM");
  console.log("================================================");
  console.log(`🔑 Using deployer address: ${deployer}`);

  // Constants for deployment
  const KYC_CLAIM_TOPIC = 42;
  const STABLECOIN_DECIMALS = 6; // USDC has 6 decimals
  const DIVIDEND_RATE = 500; // 5%
  
  // 1. Deploy ClaimTopicsRegistry
  console.log("🔨 Deploying ClaimTopicsRegistry...");
  const claimTopicsRegistry = await deploy("ClaimTopicsRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`✅ ClaimTopicsRegistry deployed at: ${claimTopicsRegistry.address}`);

  // Add KYC claim topic
  const claimTopicsRegistryContract = await hre.ethers.getContract<Contract>("ClaimTopicsRegistry", deployer);
  await claimTopicsRegistryContract.addClaimTopic(KYC_CLAIM_TOPIC);
  console.log(`✅ Added KYC claim topic (${KYC_CLAIM_TOPIC}) to ClaimTopicsRegistry`);

  // 2. Deploy TrustedIssuersRegistry
  console.log("🔨 Deploying TrustedIssuersRegistry...");
  const trustedIssuersRegistry = await deploy("TrustedIssuersRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`✅ TrustedIssuersRegistry deployed at: ${trustedIssuersRegistry.address}`);

  // 3. Deploy IdentityRegistryStorage
  console.log("🔨 Deploying IdentityRegistryStorage...");
  const identityRegistryStorage = await deploy("IdentityRegistryStorage", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`✅ IdentityRegistryStorage deployed at: ${identityRegistryStorage.address}`);

  // 4. Deploy IdentityRegistry
  console.log("🔨 Deploying IdentityRegistry...");
  const identityRegistry = await deploy("IdentityRegistry", {
    from: deployer,
    args: [
      trustedIssuersRegistry.address,
      claimTopicsRegistry.address,
      identityRegistryStorage.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ IdentityRegistry deployed at: ${identityRegistry.address}`);

  // Authorize the Identity Registry in the storage
  const identityRegistryStorageContract = await hre.ethers.getContract<Contract>("IdentityRegistryStorage", deployer);
  await identityRegistryStorageContract.authorizeRegistry(identityRegistry.address);
  console.log("✅ Authorized IdentityRegistry in IdentityRegistryStorage");

  // 5. Deploy Compliance
  console.log("🔨 Deploying Compliance...");
  const compliance = await deploy("Compliance", {
    from: deployer,
    args: [identityRegistry.address],
    log: true,
    autoMine: true,
  });
  console.log(`✅ Compliance deployed at: ${compliance.address}`);

  // 6. Deploy MockUSDC (or integrate with real USDC on mainnet)
  console.log("🔨 Deploying MockUSDC...");
  const mockUSDC = await deploy("MockUSDC", {
    from: deployer,
    args: ["Mock USDC", "USDC", STABLECOIN_DECIMALS],
    log: true,
    autoMine: true,
  });
  console.log(`✅ MockUSDC deployed at: ${mockUSDC.address}`);

  // 7. Deploy ERC3643Token
  console.log("🔨 Deploying ERC3643Token...");
  const tokenName = "Real Estate Token";
  const tokenSymbol = "RET";
  const propertyAddress = "123 Blockchain Blvd, Cryptoville";
  const propertyValue = hre.ethers.parseEther("1000000"); // $1M property value
  
  const token = await deploy("ERC3643Token", {
    from: deployer,
    args: [
      tokenName,
      tokenSymbol,
      identityRegistry.address,
      compliance.address,
      propertyAddress,
      propertyValue,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ ERC3643Token deployed at: ${token.address}`);

  // 8. Deploy VestingManager
  console.log("🔨 Deploying VestingManager...");
  const vestingManager = await deploy("VestingManager", {
    from: deployer,
    args: [
      token.address,
      mockUSDC.address,
      propertyValue,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ VestingManager deployed at: ${vestingManager.address}`);

  // 9. Deploy DividendManager
  console.log("🔨 Deploying DividendManager...");
  const dividendManager = await deploy("DividendManager", {
    from: deployer,
    args: [
      token.address,
      mockUSDC.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ DividendManager deployed at: ${dividendManager.address}`);

  // 10. Deploy SecondaryMarket
  console.log("🔨 Deploying SecondaryMarket...");
  const secondaryMarket = await deploy("SecondaryMarket", {
    from: deployer,
    args: [
      token.address,
      mockUSDC.address,
      vestingManager.address,
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ SecondaryMarket deployed at: ${secondaryMarket.address}`);

  // 11. Deploy RealEstateSecurityManager
  console.log("🔨 Deploying RealEstateSecurityManager...");
  // Get platformOperator from named accounts or use the deployer
  const { platformOperator } = await hre.getNamedAccounts();
  const feeRecipient = platformOperator || deployer;
  
  const realEstateManager = await deploy("RealEstateSecurityManager", {
    from: deployer,
    args: [
      token.address,
      mockUSDC.address,
      dividendManager.address,
      vestingManager.address,
      secondaryMarket.address,
      feeRecipient, // Fee recipient
    ],
    log: true,
    autoMine: true,
  });
  console.log(`✅ RealEstateSecurityManager deployed at: ${realEstateManager.address}`);

  // Transfer ownership of DividendManager to RealEstateSecurityManager
  console.log("Transferring DividendManager ownership to RealEstateSecurityManager...");
  const dividendManagerContract = await hre.ethers.getContract<Contract>("DividendManager", deployer);
  await dividendManagerContract.transferOwnership(realEstateManager.address);
  console.log("✅ DividendManager ownership transferred to RealEstateSecurityManager");

  // Add token as trusted contract instead of transferring ownership
  console.log("Adding token as trusted contract in Compliance...");
  const complianceContract = await hre.ethers.getContract<Contract>("Compliance", deployer);
  await complianceContract.addTrustedContract(token.address);
  console.log("✅ Token added as trusted contract in Compliance");

  // Initialize the RealEstateSecurityManager
  console.log("🔨 Initializing RealEstateSecurityManager...");
  const realEstateManagerContract = await hre.ethers.getContract<Contract>("RealEstateSecurityManager", deployer);
  await realEstateManagerContract.initialize();
  console.log("✅ RealEstateSecurityManager initialized");

  // Set up agent roles
  console.log("🔑 Setting up permissions and agent roles...");
  const tokenContract = await hre.ethers.getContract<Contract>("ERC3643Token", deployer);
  await tokenContract.addAgent(vestingManager.address);
  await tokenContract.addAgent(realEstateManager.address);
  console.log("✅ Added VestingManager and RealEstateSecurityManager as agents on the token");

  const identityRegistryContract = await hre.ethers.getContract<Contract>("IdentityRegistry", deployer);
  await identityRegistryContract.addAgent(deployer);
  console.log("✅ Added deployer as agent on IdentityRegistry");

  // Optional: Fund redemption reserve for testing redemptions
  console.log("Funding redemption reserve...");
  const mockUSDCContract = await hre.ethers.getContract<Contract>("MockUSDC", deployer);
  // Mint some USDC to deployer if using MockUSDC
  const usdcAmount = hre.ethers.parseUnits("10000000", STABLECOIN_DECIMALS);
  await mockUSDCContract.mint(deployer, usdcAmount);
  console.log(`💰 Minted ${hre.ethers.formatUnits(usdcAmount, STABLECOIN_DECIMALS)} USDC to deployer`);

  const redemptionAmount = hre.ethers.parseUnits("500000", STABLECOIN_DECIMALS); // 500k USDC
  await mockUSDCContract.approve(vestingManager.address, redemptionAmount);
  const vestingManagerContract = await hre.ethers.getContract<Contract>("VestingManager", deployer);
  await vestingManagerContract.addToRedemptionReserve(redemptionAmount);
  console.log(`💰 Funded redemption reserve with ${hre.ethers.formatUnits(redemptionAmount, STABLECOIN_DECIMALS)} USDC`);

  // Additional setup for production environment
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("🛠️ Setting up production environment specific configurations...");
    // Example: Set dividend rate
    await realEstateManagerContract.updateDividendRate(DIVIDEND_RATE);
    console.log(`✅ Set dividend rate to ${DIVIDEND_RATE} basis points (${DIVIDEND_RATE / 100}%)`);
    
    // Additional production-specific setup can be added here
  }

  console.log("================================================");
  console.log("✅ REAL ESTATE TOKEN SYSTEM DEPLOYMENT COMPLETE");
  console.log("================================================");
  
  // Return deployed contract addresses for verification or future scripts
  return {
    claimTopicsRegistry: claimTopicsRegistry.address,
    trustedIssuersRegistry: trustedIssuersRegistry.address,
    identityRegistryStorage: identityRegistryStorage.address,
    identityRegistry: identityRegistry.address,
    compliance: compliance.address,
    mockUSDC: mockUSDC.address,
    token: token.address,
    vestingManager: vestingManager.address,
    dividendManager: dividendManager.address,
    secondaryMarket: secondaryMarket.address,
    realEstateManager: realEstateManager.address
  };
};

export default deployRealEstateTokenSystem;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RealEstateTokenSystem
deployRealEstateTokenSystem.tags = ["RealEstateTokenSystem"];