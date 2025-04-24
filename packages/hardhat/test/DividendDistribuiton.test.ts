import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  ClaimTopicsRegistry,
  TrustedIssuersRegistry,
  IdentityRegistryStorage,
  IdentityRegistry,
  Compliance,
  ERC3643Token,
  MockUSDC,
  DividendManager,
  MockIdentity,
} from "../typechain-types";
//import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Constants for testing
const KYC_CLAIM_TOPIC = 42;
const COUNTRY_US = 840; // US country code (ISO 3166-1 numeric)
const COUNTRY_UK = 826; // UK country code
const DIVIDEND_RATE = 500; // 5%
const PROPERTY_VALUE = ethers.parseEther("1000000"); // $1M property value
const STABLECOIN_DECIMALS = 6; // USDC has 6 decimals
const BASIS_POINTS_DENOMINATOR = 10000;

// Time constants
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;

describe("🏢 Dividend Distribution Mechanism", function () {
  // Contract instances
  let claimTopicsRegistry: ClaimTopicsRegistry;
  let trustedIssuersRegistry: TrustedIssuersRegistry;
  let identityRegistryStorage: IdentityRegistryStorage;
  let identityRegistry: IdentityRegistry;
  let compliance: Compliance;
  let token: ERC3643Token;
  let mockUSDC: MockUSDC;
  let dividendManager: DividendManager;

  // Identity contracts
  let issuerIdentity: MockIdentity;
  let investor1Identity: MockIdentity;
  let investor2Identity: MockIdentity;
  let investor3Identity: MockIdentity;

  // Signers
  let deployer: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let investor1: HardhatEthersSigner;
  let investor2: HardhatEthersSigner;
  let investor3: HardhatEthersSigner;

  // Deploy all contracts and set up basic configuration
  async function deployDividendTestSystem() {
    console.log("📋 DEPLOYING DIVIDEND TEST SYSTEM");
    console.log("================================================");

    // Get signers
    [deployer, issuer, investor1, investor2, investor3] = await ethers.getSigners();
    console.log(`🔑 Using deployer address: ${await deployer.getAddress()}`);

    // 1. Deploy ClaimTopicsRegistry
    console.log("🔧 Deploying ClaimTopicsRegistry...");
    const ClaimTopicsRegistryFactory = await ethers.getContractFactory("ClaimTopicsRegistry");
    claimTopicsRegistry = await ClaimTopicsRegistryFactory.deploy();
    await claimTopicsRegistry.waitForDeployment();
    console.log(`✅ ClaimTopicsRegistry deployed to: ${await claimTopicsRegistry.getAddress()}`);

    // Add KYC claim topic
    await claimTopicsRegistry.addClaimTopic(KYC_CLAIM_TOPIC);
    console.log(`📝 Added KYC claim topic (${KYC_CLAIM_TOPIC}) to registry`);

    // 2. Deploy TrustedIssuersRegistry
    console.log("🔧 Deploying TrustedIssuersRegistry...");
    const TrustedIssuersRegistryFactory = await ethers.getContractFactory("TrustedIssuersRegistry");
    trustedIssuersRegistry = await TrustedIssuersRegistryFactory.deploy();
    await trustedIssuersRegistry.waitForDeployment();
    console.log(`✅ TrustedIssuersRegistry deployed to: ${await trustedIssuersRegistry.getAddress()}`);

    // 3. Deploy IdentityRegistryStorage
    console.log("🔧 Deploying IdentityRegistryStorage...");
    const IdentityRegistryStorageFactory = await ethers.getContractFactory("IdentityRegistryStorage");
    identityRegistryStorage = await IdentityRegistryStorageFactory.deploy();
    await identityRegistryStorage.waitForDeployment();
    console.log(`✅ IdentityRegistryStorage deployed to: ${await identityRegistryStorage.getAddress()}`);

    // 4. Deploy IdentityRegistry
    console.log("🔧 Deploying IdentityRegistry...");
    const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistryFactory.deploy(
      trustedIssuersRegistry.getAddress(),
      claimTopicsRegistry.getAddress(),
      identityRegistryStorage.getAddress(),
    );
    await identityRegistry.waitForDeployment();
    console.log(`✅ IdentityRegistry deployed to: ${await identityRegistry.getAddress()}`);

    // Authorize the Identity Registry in the storage
    await identityRegistryStorage.authorizeRegistry(identityRegistry.getAddress());
    console.log(`🔓 Authorized IdentityRegistry in storage`);

    // 5. Deploy Compliance
    console.log("🔧 Deploying Compliance...");
    const ComplianceFactory = await ethers.getContractFactory("Compliance");
    compliance = await ComplianceFactory.deploy(identityRegistry.getAddress());
    await compliance.waitForDeployment();
    console.log(`✅ Compliance deployed to: ${await compliance.getAddress()}`);

    // 6. Deploy MockUSDC
    console.log("🔧 Deploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy("Mock USDC", "USDC", STABLECOIN_DECIMALS);
    await mockUSDC.waitForDeployment();
    console.log(`✅ MockUSDC deployed to: ${await mockUSDC.getAddress()}`);

    // Mint 10M MockUSDC to deployer for testing
    const usdcAmount = ethers.parseUnits("10000000", STABLECOIN_DECIMALS);
    await mockUSDC.mint(deployer.getAddress(), usdcAmount);
    console.log(`💵 Minted ${ethers.formatUnits(usdcAmount, STABLECOIN_DECIMALS)} USDC to deployer`);

    // Transfer some USDC to investors for testing
    await mockUSDC.transfer(investor1.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));
    await mockUSDC.transfer(investor2.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));
    await mockUSDC.transfer(investor3.getAddress(), ethers.parseUnits("100000", STABLECOIN_DECIMALS));
    console.log(`💸 Transferred 100,000 USDC to each investor`);

    // 7. Deploy ERC3643Token
    console.log("🔧 Deploying ERC3643Token...");
    const tokenName = "Real Estate Token";
    const tokenSymbol = "RET";
    const propertyAddress = "123 Blockchain Blvd, Cryptoville";

    const ERC3643TokenFactory = await ethers.getContractFactory("ERC3643Token");
    token = await ERC3643TokenFactory.deploy(
      tokenName,
      tokenSymbol,
      identityRegistry.getAddress(),
      compliance.getAddress(),
      propertyAddress,
      PROPERTY_VALUE,
    );
    await token.waitForDeployment();
    console.log(`✅ ERC3643Token (${tokenName}) deployed to: ${await token.getAddress()}`);
    console.log(`🏠 Property: ${propertyAddress}`);
    console.log(`💰 Property Value: $${ethers.formatEther(PROPERTY_VALUE)}`);

    // 8. Deploy DividendManager
    console.log("🔧 Deploying DividendManager...");
    const DividendManagerFactory = await ethers.getContractFactory("DividendManager");
    dividendManager = await DividendManagerFactory.deploy(token.getAddress(), mockUSDC.getAddress());
    await dividendManager.waitForDeployment();
    console.log(`✅ DividendManager deployed to: ${await dividendManager.getAddress()}`);

    // Set initial dividend rate
    await dividendManager.updateDividendRate(DIVIDEND_RATE);
    console.log(`📊 Set initial dividend rate to ${DIVIDEND_RATE / 100}%`);

    // Deploy mock identity contracts
    console.log("🔧 Deploying identity contracts...");
    const MockIdentityFactory = await ethers.getContractFactory("MockIdentity");

    issuerIdentity = await MockIdentityFactory.deploy(issuer.getAddress());
    await issuerIdentity.waitForDeployment();
    console.log(`✅ Issuer identity deployed to: ${await issuerIdentity.getAddress()}`);

    investor1Identity = await MockIdentityFactory.deploy(investor1.getAddress());
    await investor1Identity.waitForDeployment();

    investor2Identity = await MockIdentityFactory.deploy(investor2.getAddress());
    await investor2Identity.waitForDeployment();

    investor3Identity = await MockIdentityFactory.deploy(investor3.getAddress());
    await investor3Identity.waitForDeployment();
    console.log(`✅ All investor identity contracts deployed`);

    // Add issuer to trusted issuers with KYC claim topic
    await trustedIssuersRegistry.addTrustedIssuer(issuerIdentity.getAddress(), [KYC_CLAIM_TOPIC]);
    console.log(`🔐 Added issuer to trusted issuers registry`);

    // Set up claim signer key in issuer identity
    await issuerIdentity.connect(issuer).addKey(
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [await issuerIdentity.getAddress(), KYC_CLAIM_TOPIC],
        ),
      ),
      3, // Purpose: CLAIM
    );
    console.log(`🔑 Set up claim signer key in issuer identity`);

    // Add KYC claims to investor identities
    console.log("📝 Adding KYC claims to investor identities...");
    await investor1Identity.connect(investor1).addClaim(
      KYC_CLAIM_TOPIC,
      1, // scheme (1 = ECDSA)
      issuerIdentity.getAddress(),
      "0x", // signature
      "0x", // data
      "", // uri
    );

    await investor2Identity
      .connect(investor2)
      .addClaim(KYC_CLAIM_TOPIC, 1, issuerIdentity.getAddress(), "0x", "0x", "");

    await investor3Identity
      .connect(investor3)
      .addClaim(KYC_CLAIM_TOPIC, 1, issuerIdentity.getAddress(), "0x", "0x", "");
    console.log(`✅ KYC claims added to all investor identities`);

    // Register investors in the identity registry
    console.log("📝 Registering investors in identity registry...");
    await identityRegistry.registerIdentity(investor1.getAddress(), investor1Identity.getAddress(), COUNTRY_US);
    console.log(`👤 Investor 1 registered (Country: 🇺🇸 US)`);

    await identityRegistry.registerIdentity(investor2.getAddress(), investor2Identity.getAddress(), COUNTRY_UK);
    console.log(`👤 Investor 2 registered (Country: 🇬🇧 UK)`);

    await identityRegistry.registerIdentity(investor3.getAddress(), investor3Identity.getAddress(), COUNTRY_US);
    console.log(`👤 Investor 3 registered (Country: 🇺🇸 US)`);

    // //Add agent role to deployer
    // await token.addAgent(await deployer.getAddress());
    // console.log(`👮 Added agent role to deployer`);
    // Add the ERC3643Token contract as a trusted contract
    await compliance.addTrustedContract(await token.getAddress());

    console.log("Contract owner:", await token.owner());
    console.log("Deployer address:", await deployer.getAddress());
    console.log("Is deployer agent?", await token.isAgent(await deployer.getAddress()));

    // Mint initial tokens to investors with different allocations
    console.log("🪙 Minting initial tokens to investors...");
    await token.mint(investor1.getAddress(), ethers.parseEther("400")); // 40%
    console.log(`💼 Minted 400 tokens to Investor 1 (40%)`);

    await token.mint(investor2.getAddress(), ethers.parseEther("350")); // 35%
    console.log(`💼 Minted 350 tokens to Investor 2 (35%)`);

    await token.mint(investor3.getAddress(), ethers.parseEther("250")); // 25%
    console.log(`💼 Minted 250 tokens to Investor 3 (25%)`);

    const totalSupply = await token.totalSupply();
    console.log(`📊 Total token supply: ${ethers.formatEther(totalSupply)} ${await token.symbol()}`);

    console.log("✅ DIVIDEND TEST SYSTEM DEPLOYMENT COMPLETE");
    console.log("================================================");

    return {
      claimTopicsRegistry,
      trustedIssuersRegistry,
      identityRegistryStorage,
      identityRegistry,
      compliance,
      token,
      mockUSDC,
      dividendManager,
      issuerIdentity,
      investor1Identity,
      investor2Identity,
      investor3Identity,
      deployer,
      issuer,
      investor1,
      investor2,
      investor3,
    };
  }

  // Load fixture before each test
  beforeEach(async function () {
    const fixture = await loadFixture(deployDividendTestSystem);

    // Set all contract instances and signers
    claimTopicsRegistry = fixture.claimTopicsRegistry;
    trustedIssuersRegistry = fixture.trustedIssuersRegistry;
    identityRegistryStorage = fixture.identityRegistryStorage;
    identityRegistry = fixture.identityRegistry;
    compliance = fixture.compliance;
    token = fixture.token;
    mockUSDC = fixture.mockUSDC;
    dividendManager = fixture.dividendManager;
    issuerIdentity = fixture.issuerIdentity;
    investor1Identity = fixture.investor1Identity;
    investor2Identity = fixture.investor2Identity;
    investor3Identity = fixture.investor3Identity;
    deployer = fixture.deployer;
    issuer = fixture.issuer;
    investor1 = fixture.investor1;
    investor2 = fixture.investor2;
    investor3 = fixture.investor3;
  });

  describe("🧾 Single Distribution Tests", function () {
    it("💯 Should correctly distribute dividends proportionally to token holders", async function () {
      console.log("🧪 TESTING SINGLE DIVIDEND DISTRIBUTION");
      console.log("================================================");

      // 1. Calculate the annual dividend amount (5% of property value)
      console.log("1️⃣ Calculating expected annual dividend");
      const totalSupply = await token.totalSupply();
      const expectedAnnualDividend = (totalSupply * BigInt(DIVIDEND_RATE)) / BigInt(BASIS_POINTS_DENOMINATOR);
      console.log(
        `💰 Expected annual dividend: ${ethers.formatEther(expectedAnnualDividend)} tokens (${DIVIDEND_RATE / 100}% of total supply)`,
      );

      // Convert to USDC amount (6 decimals)
      const dividendAmountUSDC = ethers.parseUnits(ethers.formatEther(expectedAnnualDividend), STABLECOIN_DECIMALS);
      console.log(`💵 Equivalent in USDC: ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);

      // 2. Create a dividend distribution
      console.log("2️⃣ Creating dividend distribution");
      console.log(
        `🔄 Approving DividendManager to spend ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`,
      );
      await mockUSDC.approve(dividendManager.getAddress(), dividendAmountUSDC);

      console.log(
        `📢 Calling createDistribution with ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`,
      );
      const tx = await dividendManager.createDistribution(dividendAmountUSDC);
      await tx.wait();

      console.log(`💰 Created distribution of ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);

      // Verify distribution details
      const distributionId = 1;
      console.log(`🔍 Verifying distribution #${distributionId} details`);
      const distribution = await dividendManager.distributions(distributionId);

      console.log(`📊 Distribution details:`);
      console.log(`   - Total amount: ${ethers.formatUnits(distribution.totalAmount, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   - Total supply snapshot: ${ethers.formatEther(distribution.totalSupplySnapshot)} tokens`);
      console.log(`   - Finalized: ${distribution.finalized ? "Yes ✅" : "No ❌"}`);
      console.log(`   - Created at: ${new Date(Number(distribution.timestamp) * 1000).toLocaleString()}`);

      expect(distribution.totalAmount).to.equal(dividendAmountUSDC);
      expect(distribution.totalSupplySnapshot).to.equal(totalSupply);
      expect(distribution.finalized).to.be.true;

      console.log("✅ Distribution details verified!");

      // 3. Investors claim their dividends
      console.log("3️⃣ Investors claiming dividends");

      // Calculate expected investor shares based on their token holdings
      const investor1Balance = await token.balanceOf(investor1.getAddress());
      const investor2Balance = await token.balanceOf(investor2.getAddress());
      const investor3Balance = await token.balanceOf(investor3.getAddress());

      const investor1Share = (investor1Balance * dividendAmountUSDC) / totalSupply;
      const investor2Share = (investor2Balance * dividendAmountUSDC) / totalSupply;
      const investor3Share = (investor3Balance * dividendAmountUSDC) / totalSupply;

      console.log(`📊 Investor token holdings and expected dividends:`);
      console.log(
        `👤 Investor 1 (${ethers.formatEther(investor1Balance)} tokens, ${(investor1Balance * 100n) / totalSupply}%):`,
      );
      console.log(`   Expected: ${ethers.formatUnits(investor1Share, STABLECOIN_DECIMALS)} USDC`);

      console.log(
        `👤 Investor 2 (${ethers.formatEther(investor2Balance)} tokens, ${(investor2Balance * 100n) / totalSupply}%):`,
      );
      console.log(`   Expected: ${ethers.formatUnits(investor2Share, STABLECOIN_DECIMALS)} USDC`);

      console.log(
        `👤 Investor 3 (${ethers.formatEther(investor3Balance)} tokens, ${(investor3Balance * 100n) / totalSupply}%):`,
      );
      console.log(`   Expected: ${ethers.formatUnits(investor3Share, STABLECOIN_DECIMALS)} USDC`);

      // Record initial USDC balances
      const investor1InitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      const investor2InitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const investor3InitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());

      console.log(`💵 Initial USDC balances:`);
      console.log(`   Investor 1: ${ethers.formatUnits(investor1InitialUSDC, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Investor 2: ${ethers.formatUnits(investor2InitialUSDC, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Investor 3: ${ethers.formatUnits(investor3InitialUSDC, STABLECOIN_DECIMALS)} USDC`);

      // Claim dividends
      console.log(`\n🤑 Investors claiming dividends for distribution #${distributionId}...`);

      console.log(`👤 Investor 1 claiming...`);
      await dividendManager.connect(investor1).claimDividend(distributionId);
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 2 claiming...`);
      await dividendManager.connect(investor2).claimDividend(distributionId);
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 3 claiming...`);
      await dividendManager.connect(investor3).claimDividend(distributionId);
      console.log(`✅ Claim successful!`);

      // Verify dividend amounts received
      const investor1FinalUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      const investor2FinalUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const investor3FinalUSDC = await mockUSDC.balanceOf(investor3.getAddress());

      // Calculate actual received amounts
      const investor1Received = investor1FinalUSDC - investor1InitialUSDC;
      const investor2Received = investor2FinalUSDC - investor2InitialUSDC;
      const investor3Received = investor3FinalUSDC - investor3InitialUSDC;

      console.log(`\n💵 Final USDC balances after claims:`);
      console.log(`   Investor 1: ${ethers.formatUnits(investor1FinalUSDC, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Investor 2: ${ethers.formatUnits(investor2FinalUSDC, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Investor 3: ${ethers.formatUnits(investor3FinalUSDC, STABLECOIN_DECIMALS)} USDC`);

      console.log(`\n💰 Dividend amounts received:`);
      console.log(`👤 Investor 1 received: ${ethers.formatUnits(investor1Received, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Expected: ${ethers.formatUnits(investor1Share, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Difference: ${ethers.formatUnits(investor1Received - investor1Share, STABLECOIN_DECIMALS)} USDC`);

      console.log(`👤 Investor 2 received: ${ethers.formatUnits(investor2Received, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Expected: ${ethers.formatUnits(investor2Share, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Difference: ${ethers.formatUnits(investor2Received - investor2Share, STABLECOIN_DECIMALS)} USDC`);

      console.log(`👤 Investor 3 received: ${ethers.formatUnits(investor3Received, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Expected: ${ethers.formatUnits(investor3Share, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Difference: ${ethers.formatUnits(investor3Received - investor3Share, STABLECOIN_DECIMALS)} USDC`);

      // Assert that received amounts match expected shares
      expect(investor1Received).to.equal(investor1Share);
      expect(investor2Received).to.equal(investor2Share);
      expect(investor3Received).to.equal(investor3Share);

      // Verify claim status
      const investor1Claimed = await dividendManager.dividendClaimed(distributionId, investor1.getAddress());
      const investor2Claimed = await dividendManager.dividendClaimed(distributionId, investor2.getAddress());
      const investor3Claimed = await dividendManager.dividendClaimed(distributionId, investor3.getAddress());

      console.log(`\n🔍 Verifying claim status for distribution #${distributionId}:`);
      console.log(`   Investor 1 claimed: ${investor1Claimed ? "✅" : "❌"}`);
      console.log(`   Investor 2 claimed: ${investor2Claimed ? "✅" : "❌"}`);
      console.log(`   Investor 3 claimed: ${investor3Claimed ? "✅" : "❌"}`);

      expect(investor1Claimed).to.be.true;
      expect(investor2Claimed).to.be.true;
      expect(investor3Claimed).to.be.true;

      console.log("✅ All investors successfully claimed their dividends!");

      // 4. Verify that claimed dividends cannot be claimed again
      console.log("4️⃣ Verifying prevention of double claiming");

      console.log(`👤 Investor 1 attempting to claim again...`);
      await expect(dividendManager.connect(investor1).claimDividend(distributionId)).to.be.revertedWith(
        "Dividend already claimed",
      );

      console.log("✅ Double claiming correctly prevented!");

      // 5. Verify total distribution sum equals the distributed amount
      console.log("5️⃣ Verifying distribution sum and rounding");

      const totalDistributed = investor1Received + investor2Received + investor3Received;

      console.log(`💰 Distribution summary:`);
      console.log(`   Total distributed: ${ethers.formatUnits(totalDistributed, STABLECOIN_DECIMALS)} USDC`);
      console.log(
        `   Original distribution amount: ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`,
      );
      console.log(
        `   Difference: ${ethers.formatUnits(totalDistributed - dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`,
      );

      // Allow for minimal rounding errors (should be very close to the original amount)
      expect(totalDistributed).to.be.closeTo(
        dividendAmountUSDC,
        ethers.parseUnits("0.01", STABLECOIN_DECIMALS), // Allow for very small rounding difference
      );

      console.log("✅ Distribution sum verification complete!");
      console.log("================================================");
    });

    it("🚫 Should prevent non-token holders from claiming dividends", async function () {
      console.log("🧪 TESTING PREVENTION OF CLAIMS BY NON-TOKEN HOLDERS");
      console.log("================================================");

      // 1. Create a dividend distribution
      console.log("1️⃣ Creating dividend distribution");
      const dividendAmountUSDC = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC

      console.log(
        `🔄 Approving DividendManager to spend ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`,
      );
      await mockUSDC.approve(dividendManager.getAddress(), dividendAmountUSDC);

      console.log(`📢 Creating distribution of ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);
      await dividendManager.createDistribution(dividendAmountUSDC);

      console.log(`💰 Created distribution of ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC`);

      // 2. Attempt to claim with non-token holder
      console.log("2️⃣ Attempting claim by non-token holder");

      // Using deployer who has no tokens
      const deployerBalance = await token.balanceOf(deployer.getAddress());
      console.log(`👤 Deployer token balance: ${ethers.formatEther(deployerBalance)} tokens`);

      console.log(`❌ Deployer attempting to claim dividend (should fail)...`);
      await expect(dividendManager.connect(deployer).claimDividend(1)).to.be.revertedWith("No tokens held");

      console.log("✅ Claim by non-token holder correctly prevented!");
      console.log("================================================");
    });
  });

  describe("📦 Multiple Distribution Tests", function () {
    it("🔄 Should handle multiple dividend distributions with changing token balances", async function () {
      console.log("🧪 TESTING MULTIPLE DIVIDEND DISTRIBUTIONS WITH CHANGING BALANCES");
      console.log("================================================");

      // 1. Create first dividend distribution
      console.log("1️⃣ Creating first dividend distribution");
      const firstDividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC

      console.log(
        `🔄 Approving DividendManager to spend ${ethers.formatUnits(firstDividendAmount, STABLECOIN_DECIMALS)} USDC`,
      );
      await mockUSDC.approve(dividendManager.getAddress(), firstDividendAmount);

      console.log(`📢 Creating first distribution...`);
      await dividendManager.createDistribution(firstDividendAmount);

      const firstDistributionId = 1;
      console.log(
        `💰 Created first distribution #${firstDistributionId} of ${ethers.formatUnits(firstDividendAmount, STABLECOIN_DECIMALS)} USDC`,
      );

      // Initial token balances
      const totalSupply = await token.totalSupply();
      const investor1InitialBalance = await token.balanceOf(investor1.getAddress());
      const investor2InitialBalance = await token.balanceOf(investor2.getAddress());
      const investor3InitialBalance = await token.balanceOf(investor3.getAddress());

      console.log(`📊 Initial token distribution:`);
      console.log(
        `👤 Investor 1: ${ethers.formatEther(investor1InitialBalance)} tokens (${(investor1InitialBalance * 100n) / totalSupply}%)`,
      );
      console.log(
        `👤 Investor 2: ${ethers.formatEther(investor2InitialBalance)} tokens (${(investor2InitialBalance * 100n) / totalSupply}%)`,
      );
      console.log(
        `👤 Investor 3: ${ethers.formatEther(investor3InitialBalance)} tokens (${(investor3InitialBalance * 100n) / totalSupply}%)`,
      );

      // Claim first distribution
      console.log("2️⃣ Claiming first distribution");

      console.log(`👤 Investor 1 claiming distribution #${firstDistributionId}...`);
      const investor1InitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      await dividendManager.connect(investor1).claimDividend(firstDistributionId);
      const investor1FirstDividend = (await mockUSDC.balanceOf(investor1.getAddress())) - investor1InitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 2 claiming distribution #${firstDistributionId}...`);
      const investor2InitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      await dividendManager.connect(investor2).claimDividend(firstDistributionId);
      const investor2FirstDividend = (await mockUSDC.balanceOf(investor2.getAddress())) - investor2InitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 3 claiming distribution #${firstDistributionId}...`);
      const investor3InitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      await dividendManager.connect(investor3).claimDividend(firstDistributionId);
      const investor3FirstDividend = (await mockUSDC.balanceOf(investor3.getAddress())) - investor3InitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`\n💰 First distribution claims summary:`);
      console.log(`👤 Investor 1 claimed: ${ethers.formatUnits(investor1FirstDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(`👤 Investor 2 claimed: ${ethers.formatUnits(investor2FirstDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(`👤 Investor 3 claimed: ${ethers.formatUnits(investor3FirstDividend, STABLECOIN_DECIMALS)} USDC`);

      // 3. Change token balances (transfer tokens between investors)
      console.log("\n3️⃣ Changing token balances between distributions");

      // Investor 1 transfers 100 tokens to Investor 2
      const transferAmount = ethers.parseEther("100");
      console.log(`🔄 Investor 1 transferring ${ethers.formatEther(transferAmount)} tokens to Investor 2...`);
      await token.connect(investor1).transfer(investor2.getAddress(), transferAmount);
      console.log(`✅ Transfer complete!`);

      // New token balances
      const investor1NewBalance = await token.balanceOf(investor1.getAddress());
      const investor2NewBalance = await token.balanceOf(investor2.getAddress());
      const investor3NewBalance = await token.balanceOf(investor3.getAddress());

      console.log(`\n📊 New token distribution after transfer:`);
      console.log(
        `👤 Investor 1: ${ethers.formatEther(investor1NewBalance)} tokens (${(investor1NewBalance * 100n) / totalSupply}%)`,
      );
      console.log(`   Change: ${ethers.formatEther(investor1NewBalance - investor1InitialBalance)} tokens`);

      console.log(
        `👤 Investor 2: ${ethers.formatEther(investor2NewBalance)} tokens (${(investor2NewBalance * 100n) / totalSupply}%)`,
      );
      console.log(`   Change: ${ethers.formatEther(investor2NewBalance - investor2InitialBalance)} tokens`);

      console.log(
        `👤 Investor 3: ${ethers.formatEther(investor3NewBalance)} tokens (${(investor3NewBalance * 100n) / totalSupply}%)`,
      );
      console.log(`   Change: No change`);

      // 4. Advance time by 1 year (to allow another distribution)
      console.log("\n4️⃣ Advancing time by 1 year");
      await time.increase(SECONDS_IN_YEAR);
      console.log(`⏱️ Time advanced by 1 year (${SECONDS_IN_YEAR} seconds)`);

      // 5. Create second dividend distribution
      console.log("\n5️⃣ Creating second dividend distribution");
      const secondDividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC

      console.log(
        `🔄 Approving DividendManager to spend ${ethers.formatUnits(secondDividendAmount, STABLECOIN_DECIMALS)} USDC`,
      );
      await mockUSDC.approve(dividendManager.getAddress(), secondDividendAmount);

      console.log(`📢 Creating second distribution...`);
      await dividendManager.createDistribution(secondDividendAmount);

      const secondDistributionId = 2;
      console.log(
        `💰 Created second distribution #${secondDistributionId} of ${ethers.formatUnits(secondDividendAmount, STABLECOIN_DECIMALS)} USDC`,
      );

      // 6. Claim second distribution
      console.log("\n6️⃣ Claiming second distribution");

      console.log(`👤 Investor 1 claiming distribution #${secondDistributionId}...`);
      const investor1SecondInitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      await dividendManager.connect(investor1).claimDividend(secondDistributionId);
      const investor1SecondDividend = (await mockUSDC.balanceOf(investor1.getAddress())) - investor1SecondInitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 2 claiming distribution #${secondDistributionId}...`);
      const investor2SecondInitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      await dividendManager.connect(investor2).claimDividend(secondDistributionId);
      const investor2SecondDividend = (await mockUSDC.balanceOf(investor2.getAddress())) - investor2SecondInitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`👤 Investor 3 claiming distribution #${secondDistributionId}...`);
      const investor3SecondInitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      await dividendManager.connect(investor3).claimDividend(secondDistributionId);
      const investor3SecondDividend = (await mockUSDC.balanceOf(investor3.getAddress())) - investor3SecondInitialUSDC;
      console.log(`✅ Claim successful!`);

      console.log(`\n💰 Second distribution claims summary:`);
      console.log(`👤 Investor 1 claimed: ${ethers.formatUnits(investor1SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(`👤 Investor 2 claimed: ${ethers.formatUnits(investor2SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(`👤 Investor 3 claimed: ${ethers.formatUnits(investor3SecondDividend, STABLECOIN_DECIMALS)} USDC`);

      // 7. Compare dividend proportions between distributions
      console.log("\n7️⃣ Comparing dividend proportions between distributions");

      // Expected second distribution amounts based on new balances
      const expectedInvestor1Second = (secondDividendAmount * investor1NewBalance) / totalSupply;
      const expectedInvestor2Second = (secondDividendAmount * investor2NewBalance) / totalSupply;
      const expectedInvestor3Second = (secondDividendAmount * investor3NewBalance) / totalSupply;

      console.log(`\n📊 Verifying second distribution calculations:`);
      console.log(`👤 Investor 1:`);
      console.log(`   Expected: ${ethers.formatUnits(expectedInvestor1Second, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Actual: ${ethers.formatUnits(investor1SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(
        `   Difference: ${ethers.formatUnits(investor1SecondDividend - expectedInvestor1Second, STABLECOIN_DECIMALS)} USDC`,
      );

      console.log(`👤 Investor 2:`);
      console.log(`   Expected: ${ethers.formatUnits(expectedInvestor2Second, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Actual: ${ethers.formatUnits(investor2SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(
        `   Difference: ${ethers.formatUnits(investor2SecondDividend - expectedInvestor2Second, STABLECOIN_DECIMALS)} USDC`,
      );

      console.log(`👤 Investor 3:`);
      console.log(`   Expected: ${ethers.formatUnits(expectedInvestor3Second, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   Actual: ${ethers.formatUnits(investor3SecondDividend, STABLECOIN_DECIMALS)} USDC`);
      console.log(
        `   Difference: ${ethers.formatUnits(investor3SecondDividend - expectedInvestor3Second, STABLECOIN_DECIMALS)} USDC`,
      );

      // Verify that the second distribution reflects the changed token balances
      expect(investor1SecondDividend).to.be.closeTo(
        expectedInvestor1Second,
        ethers.parseUnits("0.01", STABLECOIN_DECIMALS),
      );
      expect(investor2SecondDividend).to.be.closeTo(
        expectedInvestor2Second,
        ethers.parseUnits("0.01", STABLECOIN_DECIMALS),
      );
      expect(investor3SecondDividend).to.be.closeTo(
        expectedInvestor3Second,
        ethers.parseUnits("0.01", STABLECOIN_DECIMALS),
      );

      // Verify investor 1's dividend decreased and investor 2's increased
      expect(investor1SecondDividend < investor1FirstDividend).to.be.true;
      expect(investor2SecondDividend > investor2FirstDividend).to.be.true;
      expect(investor3SecondDividend).to.equal(investor3FirstDividend); // Should remain unchanged

      console.log("\n📈 Dividend proportion changes between distributions:");

      const investor1PercentChange =
        investor1FirstDividend > 0n ? (investor1SecondDividend * 10000n) / investor1FirstDividend - 10000n : 0n;

      const investor2PercentChange =
        investor2FirstDividend > 0n ? (investor2SecondDividend * 10000n) / investor2FirstDividend - 10000n : 0n;

      const investor3PercentChange =
        investor3FirstDividend > 0n ? (investor3SecondDividend * 10000n) / investor3FirstDividend - 10000n : 0n;

      console.log(
        `👤 Investor 1: ${ethers.formatUnits(investor1FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor1SecondDividend, STABLECOIN_DECIMALS)} USDC (${Number(investor1PercentChange) / 100}% change)`,
      );
      console.log(
        `👤 Investor 2: ${ethers.formatUnits(investor2FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor2SecondDividend, STABLECOIN_DECIMALS)} USDC (${Number(investor2PercentChange) / 100}% change)`,
      );
      console.log(
        `👤 Investor 3: ${ethers.formatUnits(investor3FirstDividend, STABLECOIN_DECIMALS)} → ${ethers.formatUnits(investor3SecondDividend, STABLECOIN_DECIMALS)} USDC (${Number(investor3PercentChange) / 100}% change)`,
      );

      console.log("✅ Dividend proportions correctly reflect token balance changes!");
      console.log("================================================");
    });

    it("⏱️ Should enforce the minimum distribution interval", async function () {
      console.log("🧪 TESTING DISTRIBUTION INTERVAL ENFORCEMENT");
      console.log("================================================");

      // 1. Create first dividend distribution
      console.log("1️⃣ Creating first dividend distribution");
      const dividendAmount = ethers.parseUnits("50000", STABLECOIN_DECIMALS); // 50,000 USDC

      console.log(
        `🔄 Approving DividendManager to spend ${ethers.formatUnits(dividendAmount * 2n, STABLECOIN_DECIMALS)} USDC for two potential distributions`,
      );
      await mockUSDC.approve(dividendManager.getAddress(), dividendAmount * 2n); // Approve enough for two distributions

      console.log(`📢 Creating first distribution...`);
      await dividendManager.createDistribution(dividendAmount);

      const firstDistributionTime = await time.latest();
      console.log(
        `💰 Created distribution of ${ethers.formatUnits(dividendAmount, STABLECOIN_DECIMALS)} USDC at timestamp ${firstDistributionTime}`,
      );

      // 2. Try to create another distribution immediately (should fail)
      console.log("\n2️⃣ Attempting to create second distribution immediately");

      console.log(`⚠️ Attempting to create second distribution right away (should fail)...`);
      await expect(dividendManager.createDistribution(dividendAmount)).to.be.revertedWith(
        "Distribution interval not reached",
      );

      console.log("✅ Immediate second distribution correctly prevented!");

      // 3. Advance time by less than 1 year
      console.log("\n3️⃣ Advancing time by 6 months");
      await time.increase(SECONDS_IN_YEAR / 2); // 6 months
      const timeAfterSixMonths = await time.latest();
      console.log(`⏱️ Time advanced by 6 months (${SECONDS_IN_YEAR / 2} seconds)`);
      console.log(`   First distribution time: ${firstDistributionTime}`);
      console.log(`   Current time: ${timeAfterSixMonths}`);
      console.log(
        `   Time passed: ${timeAfterSixMonths - firstDistributionTime} seconds (${Math.floor((timeAfterSixMonths - firstDistributionTime) / SECONDS_IN_DAY)} days)`,
      );

      // 4. Try to create distribution after 6 months (should still fail)
      console.log("\n4️⃣ Attempting to create distribution after 6 months");

      console.log(`⚠️ Attempting to create distribution after 6 months (should still fail)...`);
      await expect(dividendManager.createDistribution(dividendAmount)).to.be.revertedWith(
        "Distribution interval not reached",
      );

      console.log("✅ Distribution after 6 months correctly prevented!");

      // 5. Advance time to 1 year
      console.log("\n5️⃣ Advancing time to complete 1 year");
      await time.increase(SECONDS_IN_YEAR / 2); // Another 6 months
      const timeAfterOneYear = await time.latest();
      console.log(`⏱️ Time advanced to 1 year after first distribution`);
      console.log(`   First distribution time: ${firstDistributionTime}`);
      console.log(`   Current time: ${timeAfterOneYear}`);
      console.log(
        `   Total time passed: ${timeAfterOneYear - firstDistributionTime} seconds (${Math.floor((timeAfterOneYear - firstDistributionTime) / SECONDS_IN_DAY)} days)`,
      );

      // 6. Create distribution after 1 year (should succeed)
      console.log("\n6️⃣ Creating distribution after 1 year");

      console.log(`📢 Creating second distribution after waiting 1 year...`);
      await dividendManager.createDistribution(dividendAmount);
      console.log(`✅ Second distribution created successfully!`);

      console.log(
        `💰 Successfully created second distribution of ${ethers.formatUnits(dividendAmount, STABLECOIN_DECIMALS)} USDC after 1 year`,
      );

      // Verify distribution details
      const distributionId = 2;
      const distribution = await dividendManager.distributions(distributionId);

      console.log(`\n📊 Second distribution details:`);
      console.log(`   - ID: ${distributionId}`);
      console.log(`   - Total amount: ${ethers.formatUnits(distribution.totalAmount, STABLECOIN_DECIMALS)} USDC`);
      console.log(`   - Created at: ${new Date(Number(distribution.timestamp) * 1000).toLocaleString()}`);
      console.log(`   - Finalized: ${distribution.finalized ? "Yes ✅" : "No ❌"}`);

      console.log("✅ Distribution interval enforcement verified!");
      console.log("================================================");
    });
  });

  describe("📊 Dividend Rate Tests", function () {
    it("🧮 Should correctly calculate expected dividends based on dividend rate", async function () {
      console.log("🧪 TESTING DIVIDEND RATE CALCULATIONS");
      console.log("================================================");

      // 1. Test current dividend rate
      console.log("1️⃣ Testing initial dividend rate (5%)");

      const initialRate = await dividendManager.dividendRate();
      expect(initialRate).to.equal(DIVIDEND_RATE);
      console.log(`📊 Current dividend rate: ${initialRate / BigInt(100)}% (${initialRate} basis points)`);

      const tokenAmount = ethers.parseEther("100"); // 100 tokens
      console.log(`🔍 Calculating expected dividend for ${ethers.formatEther(tokenAmount)} tokens`);

      const expectedDividend = await dividendManager.calculateExpectedDividend(tokenAmount);
      const manualCalculation = (tokenAmount * BigInt(DIVIDEND_RATE)) / BigInt(BASIS_POINTS_DENOMINATOR);

      console.log(`📊 Expected annual dividend from contract: ${ethers.formatEther(expectedDividend)} tokens`);
      console.log(`📊 Manual calculation: ${ethers.formatEther(manualCalculation)} tokens`);
      console.log(`📊 Difference: ${ethers.formatEther(expectedDividend - manualCalculation)} tokens`);

      expect(expectedDividend).to.equal(manualCalculation);
      console.log(`✅ Contract calculation matches manual calculation!`);

      // 2. Update dividend rate
      console.log("\n2️⃣ Testing updated dividend rate (8%)");

      const newRate = 800; // 8%
      console.log(`🔄 Updating dividend rate from ${initialRate / BigInt(100)}% to ${newRate / 100}%...`);
      await dividendManager.updateDividendRate(newRate);

      const updatedRate = await dividendManager.dividendRate();
      expect(updatedRate).to.equal(newRate);
      console.log(`✅ Rate updated successfully to ${updatedRate / BigInt(100)}%!`);

      console.log(`🔍 Calculating expected dividend with new rate for ${ethers.formatEther(tokenAmount)} tokens`);
      const newExpectedDividend = await dividendManager.calculateExpectedDividend(tokenAmount);
      const newManualCalculation = (tokenAmount * BigInt(newRate)) / BigInt(BASIS_POINTS_DENOMINATOR);

      console.log(`📊 Expected annual dividend from contract: ${ethers.formatEther(newExpectedDividend)} tokens`);
      console.log(`📊 Manual calculation: ${ethers.formatEther(newManualCalculation)} tokens`);
      console.log(`📊 Difference: ${ethers.formatEther(newExpectedDividend - newManualCalculation)} tokens`);

      expect(newExpectedDividend).to.equal(newManualCalculation);
      console.log(`✅ Contract calculation with new rate matches manual calculation!`);

      // Compare before and after rate change
      console.log(`\n📈 Dividend increase comparison:`);
      console.log(`   Before (${initialRate / BigInt(100)}%): ${ethers.formatEther(expectedDividend)} tokens`);
      console.log(`   After (${newRate / 100}%): ${ethers.formatEther(newExpectedDividend)} tokens`);

      const percentIncrease =
        newExpectedDividend > 0n && expectedDividend > 0n
          ? (newExpectedDividend * 10000n) / expectedDividend - 10000n
          : 0n;

      console.log(
        `   Increase: ${ethers.formatEther(newExpectedDividend - expectedDividend)} tokens (${Number(percentIncrease) / 100}%)`,
      );

      console.log("✅ Dividend rate calculations verified!");
      console.log("================================================");
    });

    it("🔐 Should restrict dividend rate updates to owner only", async function () {
      console.log("🧪 TESTING DIVIDEND RATE ACCESS CONTROL");
      console.log("================================================");

      // 1. Attempt to update rate as non-owner
      console.log("1️⃣ Attempting to update rate as non-owner");

      const initialRate = await dividendManager.dividendRate();
      const newRate = 700; // 7%

      console.log(`📊 Current dividend rate: ${initialRate / BigInt(100)}%`);
      console.log(`🔄 Attempting to update to ${newRate / 100}% as Investor 1 (should fail)...`);

      await expect(dividendManager.connect(investor1).updateDividendRate(newRate)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      // Verify rate didn't change
      const rateAfterFailedUpdate = await dividendManager.dividendRate();
      expect(rateAfterFailedUpdate).to.equal(initialRate);
      console.log(`✅ Rate update by non-owner correctly prevented!`);
      console.log(`📊 Dividend rate remains at ${rateAfterFailedUpdate / BigInt(100)}%`);

      // 2. Update rate as owner
      console.log("\n2️⃣ Updating rate as owner");

      const owner = await dividendManager.owner();
      console.log(`👤 Current contract owner: ${owner}`);

      console.log(`🔄 Updating rate to ${newRate / 100}% as owner...`);
      await dividendManager.updateDividendRate(newRate);

      const updatedRate = await dividendManager.dividendRate();
      expect(updatedRate).to.equal(newRate);

      console.log(`✅ Rate successfully updated to ${updatedRate / BigInt(100)}% by owner!`);
      console.log("================================================");
    });
  });
});
