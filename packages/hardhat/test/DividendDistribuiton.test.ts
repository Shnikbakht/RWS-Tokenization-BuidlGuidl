// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { 
//   ClaimTopicsRegistry, 
//   TrustedIssuersRegistry, 
//   IdentityRegistryStorage, 
//   IdentityRegistry, 
//   Compliance, 
//   ERC3643Token, 
//   MockUSDC, 
//   DividendManager,
//   MockIdentity
// } from "../typechain-types";
// //import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


// // Constants for testing
// const KYC_CLAIM_TOPIC = 42;
// const COUNTRY_US = 840; // US country code (ISO 3166-1 numeric)
// const COUNTRY_UK = 826; // UK country code
// const DIVIDEND_RATE = 500; // 5%
// const PROPERTY_VALUE = ethers.parseEther("1000000"); // $1M property value
// const STABLECOIN_DECIMALS = 6; // USDC has 6 decimals
// const BASIS_POINTS_DENOMINATOR = 10000;

// // Time constants
// const SECONDS_IN_DAY = 86400;
// const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;

// describe("Dividend Distribution Mechanism", function () {
//   // Contract instances
//   let claimTopicsRegistry: ClaimTopicsRegistry;
//   let trustedIssuersRegistry: TrustedIssuersRegistry;
//   let identityRegistryStorage: IdentityRegistryStorage;
//   let identityRegistry: IdentityRegistry;
//   let compliance: Compliance;
//   let token: ERC3643Token;
//   let mockUSDC: MockUSDC;
//   let dividendManager: DividendManager;
  
//   // Identity contracts
//   let issuerIdentity: MockIdentity;
//   let investor1Identity: MockIdentity;
//   let investor2Identity: MockIdentity;
//   let investor3Identity: MockIdentity;
  
//   // Signers
//   let deployer: HardhatEthersSigner;
//   let issuer: HardhatEthersSigner;
//   let investor1: HardhatEthersSigner;
//   let investor2: HardhatEthersSigner;
//   let investor3: HardhatEthersSigner;
  
//   // Deploy all contracts and set up basic configuration
//   async function deployDividendTestSystem() {
//     console.log("📋 DEPLOYING DIVIDEND TEST SYSTEM");
//     console.log("================================================");

//     // Get signers
//     [deployer, issuer, investor1, investor2, investor3] = await ethers.getSigners();
//     console.log(`🔑 Using deployer address: ${deployer.getAddress()}`);
    
//     // 1. Deploy ClaimTopicsRegistry
//     const ClaimTopicsRegistryFactory = await ethers.getContractFactory("ClaimTopicsRegistry");
//     claimTopicsRegistry = await ClaimTopicsRegistryFactory.deploy();
//     await claimTopicsRegistry.waitForDeployment();
    
//     // Add KYC claim topic
//     await claimTopicsRegistry.addClaimTopic(KYC_CLAIM_TOPIC);
    
//     // 2. Deploy TrustedIssuersRegistry
//     const TrustedIssuersRegistryFactory = await ethers.getContractFactory("TrustedIssuersRegistry");
//     trustedIssuersRegistry = await TrustedIssuersRegistryFactory.deploy();
//     await trustedIssuersRegistry.waitForDeployment();
    
//     // 3. Deploy IdentityRegistryStorage
//     const IdentityRegistryStorageFactory = await ethers.getContractFactory("IdentityRegistryStorage");
//     identityRegistryStorage = await IdentityRegistryStorageFactory.deploy();
//     await identityRegistryStorage.waitForDeployment();
    
//     // 4. Deploy IdentityRegistry
//     const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
//     identityRegistry = await IdentityRegistryFactory.deploy(
//       trustedIssuersRegistry.getAddress(),
//       claimTopicsRegistry.getAddress(),
//       identityRegistryStorage.getAddress()
//     );
//     await identityRegistry.waitForDeployment();
    
