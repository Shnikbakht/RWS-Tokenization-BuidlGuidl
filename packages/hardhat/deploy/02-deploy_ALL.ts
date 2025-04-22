import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * 🚀 Deploys the complete ERC-3643 token system with financial mechanics for real estate
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployRealEstateTokenSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🏗️ Starting ERC-3643 Real Estate Token System Deployment");
  console.log("👤 Deployer account:", deployer);

  // 1️⃣ Deploy ClaimTopicsRegistry
  const claimTopicsRegistry = await deploy("ClaimTopicsRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ ClaimTopicsRegistry deployed at:", claimTopicsRegistry.address);

  const claimTopicsRegistryContract = await hre.ethers.getContractAt("ClaimTopicsRegistry", claimTopicsRegistry.address);
  const kycClaimTopic = 42;
  await claimTopicsRegistryContract.addClaimTopic(kycClaimTopic);
  console.log(`📝 KYC Claim Topic (${kycClaimTopic}) added to ClaimTopicsRegistry`);

  // 2️⃣ Deploy TrustedIssuersRegistry
  const trustedIssuersRegistry = await deploy("TrustedIssuersRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ TrustedIssuersRegistry deployed at:", trustedIssuersRegistry.address);

  // 3️⃣ Deploy IdentityRegistryStorage
  const identityRegistryStorage = await deploy("IdentityRegistryStorage", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ IdentityRegistryStorage deployed at:", identityRegistryStorage.address);

  // 4️⃣ Deploy IdentityRegistry
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

  const identityRegistryStorageContract = await hre.ethers.getContractAt("IdentityRegistryStorage", identityRegistryStorage.address);
  await identityRegistryStorageContract.authorizeRegistry(identityRegistry.address);
  console.log("🔐 IdentityRegistry authorized in IdentityRegistryStorage");

  // 5️⃣ Deploy Compliance
  const compliance = await deploy("Compliance", {
    from: deployer,
    args: [identityRegistry.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ Compliance deployed at:", compliance.address);

  // 6️⃣ Deploy MockUSDC
  const mockUSDC = await deploy("MockUSDC", {
    from: deployer,
    args: ["Mock USDC", "USDC", 6],
    log: true,
    autoMine: true,
  });
  console.log("💵 MockUSDC deployed at:", mockUSDC.address);

  // Property Details 🏠
  const tokenName = "Real Estate Token";
  const tokenSymbol = "RET";
  const propertyAddress = "123 Blockchain Blvd, Cryptoville";
  const propertyValue = hre.ethers.parseEther("1000000");
  
  // 7️⃣ Deploy ERC3643Token
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
  console.log("🏷️ ERC3643Token deployed at:", erc3643Token.address);

  // 8️⃣ Deploy VestingManager
  const vestingManager = await deploy("VestingManager", {
    from: deployer,
    args: [erc3643Token.address, mockUSDC.address, propertyValue],
    log: true,
    autoMine: true,
  });
  console.log("📆 VestingManager deployed at:", vestingManager.address);

  // 9️⃣ Deploy DividendManager
  const dividendManager = await deploy("DividendManager", {
    from: deployer,
    args: [erc3643Token.address, mockUSDC.address],
    log: true,
    autoMine: true,
  });
  console.log("💰 DividendManager deployed at:", dividendManager.address);

  // 🔟 Deploy SecondaryMarket
  const secondaryMarket = await deploy("SecondaryMarket", {
    from: deployer,
    args: [erc3643Token.address, mockUSDC.address, vestingManager.address],
    log: true,
    autoMine: true,
  });
  console.log("🪙 SecondaryMarket deployed at:", secondaryMarket.address);

  // 1️⃣1️⃣ Deploy RealEstateSecurityManager
  const realEstateSecurityManager = await deploy("RealEstateSecurityManager", {
    from: deployer,
    args: [
      erc3643Token.address,
      mockUSDC.address,
      dividendManager.address,
      vestingManager.address,
      secondaryMarket.address,
      deployer
    ],
    log: true,
    autoMine: true,
  });
  console.log("🏢 RealEstateSecurityManager deployed at:", realEstateSecurityManager.address);


  
  // 🔧 Setup Permissions
  const securityManagerContract = await hre.ethers.getContractAt("RealEstateSecurityManager", realEstateSecurityManager.address);
  await securityManagerContract.setupAgents();
  console.log("🛠️ Agents set up via RealEstateSecurityManager");

  // 💵 Mint USDC for testing
  const mockUSDCContract = await hre.ethers.getContractAt("MockUSDC", mockUSDC.address);
  const testMintAmount = hre.ethers.parseUnits("1000000", 6);
  await mockUSDCContract.mint(deployer, testMintAmount);
  console.log("💸 Minted 1,000,000 USDC to deployer");

  // 📋 Deployment Summary
  console.log("\n✅✅✅ ERC-3643 Real Estate Token System Deployment Summary ✅✅✅");
  console.log("📌 ClaimTopicsRegistry:", claimTopicsRegistry.address);
  console.log("📌 TrustedIssuersRegistry:", trustedIssuersRegistry.address);
  console.log("📌 IdentityRegistryStorage:", identityRegistryStorage.address);
  console.log("📌 IdentityRegistry:", identityRegistry.address);
  console.log("📌 Compliance:", compliance.address);
  console.log("📌 ERC3643Token:", erc3643Token.address);
  console.log("📌 MockUSDC:", mockUSDC.address);
  console.log("📌 VestingManager:", vestingManager.address);
  console.log("📌 DividendManager:", dividendManager.address);
  console.log("📌 SecondaryMarket:", secondaryMarket.address);
  console.log("📌 RealEstateSecurityManager:", realEstateSecurityManager.address);
  console.log("🏠 Property Address:", propertyAddress);
  console.log("🏷️ Token Name:", tokenName, "| Symbol:", tokenSymbol);
  console.log("💰 Property Value (tokens):", hre.ethers.formatEther(propertyValue));
};

deployRealEstateTokenSystem.tags = ["ALL"];


export default deployRealEstateTokenSystem;
