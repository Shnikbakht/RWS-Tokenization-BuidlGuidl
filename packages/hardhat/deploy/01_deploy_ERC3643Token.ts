import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the complete ERC-3643 token system for real estate tokenization
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployERC3643: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Starting ERC-3643 token system deployment with account:", deployer);

  // Step 1: Deploy ClaimTopicsRegistry
  const claimTopicsRegistry = await deploy("ClaimTopicsRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ ClaimTopicsRegistry deployed at:", claimTopicsRegistry.address);
  
  const claimTopicsRegistryContract = await hre.ethers.getContract<Contract>("ClaimTopicsRegistry", deployer);
  
  // Add KYC claim topic (example value: 42)
  const kycClaimTopic = 42;
  await claimTopicsRegistryContract.addClaimTopic(kycClaimTopic);
  console.log(`🔑 Added KYC claim topic (${kycClaimTopic}) to ClaimTopicsRegistry`);

  // Step 2: Deploy TrustedIssuersRegistry
  const trustedIssuersRegistry = await deploy("TrustedIssuersRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ TrustedIssuersRegistry deployed at:", trustedIssuersRegistry.address);

  // Step 3: Deploy IdentityRegistryStorage
  const identityRegistryStorage = await deploy("IdentityRegistryStorage", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ IdentityRegistryStorage deployed at:", identityRegistryStorage.address);

  // Step 4: Deploy IdentityRegistry with references to other contracts
  const identityRegistry = await deploy("IdentityRegistry", {
    from: deployer,
    args: [
      trustedIssuersRegistry.address,
      claimTopicsRegistry.address,
      identityRegistryStorage.address
    ],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ IdentityRegistry deployed at:", identityRegistry.address);
  
  const identityRegistryStorageContract = await hre.ethers.getContract<Contract>("IdentityRegistryStorage", deployer);
  
  // Authorize the Identity Registry in the storage
  await identityRegistryStorageContract.authorizeRegistry(identityRegistry.address);
  console.log("🔑 Authorized IdentityRegistry in IdentityRegistryStorage");

  // Step 5: Deploy Compliance with reference to IdentityRegistry
  const compliance = await deploy("Compliance", {
    from: deployer,
    args: [identityRegistry.address],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ Compliance deployed at:", compliance.address);

  // Example property details for the token
  const tokenName = "Real Estate Token";
  const tokenSymbol = "RET";
  const propertyAddress = "123 Blockchain Blvd, Cryptoville";
  const propertyValue = hre.ethers.parseEther("1000000"); // 1 million tokens

  // Step 6: Deploy ERC3643Token with all dependencies
  const erc3643Token = await deploy("ERC3643Token", {
    from: deployer,
    args: [
      tokenName,
      tokenSymbol,
      identityRegistry.address,
      compliance.address,
      propertyAddress,
      propertyValue
    ],
    log: true,
    autoMine: true,
  });
  
  console.log("✅ ERC3643Token deployed at:", erc3643Token.address);
  
  // Display deployment summary
  console.log("\n🎉 --- ERC-3643 Deployment Summary --- 🎉");
  console.log("🏷 ClaimTopicsRegistry:", claimTopicsRegistry.address);
  console.log("🏷 TrustedIssuersRegistry:", trustedIssuersRegistry.address);
  console.log("🏷 IdentityRegistryStorage:", identityRegistryStorage.address);
  console.log("🏷 IdentityRegistry:", identityRegistry.address);
  console.log("🏷 Compliance:", compliance.address);
  console.log("🏷 ERC3643Token:", erc3643Token.address);
  console.log("📝 Token Name:", tokenName);
  console.log("📝 Token Symbol:", tokenSymbol);
  console.log("🏠 Property Address:", propertyAddress);
  console.log("💰 Property Value:", hre.ethers.formatEther(propertyValue), "tokens");
  console.log("----------------------------------\n");
};

export default deployERC3643;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ERC3643
deployERC3643.tags = ["ERC3643", "RealEstate", "SecurityToken"];