//     // Authorize the Identity Registry in the storage
//     await identityRegistryStorage.authorizeRegistry(identityRegistry.getAddress());
    
//     // 5. Deploy Compliance
//     const ComplianceFactory = await ethers.getContractFactory("Compliance");
//     compliance = await ComplianceFactory.deploy(identityRegistry.getAddress());
//     await compliance.waitForDeployment();
    
//     // 6. Deploy MockUSDC
//     const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
//     mockUSDC = await MockUSDCFactory.deploy("Mock USDC", "USDC", STABLECOIN_DECIMALS);
//     await mockUSDC.waitForDeployment();
    
//     // Mint 10M MockUSDC to deployer for testing
//     const usdcAmount = ethers.parseUnits("10000000", STABLECOIN_DECIMALS);
//     await mockUSDC.mint(deployer.getAddress(), usdcAmount);
    
//     // Transfer some USDC to investors for testing
//     await mockUSDC.transfer(investor1.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));
//     await mockUSDC.transfer(investor2.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));
//     await mockUSDC.transfer(investor3.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));

//     // 7. Deploy ERC3643Token
//     const tokenName = "Real Estate Token";
//     const tokenSymbol = "RET";
//     const propertyAddress = "123 Blockchain Blvd, Cryptoville";
    
//     const ERC3643TokenFactory = await ethers.getContractFactory("ERC3643Token");
//     token = await ERC3643TokenFactory.deploy(
//       tokenName,
//       tokenSymbol,
//       identityRegistry.getAddress(),
//       compliance.getAddress(),
//       propertyAddress,
//       PROPERTY_VALUE
//     );
//     await token.waitForDeployment();
    
//     // 8. Deploy DividendManager
//     const DividendManagerFactory = await ethers.getContractFactory("DividendManager");
//     dividendManager = await DividendManagerFactory.deploy(
//       token.getAddress(),
//       mockUSDC.getAddress()
//     );
//     await dividendManager.waitForDeployment();
    
//     // Set initial dividend rate
//     await dividendManager.updateDividendRate(DIVIDEND_RATE);
    
//     // Deploy mock identity contracts
//     const MockIdentityFactory = await ethers.getContractFactory("MockIdentity");
    
//     issuerIdentity = await MockIdentityFactory.deploy(issuer.getAddress());
//     await issuerIdentity.waitForDeployment();
    
//     investor1Identity = await MockIdentityFactory.deploy(investor1.getAddress());
//     await investor1Identity.waitForDeployment();
    
//     investor2Identity = await MockIdentityFactory.deploy(investor2.getAddress());
//     await investor2Identity.waitForDeployment();
    
//     investor3Identity = await MockIdentityFactory.deploy(investor3.getAddress());
//     await investor3Identity.waitForDeployment();
    
//     // Add issuer to trusted issuers with KYC claim topic
//     await trustedIssuersRegistry.addTrustedIssuer(
//       issuerIdentity.getAddress(),
//       [KYC_CLAIM_TOPIC]
//     );
    
//     // Set up claim signer key in issuer identity
//     await issuerIdentity.connect(issuer).addKey(
//       ethers.keccak256(
//         ethers.AbiCoder.defaultAbiCoder().encode(
//           ['address', 'uint256'],
//           [issuerIdentity.getAddress(), KYC_CLAIM_TOPIC]
//         )
//       ),
//       3 // Purpose: CLAIM
//     );
    
//     // Add KYC claims to investor identities
//     await investor1Identity.connect(investor1).addClaim(
//       KYC_CLAIM_TOPIC,
//       1, // scheme (1 = ECDSA)
//       issuerIdentity.getAddress(),
//       "0x", // signature
//       "0x", // data
//       "" // uri
//     );
    
//     await investor2Identity.connect(investor2).addClaim(
//       KYC_CLAIM_TOPIC,
//       1,
//       issuerIdentity.getAddress(),
//       "0x",
//       "0x",
//       ""
//     );
    
//     await investor3Identity.connect(investor3).addClaim(
//       KYC_CLAIM_TOPIC,
//       1,
//       issuerIdentity.getAddress(),
//       "0x",
//       "0x",
//       ""
//     );
    
//     // Register investors in the identity registry
//     await identityRegistry.registerIdentity(
//       investor1.getAddress(),
//       investor1Identity.getAddress(),
//       COUNTRY_US
//     );
    
//     await identityRegistry.registerIdentity(
//       investor2.getAddress(),
//       investor2Identity.getAddress(),
//       COUNTRY_UK
//     );
    
//     await identityRegistry.registerIdentity(
//       investor3.getAddress(),
//       investor3Identity.getAddress(),
//       COUNTRY_US
//     );
    
//     // Add agent role to deployer
//     await token.addAgent(deployer.getAddress());
    
//     // Mint initial tokens to investors with different allocations
//     await token.mint(investor1.getAddress(), ethers.parseEther("400")); // 40%
//     await token.mint(investor2.getAddress(), ethers.parseEther("350")); // 35%
//     await token.mint(investor3.getAddress(), ethers.parseEther("250")); // 25%
    
//     console.log("✅ DIVIDEND TEST SYSTEM DEPLOYMENT COMPLETE");
//     console.log("================================================");
    
//     return {
//       claimTopicsRegistry,
//       trustedIssuersRegistry,
//       identityRegistryStorage,
//       identityRegistry,
//       compliance,
//       token,
//       mockUSDC,
//       dividendManager,
//       issuerIdentity,
//       investor1Identity,
//       investor2Identity,
//       investor3Identity,
//       deployer,
//       issuer,
//       investor1,
//       investor2,
//       investor3
//     };
//   }

//   // Load fixture before each test
//   beforeEach(async function() {
//     const fixture = await loadFixture(deployDividendTestSystem);
    
//     // Set all contract instances and signers
//     claimTopicsRegistry = fixture.claimTopicsRegistry;
//     trustedIssuersRegistry = fixture.trustedIssuersRegistry;
//     identityRegistryStorage = fixture.identityRegistryStorage;
//     identityRegistry = fixture.identityRegistry;
//     compliance = fixture.compliance;
//     token = fixture.token;
//     mockUSDC = fixture.mockUSDC;
//     dividendManager = fixture.dividendManager;
//     issuerIdentity = fixture.issuerIdentity;
//     investor1Identity = fixture.investor1Identity;
//     investor2Identity = fixture.investor2Identity;
//     investor3Identity = fixture.investor3Identity;
//     deployer = fixture.deployer;
//     issuer = fixture.issuer;
//     investor1 = fixture.investor1;
//     investor2 = fixture.investor2;
//     investor3 = fixture.investor3;
//   });

//   describe("Single Distribution Tests", function () {
//     it("Should correctly distribute dividends proportionally to token holders", async function () {
//       console.log("🧪 TESTING SINGLE DIVIDEND DISTRIBUTION");
//       console.log("================================================");

//       // 1. Calculate the annual dividend amount (5% of property value)
//       const totalSupply = await token.totalSupply();
//       const expectedAnnualDividend = (totalSupply * BigInt(DIVIDEND_RATE)) / BigInt(BASIS_POINTS_DENOMINATOR);
//       console.log(`💰 Expected annual dividend: ${ethers.formatEther(expectedAnnualDividend)} tokens (${DIVIDEND_RATE/100}% of total supply)`);
      
//       // Convert to USDC amount (6 decimals)
//       const dividendAmountUSDC = ethers.parseUnits(
//         ethers.formatEther(expectedAnnualDividend),
//         STABLECOIN_DECIMALS
//       );
      
//       // 2. Create a dividend distribution
//       console.log("2️⃣ Creating dividend distribution");
//       await mockUSDC.approve(dividendManager.getAddress(), dividendAmountUSDC);
//       await dividendManager.createDistribution(dividendAmountUSDC);
      
//       console.log(`💰 Created distribution of ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);
      
//       // Verify distribution details
//       const distributionId = 1;
//       const distribution = await dividendManager.distributions(distributionId);
      
//       expect(distribution.totalAmount).to.equal(dividendAmountUSDC);
//       expect(distribution.totalSupplySnapshot).to.equal(totalSupply);
//       expect(distribution.finalized).to.be.true;
      
//       console.log("✅ Distribution details verified");
      
//       // 3. Investors claim their dividends
//       console.log("3️⃣ Investors claiming dividends");
      
//       // Calculate expected investor shares based on their token holdings
//       const investor1Balance = await token.balanceOf(investor1.getAddress());
//       const investor2Balance = await token.balanceOf(investor2.getAddress());
//       const investor3Balance = await token.balanceOf(investor3.getAddress());
      
//       const investor1Share = (investor1Balance * dividendAmountUSDC) / totalSupply;
//       const investor2Share = (investor2Balance * dividendAmountUSDC) / totalSupply;
//       const investor3Share = (investor3Balance * dividendAmountUSDC) / totalSupply;
      
//       console.log(`📊 Investor 1 (${ethers.formatEther(investor1Balance)} tokens, ${(investor1Balance * 100n) / totalSupply}%): Expected ${ethers.formatUnits(investor1Share, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`📊 Investor 2 (${ethers.formatEther(investor2Balance)} tokens, ${(investor2Balance * 100n) / totalSupply}%): Expected ${ethers.formatUnits(investor2Share, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`📊 Investor 3 (${ethers.formatEther(investor3Balance)} tokens, ${(investor3Balance * 100n) / totalSupply}%): Expected ${ethers.formatUnits(investor3Share, STABLECOIN_DECIMALS)} USDC`);
      
//       // Record initial USDC balances
//       const investor1InitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
//       const investor2InitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
//       const investor3InitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      
//       // Claim dividends
//       await dividendManager.connect(investor1).claimDividend(distributionId);
//       await dividendManager.connect(investor2).claimDividend(distributionId);
//       await dividendManager.connect(investor3).claimDividend(distributionId);
      
//       // Verify dividend amounts received
//       const investor1FinalUSDC = await mockUSDC.balanceOf(investor1.getAddress());
//       const investor2FinalUSDC = await mockUSDC.balanceOf(investor2.getAddress());
//       const investor3FinalUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      
//       // Calculate actual received amounts
//       const investor1Received = investor1FinalUSDC - investor1InitialUSDC;
//       const investor2Received = investor2FinalUSDC - investor2InitialUSDC;
//       const investor3Received = investor3FinalUSDC - investor3InitialUSDC;
      
//       console.log(`💰 Investor 1 received: ${ethers.formatUnits(investor1Received, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 2 received: ${ethers.formatUnits(investor2Received, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 3 received: ${ethers.formatUnits(investor3Received, STABLECOIN_DECIMALS)} USDC`);
      
//       // Assert that received amounts match expected shares
//       expect(investor1Received).to.equal(investor1Share);
//       expect(investor2Received).to.equal(investor2Share);
//       expect(investor3Received).to.equal(investor3Share);
      
//       // Verify claim status
//       expect(await dividendManager.dividendClaimed(distributionId, investor1.getAddress())).to.be.true;
//       expect(await dividendManager.dividendClaimed(distributionId, investor2.getAddress())).to.be.true;
//       expect(await dividendManager.dividendClaimed(distributionId, investor3.getAddress())).to.be.true;
      
//       console.log("✅ All investors successfully claimed their dividends");
      
//       // 4. Verify that claimed dividends cannot be claimed again
//       console.log("4️⃣ Verifying prevention of double claiming");
      
//       await expect(
//         dividendManager.connect(investor1).claimDividend(distributionId)
//       ).to.be.revertedWith("Dividend already claimed");
      
//       console.log("✅ Double claiming correctly prevented");
      
//       // 5. Verify total distribution sum equals the distributed amount
//       console.log("5️⃣ Verifying distribution sum and rounding");
      
//       const totalDistributed = investor1Received + investor2Received + investor3Received;
      
//       console.log(`💰 Total distributed: ${ethers.formatUnits(totalDistributed, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Original distribution amount: ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);
      
//       // Allow for minimal rounding errors (should be very close to the original amount)
//       expect(totalDistributed).to.be.closeTo(
//         dividendAmountUSDC,
//         ethers.parseUnits("0.01", STABLECOIN_DECIMALS) // Allow for very small rounding difference
//       );
      
//       console.log("✅ Distribution sum verification complete");
//       console.log("================================================");
//     });
    
//     it("Should prevent non-token holders from claiming dividends", async function () {
//       console.log("🧪 TESTING PREVENTION OF CLAIMS BY NON-TOKEN HOLDERS");
//       console.log("================================================");
      
//       // 1. Create a dividend distribution
//       console.log("1️⃣ Creating dividend distribution");
//       const dividendAmountUSDC = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC
      
//       await mockUSDC.approve(dividendManager.getAddress(), dividendAmountUSDC);
//       await dividendManager.createDistribution(dividendAmountUSDC);
      
//       console.log(`💰 Created distribution of ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);
      
//       // 2. Attempt to claim with non-token holder
//       console.log("2️⃣ Attempting claim by non-token holder");
      
//       // Using deployer who has no tokens
//       await expect(
//         dividendManager.connect(deployer).claimDividend(1)
//       ).to.be.revertedWith("No tokens held");
      
//       console.log("✅ Claim by non-token holder correctly prevented");
//       console.log("================================================");
//     });
//   });
  
//   describe("Multiple Distribution Tests", function () {
//     it("Should handle multiple dividend distributions with changing token balances", async function () {
//       console.log("🧪 TESTING MULTIPLE DIVIDEND DISTRIBUTIONS WITH CHANGING BALANCES");
//       console.log("================================================");
      
//       // 1. Create first dividend distribution
//       console.log("1️⃣ Creating first dividend distribution");
//       const firstDividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC
      
//       await mockUSDC.approve(dividendManager.getAddress(), firstDividendAmount);
//       await dividendManager.createDistribution(firstDividendAmount);
      
//       const firstDistributionId = 1;
//       console.log(`💰 Created first distribution of ${ethers.formatUnits(firstDividendAmount, STABLECOIN_DECIMALS)} USDC`);
      
//       // Initial token balances
//       const totalSupply = await token.totalSupply();
//       const investor1InitialBalance = await token.balanceOf(investor1.getAddress());
//       const investor2InitialBalance = await token.balanceOf(investor2.getAddress());
//       const investor3InitialBalance = await token.balanceOf(investor3.getAddress());
      
//       console.log(`📊 Initial token distribution:`);
//       console.log(`📊 Investor 1: ${ethers.formatEther(investor1InitialBalance)} tokens (${(investor1InitialBalance * 100n) / totalSupply}%)`);
//       console.log(`📊 Investor 2: ${ethers.formatEther(investor2InitialBalance)} tokens (${(investor2InitialBalance * 100n) / totalSupply}%)`);
//       console.log(`📊 Investor 3: ${ethers.formatEther(investor3InitialBalance)} tokens (${(investor3InitialBalance * 100n) / totalSupply}%)`);
      
//       // Claim first distribution
//       console.log("2️⃣ Claiming first distribution");
      
//       const investor1InitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
//       await dividendManager.connect(investor1).claimDividend(firstDistributionId);
//       const investor1FirstDividend = (await mockUSDC.balanceOf(investor1.getAddress())) - investor1InitialUSDC;
      
//       const investor2InitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
//       await dividendManager.connect(investor2).claimDividend(firstDistributionId);
//       const investor2FirstDividend = (await mockUSDC.balanceOf(investor2.getAddress())) - investor2InitialUSDC;
      
//       const investor3InitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
//       await dividendManager.connect(investor3).claimDividend(firstDistributionId);
//       const investor3FirstDividend = (await mockUSDC.balanceOf(investor3.getAddress())) - investor3InitialUSDC;
      
//       console.log(`💰 Investor 1 claimed: ${ethers.formatUnits(investor1FirstDividend, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 2 claimed: ${ethers.formatUnits(investor2FirstDividend, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 3 claimed: ${ethers.formatUnits(investor3FirstDividend, STABLECOIN_DECIMALS)} USDC`);
      
//       // 3. Change token balances (transfer tokens between investors)
//       console.log("3️⃣ Changing token balances between distributions");
      
//       // Investor 1 transfers 100 tokens to Investor 2
//       const transferAmount = ethers.parseEther("100");
//       await token.connect(investor1).transfer(investor2.getAddress(), transferAmount);
      
//       console.log(`🔄 Investor 1 transferred ${ethers.formatEther(transferAmount)} tokens to Investor 2`);
      
//       // New token balances
//       const investor1NewBalance = await token.balanceOf(investor1.getAddress());
//       const investor2NewBalance = await token.balanceOf(investor2.getAddress());
//       const investor3NewBalance = await token.balanceOf(investor3.getAddress());
      
//       console.log(`📊 New token distribution:`);
//       console.log(`📊 Investor 1: ${ethers.formatEther(investor1NewBalance)} tokens (${(investor1NewBalance * 100n) / totalSupply}%)`);
//       console.log(`📊 Investor 2: ${ethers.formatEther(investor2NewBalance)} tokens (${(investor2NewBalance * 100n) / totalSupply}%)`);
//       console.log(`📊 Investor 3: ${ethers.formatEther(investor3NewBalance)} tokens (${(investor3NewBalance * 100n) / totalSupply}%)`);
      
//       // 4. Advance time by 1 year (to allow another distribution)
//       console.log("4️⃣ Advancing time by 1 year");
//       await time.increase(SECONDS_IN_YEAR);
//       console.log("⏱️ Time advanced by 1 year");
      
//       // 5. Create second dividend distribution
//       console.log("5️⃣ Creating second dividend distribution");
//       const secondDividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC
      
//       await mockUSDC.approve(dividendManager.getAddress(), secondDividendAmount);
//       await dividendManager.createDistribution(secondDividendAmount);
      
//       const secondDistributionId = 2;
//       console.log(`💰 Created second distribution of ${ethers.formatUnits(secondDividendAmount, STABLECOIN_DECIMALS)} USDC`);
      
//       // 6. Claim second distribution
//       console.log("6️⃣ Claiming second distribution");
      
//       const investor1SecondInitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
//       await dividendManager.connect(investor1).claimDividend(secondDistributionId);
//       const investor1SecondDividend = (await mockUSDC.balanceOf(investor1.getAddress())) - investor1SecondInitialUSDC;
      
//       const investor2SecondInitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
//       await dividendManager.connect(investor2).claimDividend(secondDistributionId);
//       const investor2SecondDividend = (await mockUSDC.balanceOf(investor2.getAddress())) - investor2SecondInitialUSDC;
      
//       const investor3SecondInitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
//       await dividendManager.connect(investor3).claimDividend(secondDistributionId);
//       const investor3SecondDividend = (await mockUSDC.balanceOf(investor3.getAddress())) - investor3SecondInitialUSDC;
      
//       console.log(`💰 Investor 1 claimed: ${ethers.formatUnits(investor1SecondDividend, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 2 claimed: ${ethers.formatUnits(investor2SecondDividend, STABLECOIN_DECIMALS)} USDC`);
//       console.log(`💰 Investor 3 claimed: ${ethers.formatUnits(investor3SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      
//       // 7. Compare dividend proportions between distributions
//       console.log("7️⃣ Comparing dividend proportions between distributions");
      
//       // Expected second distribution amounts based on new balances
//       const expectedInvestor1Second = (secondDividendAmount * investor1NewBalance) / totalSupply;
//       const expectedInvestor2Second = (secondDividendAmount * investor2NewBalance) / totalSupply;
//       const expectedInvestor3Second = (secondDividendAmount * investor3NewBalance) / totalSupply;
      
//       // Verify that
//       // Verify that the second distribution reflects the changed token balances
//       expect(investor1SecondDividend).to.be.closeTo(expectedInvestor1Second, ethers.parseUnits("0.01", STABLECOIN_DECIMALS));
//       expect(investor2SecondDividend).to.be.closeTo(expectedInvestor2Second, ethers.parseUnits("0.01", STABLECOIN_DECIMALS));
//       expect(investor3SecondDividend).to.be.closeTo(expectedInvestor3Second, ethers.parseUnits("0.01", STABLECOIN_DECIMALS));
      
//       // Verify investor 1's dividend decreased and investor 2's increased
//       expect(investor1SecondDividend < investor1FirstDividend).to.be.true;
//       expect(investor2SecondDividend > investor2FirstDividend).to.be.true;
//       expect(investor3SecondDividend).to.equal(investor3FirstDividend); // Should remain unchanged
      
//       console.log("📊 Dividend proportion changes:");
//       console.log(`📊 Investor 1: ${ethers.formatUnits(investor1FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor1SecondDividend, STABLECOIN_DECIMALS)} USDC (${((investor1SecondDividend * 100n) / investor1FirstDividend) - 100n}% change)`);
//       console.log(`📊 Investor 2: ${ethers.formatUnits(investor2FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor2SecondDividend, STABLECOIN_DECIMALS)} USDC (${((investor2SecondDividend * 100n) / investor2FirstDividend) - 100n}% change)`);
//       console.log(`📊 Investor 3: ${ethers.formatUnits(investor3FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor3SecondDividend, STABLECOIN_DECIMALS)} USDC (unchanged)`);
      
//       console.log("✅ Dividend proportions correctly reflect token balance changes");
//       console.log("================================================");
//     });
    
//     it("Should enforce the minimum distribution interval", async function () {
//       console.log("🧪 TESTING DISTRIBUTION INTERVAL ENFORCEMENT");
//       console.log("================================================");
      
//       // 1. Create first dividend distribution
//       console.log("1️⃣ Creating first dividend distribution");
//       const dividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC
      
//       await mockUSDC.approve(dividendManager.getAddress(), dividendAmount * 2n); // Approve enough for two distributions
//       await dividendManager.createDistribution(dividendAmount);
      
//       console.log(`💰 Created distribution of ${ethers.formatUnits(dividendAmount, STABLECOIN_DECIMALS)} USDC`);
      
//       // 2. Try to create another distribution immediately (should fail)
//       console.log("2️⃣ Attempting to create second distribution immediately");
      
//       await expect(
//         dividendManager.createDistribution(dividendAmount)
//       ).to.be.revertedWith("Distribution interval not reached");
      
//       console.log("✅ Immediate second distribution correctly prevented");
      
//       // 3. Advance time by less than 1 year
//       console.log("3️⃣ Advancing time by 6 months");
//       await time.increase(SECONDS_IN_YEAR / 2); // 6 months
//       console.log("⏱️ Time advanced by 6 months");
      
//       // 4. Try to create distribution after 6 months (should still fail)
//       console.log("4️⃣ Attempting to create distribution after 6 months");
      
//       await expect(
//         dividendManager.createDistribution(dividendAmount)
//       ).to.be.revertedWith("Distribution interval not reached");
      
//       console.log("✅ Distribution after 6 months correctly prevented");
      
//       // 5. Advance time to 1 year
//       console.log("5️⃣ Advancing time to complete 1 year");
//       await time.increase(SECONDS_IN_YEAR / 2); // Another 6 months
//       console.log("⏱️ Time advanced to 1 year after first distribution");
      
//       // 6. Create distribution after 1 year (should succeed)
//       console.log("6️⃣ Creating distribution after 1 year");
      
//       await dividendManager.createDistribution(dividendAmount);
      
//       console.log(`💰 Successfully created second distribution of ${ethers.formatUnits(dividendAmount, STABLECOIN_DECIMALS)} USDC after 1 year`);
//       console.log("✅ Distribution interval enforcement verified");
//       console.log("================================================");
//     });
//   });
  
//   describe("Dividend Rate Tests", function () {
//     it("Should correctly calculate expected dividends based on dividend rate", async function () {
//       console.log("🧪 TESTING DIVIDEND RATE CALCULATIONS");
//       console.log("================================================");
      
//       // 1. Test current dividend rate
//       console.log("1️⃣ Testing initial dividend rate (5%)");
      
//       const initialRate = await dividendManager.dividendRate();
//       expect(initialRate).to.equal(DIVIDEND_RATE);
      
//       const tokenAmount = ethers.parseEther("100"); // 100 tokens
//       const expectedDividend = await dividendManager.calculateExpectedDividend(tokenAmount);
//       const manualCalculation = (tokenAmount * BigInt(DIVIDEND_RATE)) / BigInt(BASIS_POINTS_DENOMINATOR);
      
//       expect(expectedDividend).to.equal(manualCalculation);
      
//       console.log(`📊 For ${ethers.formatEther(tokenAmount)} tokens with ${DIVIDEND_RATE/100}% rate:`);
//       console.log(`📊 Expected annual dividend: ${ethers.formatEther(expectedDividend)} tokens`);
      
//       // 2. Update dividend rate
//       console.log("2️⃣ Testing updated dividend rate (8%)");
      
//       const newRate = 800; // 8%
//       await dividendManager.updateDividendRate(newRate);
      
//       const updatedRate = await dividendManager.dividendRate();
//       expect(updatedRate).to.equal(newRate);
      
//       const newExpectedDividend = await dividendManager.calculateExpectedDividend(tokenAmount);
//       const newManualCalculation = (tokenAmount * BigInt(newRate)) / BigInt(BASIS_POINTS_DENOMINATOR);
      
//       expect(newExpectedDividend).to.equal(newManualCalculation);
      
//       console.log(`📊 For ${ethers.formatEther(tokenAmount)} tokens with updated ${newRate/100}% rate:`);
//       console.log(`📊 Expected annual dividend: ${ethers.formatEther(newExpectedDividend)} tokens`);
//       console.log(`📊 Dividend increased by: ${((newExpectedDividend * 100n) / expectedDividend) - 100n}%`);
      
//       console.log("✅ Dividend rate calculations verified");
//       console.log("================================================");
//     });
    
//     it("Should restrict dividend rate updates to owner only", async function () {
//       console.log("🧪 TESTING DIVIDEND RATE ACCESS CONTROL");
//       console.log("================================================");
      
//       // 1. Attempt to update rate as non-owner
//       console.log("1️⃣ Attempting to update rate as non-owner");
      
//       const newRate = 700; // 7%
      
//       await expect(
//         dividendManager.connect(investor1).updateDividendRate(newRate)
//       ).to.be.revertedWith("Ownable: caller is not the owner");
      
//       console.log("✅ Rate update by non-owner correctly prevented");
      
//       // 2. Update rate as owner
//       console.log("2️⃣ Updating rate as owner");
      
//       await dividendManager.updateDividendRate(newRate);
      
//       const updatedRate = await dividendManager.dividendRate();
//       expect(updatedRate).to.equal(newRate);
      
//       console.log(`✅ Rate successfully updated to ${newRate/100}% by owner`);
//       console.log("================================================");
//     });
//   });
// });
