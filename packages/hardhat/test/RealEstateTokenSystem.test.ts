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
  VestingManager,
  DividendManager,
  SecondaryMarket,
  RealEstateSecurityManager,
  MockIdentity,
  VestingManager__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// Constants for testing
const KYC_CLAIM_TOPIC = 42;
const COUNTRY_US = 840; // US country code (ISO 3166-1 numeric)
const COUNTRY_UK = 826; // UK country code
const DIVIDEND_RATE = 500; // 5%
const PROPERTY_VALUE = ethers.parseEther("1000000"); // $1M property value
const TOKEN_AMOUNT = ethers.parseEther("1000"); // 1000 tokens
const STABLECOIN_DECIMALS = 6; // USDC has 6 decimals
const BASIS_POINTS_DENOMINATOR = 10000;

// Time constants
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;
const FIVE_YEARS = 5 * SECONDS_IN_YEAR;
const SEVEN_YEARS = 7 * SECONDS_IN_YEAR;

describe("Real Estate Tokenization System", function () {
  // Contract instances
  let claimTopicsRegistry: ClaimTopicsRegistry;
  let trustedIssuersRegistry: TrustedIssuersRegistry;
  let identityRegistryStorage: IdentityRegistryStorage;
  let identityRegistry: IdentityRegistry;
  let compliance: Compliance;
  let token: ERC3643Token;
  let mockUSDC: MockUSDC;
  let vestingManager: VestingManager;
  let dividendManager: DividendManager;
  let secondaryMarket: SecondaryMarket;
  let realEstateManager: RealEstateSecurityManager;

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
  let platformOperator: HardhatEthersSigner;

  // Here's a complete fix for the deployment function with proper Promise handling

  async function deployRealEstateTokenSystem() {
    console.log("📋 DEPLOYING REAL ESTATE TOKEN SYSTEM");
    console.log("================================================");

    // Get signers
    [deployer, issuer, investor1, investor2, investor3, platformOperator] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`🔑 Using deployer address: ${deployerAddress}`);

    // 1. Deploy ClaimTopicsRegistry
    console.log("🔨 Deploying ClaimTopicsRegistry...");
    const ClaimTopicsRegistryFactory = await ethers.getContractFactory("ClaimTopicsRegistry");
    claimTopicsRegistry = await ClaimTopicsRegistryFactory.connect(deployer).deploy();
    await claimTopicsRegistry.waitForDeployment();
    const claimTopicsRegistryAddress = await claimTopicsRegistry.getAddress();
    console.log(`✅ ClaimTopicsRegistry deployed at: ${claimTopicsRegistryAddress}`);

    // Add KYC claim topic
    await claimTopicsRegistry.addClaimTopic(KYC_CLAIM_TOPIC);
    console.log(`✅ Added KYC claim topic (${KYC_CLAIM_TOPIC}) to ClaimTopicsRegistry`);

    // 2. Deploy TrustedIssuersRegistry
    console.log("🔨 Deploying TrustedIssuersRegistry...");
    const TrustedIssuersRegistryFactory = await ethers.getContractFactory("TrustedIssuersRegistry");
    trustedIssuersRegistry = await TrustedIssuersRegistryFactory.connect(deployer).deploy();
    await trustedIssuersRegistry.waitForDeployment();
    const trustedIssuersRegistryAddress = await trustedIssuersRegistry.getAddress();
    console.log(`✅ TrustedIssuersRegistry deployed at: ${trustedIssuersRegistryAddress}`);

    // 3. Deploy IdentityRegistryStorage
    console.log("🔨 Deploying IdentityRegistryStorage...");
    const IdentityRegistryStorageFactory = await ethers.getContractFactory("IdentityRegistryStorage");
    identityRegistryStorage = await IdentityRegistryStorageFactory.connect(deployer).deploy();
    await identityRegistryStorage.waitForDeployment();
    const identityRegistryStorageAddress = await identityRegistryStorage.getAddress();
    console.log(`✅ IdentityRegistryStorage deployed at: ${identityRegistryStorageAddress}`);

    // 4. Deploy IdentityRegistry
    console.log("🔨 Deploying IdentityRegistry...");
    const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistryFactory.connect(deployer).deploy(
      trustedIssuersRegistryAddress,
      claimTopicsRegistryAddress,
      identityRegistryStorageAddress,
    );
    await identityRegistry.waitForDeployment();
    const identityRegistryAddress = await identityRegistry.getAddress();
    console.log(`✅ IdentityRegistry deployed at: ${identityRegistryAddress}`);

    // Authorize the Identity Registry in the storage
    await identityRegistryStorage.authorizeRegistry(identityRegistryAddress);
    console.log("✅ Authorized IdentityRegistry in IdentityRegistryStorage");

    // 5. Deploy Compliance
    console.log("🔨 Deploying Compliance...");
    const ComplianceFactory = await ethers.getContractFactory("Compliance");
    compliance = await ComplianceFactory.connect(deployer).deploy(identityRegistryAddress);
    await compliance.waitForDeployment();
    const complianceAddress = await compliance.getAddress();
    console.log(`✅ Compliance deployed at: ${complianceAddress}`);

    // 6. Deploy MockUSDC
    console.log("🔨 Deploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.connect(deployer).deploy("Mock USDC", "USDC", STABLECOIN_DECIMALS);
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log(`✅ MockUSDC deployed at: ${mockUSDCAddress}`);

    // Mint 10M MockUSDC to deployer for testing
    const usdcAmount = ethers.parseUnits("10000000", STABLECOIN_DECIMALS);
    await mockUSDC.mint(deployerAddress, usdcAmount);
    console.log(`💰 Minted ${ethers.formatUnits(usdcAmount, STABLECOIN_DECIMALS)} USDC to deployer`);

    // Transfer some USDC to investors for testing secondary market
    const investor2Address = await investor2.getAddress();
    const investor3Address = await investor3.getAddress();
    await mockUSDC.transfer(investor2Address, ethers.parseUnits("100000", STABLECOIN_DECIMALS));
    await mockUSDC.transfer(investor3Address, ethers.parseUnits("100000", STABLECOIN_DECIMALS));
    console.log("💰 Transferred USDC to investors for testing");

    // 7. Deploy ERC3643Token
    console.log("🔨 Deploying ERC3643Token...");
    const tokenName = "Real Estate Token";
    const tokenSymbol = "RET";
    const propertyAddress = "123 Blockchain Blvd, Cryptoville";

    const ERC3643TokenFactory = await ethers.getContractFactory("ERC3643Token");
    token = await ERC3643TokenFactory.connect(deployer).deploy(
      tokenName,
      tokenSymbol,
      identityRegistryAddress,
      complianceAddress,
      propertyAddress,
      PROPERTY_VALUE,
    );
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ ERC3643Token deployed at: ${tokenAddress}`);

    // 8. Deploy VestingManager
    console.log("🔨 Deploying VestingManager...");
    const VestingManagerFactory = await ethers.getContractFactory("VestingManager");
    vestingManager = await VestingManagerFactory.connect(deployer).deploy(
      tokenAddress,
      mockUSDCAddress,
      PROPERTY_VALUE,
    );
    await vestingManager.waitForDeployment();
    const vestingManagerAddress = await vestingManager.getAddress();
    console.log(`✅ VestingManager deployed at: ${vestingManagerAddress}`);

    // 9. Deploy DividendManager
    console.log("🔨 Deploying DividendManager...");
    const DividendManagerFactory = await ethers.getContractFactory("DividendManager");
    dividendManager = await DividendManagerFactory.connect(deployer).deploy(tokenAddress, mockUSDCAddress);
    await dividendManager.waitForDeployment();
    const dividendManagerAddress = await dividendManager.getAddress();
    console.log(`✅ DividendManager deployed at: ${dividendManagerAddress}`);

    // // Set initial dividend rate
    // await dividendManager.connect(deployer).updateDividendRate(DIVIDEND_RATE);
    // console.log(`✅ Set dividend rate to ${DIVIDEND_RATE} basis points (${DIVIDEND_RATE / 100}%)`);

    // 10. Deploy SecondaryMarket
    console.log("🔨 Deploying SecondaryMarket...");
    const SecondaryMarketFactory = await ethers.getContractFactory("SecondaryMarket");
    secondaryMarket = await SecondaryMarketFactory.connect(deployer).deploy(
      tokenAddress,
      mockUSDCAddress,
      vestingManagerAddress,
    );
    await secondaryMarket.waitForDeployment();
    const secondaryMarketAddress = await secondaryMarket.getAddress();
    console.log(`✅ SecondaryMarket deployed at: ${secondaryMarketAddress}`);

    // 11. Deploy RealEstateSecurityManager
    console.log("🔨 Deploying RealEstateSecurityManager...");
    const platformOperatorAddress = await platformOperator.getAddress();
    const RealEstateSecurityManagerFactory = await ethers.getContractFactory("RealEstateSecurityManager");

    // Check DividendManager owner before deployment
    const dividendOwner = await dividendManager.owner();
    console.log(`DividendManager owner: ${dividendOwner}`);
    console.log(`Deployer address: ${deployerAddress}`);

    realEstateManager = await RealEstateSecurityManagerFactory.connect(deployer).deploy(
      tokenAddress,
      mockUSDCAddress,
      dividendManagerAddress,
      vestingManagerAddress,
      secondaryMarketAddress,
      platformOperatorAddress, // Fee recipient
    );
    await realEstateManager.waitForDeployment();
    const realEstateManagerAddress = await realEstateManager.getAddress();
    console.log(`✅ RealEstateSecurityManager deployed at: ${realEstateManagerAddress}`);

    console.log("Transferring DividendManager ownership to RealEstateSecurityManager...");
    await dividendManager.transferOwnership(realEstateManagerAddress);
    console.log("✅ DividendManager ownership transferred");

    // Transfer ownership of Compliance to RealEstateSecurityManager
    console.log("Transferring Compliance ownership to RealEstateSecurityManager...");
    await compliance.transferOwnership(tokenAddress);
    console.log("✅ Compliance ownership transferred");

    console.log("🔨 initializing RealEstateSecurityManager...");
    await realEstateManager.connect(deployer).initialize();
    console.log("✅ RealEstateSecurityManager initialized");

    // 12. Set up permissions and agent roles
    console.log("🔑 Setting up permissions and agent roles...");
    // Add agents to the token
    await token.addAgent(vestingManagerAddress);
    await token.addAgent(realEstateManagerAddress);
    console.log("✅ Added VestingManager and RealEstateManager as agents on the token");

    // Add agents to the identity registry
    await identityRegistry.addAgent(deployerAddress);
    console.log("✅ Added deployer as agent on IdentityRegistry");

    // Deploy mock identity contracts
    console.log("🔨 Deploying mock identity contracts...");
    const MockIdentityFactory = await ethers.getContractFactory("MockIdentity");
    const issuerAddress = await issuer.getAddress();
    const investor1Address = await investor1.getAddress();

    issuerIdentity = await MockIdentityFactory.connect(deployer).deploy(issuerAddress);
    await issuerIdentity.waitForDeployment();
    const issuerIdentityAddress = await issuerIdentity.getAddress();

    investor1Identity = await MockIdentityFactory.connect(deployer).deploy(investor1Address);
    await investor1Identity.waitForDeployment();
    const investor1IdentityAddress = await investor1Identity.getAddress();

    investor2Identity = await MockIdentityFactory.connect(deployer).deploy(investor2Address);
    await investor2Identity.waitForDeployment();
    const investor2IdentityAddress = await investor2Identity.getAddress();

    investor3Identity = await MockIdentityFactory.connect(deployer).deploy(investor3Address);
    await investor3Identity.waitForDeployment();
    const investor3IdentityAddress = await investor3Identity.getAddress();

    console.log("✅ Deployed mock identity contracts for issuer and investors");

    // Add issuer to trusted issuers with KYC claim topic
    await trustedIssuersRegistry.addTrustedIssuer(issuerIdentityAddress, [KYC_CLAIM_TOPIC]);
    console.log(`✅ Added issuer identity (${issuerIdentityAddress}) to trusted issuers registry`);

    // Set up claim signer key in issuer identity
    await issuerIdentity.connect(issuer).addKey(
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [issuerIdentityAddress, KYC_CLAIM_TOPIC]),
      ),
      3, // Purpose: CLAIM
    );
    console.log("✅ Added claim signer key to issuer identity");

    // Fund redemption reserve for testing redemptions
    const redemptionAmount = ethers.parseUnits("500000", STABLECOIN_DECIMALS); // 500k USDC
    await mockUSDC.approve(vestingManagerAddress, redemptionAmount);
    await vestingManager.addToRedemptionReserve(redemptionAmount);
    console.log(`💰 Funded redemption reserve with ${ethers.formatUnits(redemptionAmount, STABLECOIN_DECIMALS)} USDC`);

    const owner = await realEstateManager.owner();
    console.log("Owner of RealEstateSecurityManager:", owner);
    console.log("deployerrrrrrrr:", deployer);
    // Register VestingManager and RealEstateSecurityManager as agents

    const tokenOwner = await token.owner();
    console.log("Token owner:", tokenOwner);
    console.log("RealEstateManager address:", await realEstateManager.getAddress());

    console.log("================================================");
    console.log("✅ REAL ESTATE TOKEN SYSTEM DEPLOYMENT COMPLETE");
    console.log("================================================");

    return {
      claimTopicsRegistry,
      trustedIssuersRegistry,
      identityRegistryStorage,
      identityRegistry,
      compliance,
      token,
      mockUSDC,
      vestingManager,
      dividendManager,
      secondaryMarket,
      realEstateManager,
      issuerIdentity,
      investor1Identity,
      investor2Identity,
      investor3Identity,
      deployer,
      issuer,
      investor1,
      investor2,
      investor3,
      platformOperator,
    };
  }
  // Load fixture before each test
  beforeEach(async function () {
    const fixture = await loadFixture(deployRealEstateTokenSystem);

    // Set all contract instances and signers
    claimTopicsRegistry = fixture.claimTopicsRegistry;
    trustedIssuersRegistry = fixture.trustedIssuersRegistry;
    identityRegistryStorage = fixture.identityRegistryStorage;
    identityRegistry = fixture.identityRegistry;
    compliance = fixture.compliance;
    token = fixture.token;
    mockUSDC = fixture.mockUSDC;
    vestingManager = fixture.vestingManager;
    dividendManager = fixture.dividendManager;
    secondaryMarket = fixture.secondaryMarket;
    realEstateManager = fixture.realEstateManager;
    issuerIdentity = fixture.issuerIdentity;
    investor1Identity = fixture.investor1Identity;
    investor2Identity = fixture.investor2Identity;
    investor3Identity = fixture.investor3Identity;
    deployer = fixture.deployer;
    issuer = fixture.issuer;
    investor1 = fixture.investor1;
    investor2 = fixture.investor2;
    investor3 = fixture.investor3;
    platformOperator = fixture.platformOperator;
  });

  describe("Full Lifecycle Tests", function () {
    it("Should execute the complete real estate token lifecycle", async function () {
      console.log("🧪 STARTING FULL LIFECYCLE TEST");
      console.log("================================================");

      // ==================== INVESTOR ONBOARDING ====================
      console.log("🧪 PHASE 1: INVESTOR ONBOARDING");
      console.log("------------------------------------------------");

      console.log("1️⃣ Adding KYC claims to investor identities");
      // Add KYC claims from trusted issuer to investor identities
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

      console.log("✅ KYC claims added to all investor identities");

      console.log("2️⃣ Registering investor identities in the identity registry");
      // Register investors in the identity registry
      await identityRegistry.registerIdentity(investor1.getAddress(), investor1Identity.getAddress(), COUNTRY_US);

      await identityRegistry.registerIdentity(investor2.getAddress(), investor2Identity.getAddress(), COUNTRY_UK);

      await identityRegistry.registerIdentity(investor3.getAddress(), investor3Identity.getAddress(), COUNTRY_US);

      console.log("✅ All investors registered in identity registry");

      // Verify investors are properly registered and have required claims
      console.log("3️⃣ Verifying investor eligibility");

      expect(await identityRegistry.isVerified(investor1.getAddress())).to.be.true;
      expect(await identityRegistry.isVerified(investor2.getAddress())).to.be.true;
      expect(await identityRegistry.isVerified(investor3.getAddress())).to.be.true;

      console.log("✅ All investors are verified and eligible to hold tokens");
      console.log("------------------------------------------------");

      // ==================== INITIAL TOKEN ISSUANCE ====================
      console.log("🧪 PHASE 2: INITIAL TOKEN ISSUANCE");
      console.log("------------------------------------------------");

      console.log("1️⃣ Minting tokens to investors");

      // Mint tokens to investors using the security manager
      const investor1Amount = ethers.parseEther("400"); // 400 tokens (40% ownership)
      const investor2Amount = ethers.parseEther("300"); // 300 tokens (30% ownership)
      const investor3Amount = ethers.parseEther("300"); // 300 tokens (30% ownership)

      await token.connect(deployer).mint(investor1.getAddress(), investor1Amount);
      await vestingManager.registerInvestment(investor1.getAddress(), investor1Amount);

      await token.connect(deployer).mint(investor2.getAddress(), investor2Amount);
      await vestingManager.registerInvestment(investor2.getAddress(), investor2Amount);

      await token.connect(deployer).mint(investor3.getAddress(), investor3Amount);
      await vestingManager.registerInvestment(investor3.getAddress(), investor3Amount);

      console.log(`💰 Minted ${ethers.formatEther(investor1Amount)} tokens to Investor 1`);
      console.log(`💰 Minted ${ethers.formatEther(investor2Amount)} tokens to Investor 2`);
      console.log(`💰 Minted ${ethers.formatEther(investor3Amount)} tokens to Investor 3`);

      // Verify token balances
      expect(await token.balanceOf(investor1.getAddress())).to.equal(investor1Amount);
      expect(await token.balanceOf(investor2.getAddress())).to.equal(investor2Amount);
      expect(await token.balanceOf(investor3.getAddress())).to.equal(investor3Amount);

      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(investor1Amount + investor2Amount + investor3Amount);

      console.log("✅ Token minting verified with correct balances");

      // Verify that investments are properly registered in vesting manager
      const investor1Status = await vestingManager.getRedemptionStatus(investor1.getAddress());
      expect(investor1Status.canRedeemEarly).to.be.false;
      expect(investor1Status.canRedeemFully).to.be.false;

      console.log("✅ Investments correctly registered in vesting manager with lockup periods");
      console.log("------------------------------------------------");

      // ==================== DIVIDEND DISTRIBUTION - YEAR 1 ====================
      console.log("🧪 PHASE 3: YEAR 1 DIVIDEND DISTRIBUTION");
      console.log("------------------------------------------------");

      // Advance time by 1 year
      console.log("1️⃣ Advancing time by 1 year");
      await time.increase(SECONDS_IN_YEAR);
      console.log("⏱️ Time advanced by 1 year");

      // Calculate and distribute dividends
      console.log("2️⃣ Calculating and distributing dividends");
      const totalTokenSupply = await token.totalSupply();
      const expectedAnnualDividend = (totalTokenSupply * BigInt(DIVIDEND_RATE)) / BigInt(BASIS_POINTS_DENOMINATOR);
      console.log(
        `💰 Expected annual dividend: ${ethers.formatEther(expectedAnnualDividend)} tokens (${DIVIDEND_RATE / 100}% of total supply)`,
      );

      // Convert to USDC amount (6 decimals)
      const dividendAmountUSDC = ethers.parseUnits(ethers.formatEther(expectedAnnualDividend), STABLECOIN_DECIMALS);

      // Approve and distribute dividends
      await mockUSDC.approve(realEstateManager.getAddress(), dividendAmountUSDC);
      await realEstateManager.distributeDividends(dividendAmountUSDC);

      console.log(`💰 Distributed ${ethers.formatUnits(dividendAmountUSDC, STABLECOIN_DECIMALS)} USDC as dividends`);

      // Investors claim their dividends
      console.log("3️⃣ Investors claiming dividends");

      // Calculate expected dividends per investor
      const investor1Share = (investor1Amount * dividendAmountUSDC) / totalTokenSupply;
      const investor2Share = (investor2Amount * dividendAmountUSDC) / totalTokenSupply;
      const investor3Share = (investor3Amount * dividendAmountUSDC) / totalTokenSupply;

      // Record initial USDC balances
      const investor1InitialUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      const investor2InitialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const investor3InitialUSDC = await mockUSDC.balanceOf(investor3.getAddress());

      // Claim dividends
      await dividendManager.connect(investor1).claimDividend(1); // Distribution ID 1
      await dividendManager.connect(investor2).claimDividend(1);
      await dividendManager.connect(investor3).claimDividend(1);

      // Verify dividend amounts received
      const investor1FinalUSDC = await mockUSDC.balanceOf(investor1.getAddress());
      const investor2FinalUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const investor3FinalUSDC = await mockUSDC.balanceOf(investor3.getAddress());

      expect(investor1FinalUSDC - investor1InitialUSDC).to.equal(investor1Share);
      expect(investor2FinalUSDC - investor2InitialUSDC).to.equal(investor2Share);
      expect(investor3FinalUSDC - investor3InitialUSDC).to.equal(investor3Share);

      console.log(`💰 Investor 1 claimed ${ethers.formatUnits(investor1Share, STABLECOIN_DECIMALS)} USDC`);
      console.log(`💰 Investor 2 claimed ${ethers.formatUnits(investor2Share, STABLECOIN_DECIMALS)} USDC`);
      console.log(`💰 Investor 3 claimed ${ethers.formatUnits(investor3Share, STABLECOIN_DECIMALS)} USDC`);
      console.log("✅ All dividends claimed and verified");
      console.log("------------------------------------------------");

      // ==================== COMPLIANCE RESTRICTIONS TEST ====================
      console.log("🧪 PHASE 4: COMPLIANCE RESTRICTIONS TEST");
      console.log("------------------------------------------------");

      console.log("1️⃣ Testing country restrictions");

      console.log("🧪 PHASE 4: COMPLIANCE RESTRICTIONS TEST");
      console.log("------------------------------------------------");

      console.log("1️⃣ Testing country restrictions");

      // Use Hardhat's setBalance function instead of trying to send ETH
      const tokenAddress = await token.getAddress();
      await ethers.provider.send("hardhat_setBalance", [tokenAddress, "0x" + ethers.parseEther("1.0").toString(16)]);

      // Impersonate the token contract
      const tokenSigner = await ethers.getImpersonatedSigner(tokenAddress);

      // Transfer ownership of compliance back to the deployer
      await compliance.connect(tokenSigner).transferOwnership(deployer.getAddress());
      console.log("✅ Compliance ownership transferred back to deployer");

      // Block US country
      await compliance.blockCountry(COUNTRY_US);
      console.log("🚫 Blocked US country (code: 840)");

      // Try to transfer tokens from investor2 (UK) to investor1 (US)
      await expect(
        token.connect(investor2).transfer(investor1.getAddress(), ethers.parseEther("10")),
      ).to.be.revertedWith("ERC3643Token: Transfer not compliant");

      console.log("✅ Transfer from UK to US investor correctly blocked");

      // Unblock US country
      await compliance.unblockCountry(COUNTRY_US);
      console.log("✅ Unblocked US country");

      // Transfer should now succeed
      await token.connect(investor2).transfer(investor1.getAddress(), ethers.parseEther("10"));
      console.log("✅ Transfer successful after unblocking country");

      // Transfer tokens back to restore original balances
      await token.connect(investor1).transfer(investor2.getAddress(), ethers.parseEther("10"));
      console.log("✅ Transferred tokens back to restore balances");
      console.log("------------------------------------------------");

      // ==================== EARLY REDEMPTION ATTEMPT (SHOULD FAIL) ====================
      console.log("🧪 PHASE 5: EARLY REDEMPTION ATTEMPT (YEAR 2)");
      console.log("------------------------------------------------");

      // Advance time by another year (total: 2 years)
      console.log("1️⃣ Advancing time by another year (total: 2 years)");
      await time.increase(SECONDS_IN_YEAR);
      console.log("⏱️ Time advanced to 2 years after investment");

      // Try early redemption - should fail as it's before 5 years
      console.log("2️⃣ Attempting early redemption (should fail)");

      const redeemAmount = ethers.parseEther("100");

      await expect(vestingManager.connect(investor1).redeemTokens(redeemAmount)).to.be.revertedWith(
        "Vesting period not reached",
      );

      console.log("✅ Early redemption correctly rejected before 5-year mark");
      console.log("------------------------------------------------");

      // ==================== ADVANCE TO 5 YEARS - EARLY REDEMPTION PERIOD ====================
      console.log("🧪 PHASE 6: EARLY REDEMPTION PERIOD (YEAR 5)");
      console.log("------------------------------------------------");

      // Advance time to 5 years
      console.log("1️⃣ Advancing time to 5 years after investment");
      await time.increase(3 * SECONDS_IN_YEAR); // Already at 2 years, adding 3 more
      console.log("⏱️ Time advanced to 5 years after investment");

      // Check redemption status
      console.log("2️⃣ Checking redemption status");
      const status5Years = await vestingManager.getRedemptionStatus(investor1.getAddress());
      expect(status5Years.canRedeemEarly).to.be.true;
      expect(status5Years.canRedeemFully).to.be.false;
      console.log("✅ Early redemption status correctly shows eligible for early redemption");

      // Calculate token values and expected penalties
      console.log("3️⃣ Early redemption with penalty");
      const earlyRedeemAmount = ethers.parseEther("50");

      const reserveBalance = await mockUSDC.balanceOf(vestingManager.getAddress());
      console.log(`Current redemption reserve: ${ethers.formatUnits(reserveBalance, STABLECOIN_DECIMALS)} USDC`);

      // ADD THESE NEW LOGGING STATEMENTS
      const propertyValueInContract = await vestingManager.propertyValue();
      console.log(`Property value in contract: ${ethers.formatEther(propertyValueInContract)}`);
      console.log(`Property value in test: ${ethers.formatEther(BigInt(PROPERTY_VALUE))}`);

      const redemptionReserve = await vestingManager.redemptionReserve();
      console.log(
        `Redemption reserve state variable: ${ethers.formatUnits(redemptionReserve, STABLECOIN_DECIMALS)} USDC`,
      );

      // The early redemption penalty is typically 10% (1000 basis points)
      const penaltyRate = 1000; // 10%

      // Calculate expected redemption value
      const currentTotalSupply = await token.totalSupply();
      console.log(`Current total supply: ${ethers.formatEther(currentTotalSupply)}`);

      const tokenValueInStablecoin = (PROPERTY_VALUE * earlyRedeemAmount) / currentTotalSupply;
      console.log(`Expected token value in stablecoin: ${ethers.formatUnits(tokenValueInStablecoin, 18)}`);

      // Apply early redemption penalty
      const penalty = (tokenValueInStablecoin * BigInt(penaltyRate)) / BigInt(BASIS_POINTS_DENOMINATOR);
      const expectedRedemptionValue = tokenValueInStablecoin - penalty;
      console.log(`Expected redemption value after penalty: ${ethers.formatUnits(expectedRedemptionValue, 18)}`);

      // Convert to USDC amount (6 decimals)
      const expectedRedemptionUSDC = ethers.parseUnits(
        ethers.formatEther(expectedRedemptionValue),
        STABLECOIN_DECIMALS,
      );
      console.log(
        `Expected redemption USDC (with USDC decimals): ${ethers.formatUnits(expectedRedemptionUSDC, STABLECOIN_DECIMALS)}`,
      );

      // Record initial balances
      const initialTokenBalance = await token.balanceOf(investor1.getAddress());
      const initialUSDCBalance = await mockUSDC.balanceOf(investor1.getAddress());

      // Approve token transfer to vesting manager
      await token.connect(investor1).approve(vestingManager.getAddress(), earlyRedeemAmount);

      // Redeem tokens
      await vestingManager.connect(investor1).redeemTokens(earlyRedeemAmount);
      // Verify balances after redemption
      const finalTokenBalance = await token.balanceOf(investor1.getAddress());
      const finalUSDCBalance = await mockUSDC.balanceOf(investor1.getAddress());

      expect(initialTokenBalance - finalTokenBalance).to.equal(earlyRedeemAmount);
      expect(finalUSDCBalance - initialUSDCBalance).to.be.closeTo(
        expectedRedemptionUSDC,
        ethers.parseUnits("1", STABLECOIN_DECIMALS), // Allow for small rounding differences
      );

      console.log(`💰 Investor 1 redeemed ${ethers.formatEther(earlyRedeemAmount)} tokens`);
      console.log(
        `💰 Received ${ethers.formatUnits(finalUSDCBalance - initialUSDCBalance, STABLECOIN_DECIMALS)} USDC after penalty`,
      );
      console.log("✅ Early redemption with penalty verified");
      console.log("------------------------------------------------");

      // ==================== SECONDARY MARKET TRADING ====================
      console.log("🧪 PHASE 7: SECONDARY MARKET TRADING");
      console.log("------------------------------------------------");

      console.log("1️⃣ Investor 2 creating sell order");
      const sellAmount = ethers.parseEther("100");
      const pricePerToken = ethers.parseUnits("1200", STABLECOIN_DECIMALS); // 1,200 USDC per token

      // Approve tokens for secondary market
      await token.connect(investor2).approve(secondaryMarket.getAddress(), sellAmount);

      // Create sell order
      await secondaryMarket.connect(investor2).createSellOrder(sellAmount, pricePerToken);
      console.log(
        `📊 Sell order created for ${ethers.formatEther(sellAmount)} tokens at ${ethers.formatUnits(pricePerToken, STABLECOIN_DECIMALS)} USDC per token`,
      );

      // Verify sell order
      const orderId = 1; // First order has ID 1
      const orderDetails = await secondaryMarket.getSellOrder(orderId);

      expect(orderDetails.seller).to.equal(await investor2.getAddress());
      expect(orderDetails.tokenAmount).to.equal(sellAmount);
      expect(orderDetails.pricePerToken).to.equal(pricePerToken);
      expect(orderDetails.active).to.be.true;

      console.log("✅ Sell order verification successful");

      console.log("2️⃣ Investor 3 purchasing tokens from secondary market");
      // Calculate total price for the purchase
      const purchaseAmount = ethers.parseEther("50"); // Buy half of the sell order
      const totalPrice = (purchaseAmount * pricePerToken) / ethers.parseEther("1");

      // Platform fee (0.5% = 50 basis points)
      const platformFee = 50;
      const platformFeeAmount = (totalPrice * BigInt(platformFee)) / BigInt(BASIS_POINTS_DENOMINATOR);
      const sellerAmount = totalPrice - platformFeeAmount;

      // Record initial balances
      const seller_initialUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const seller_initialTokens = await token.balanceOf(investor2.getAddress());
      const buyer_initialUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      const buyer_initialTokens = await token.balanceOf(investor3.getAddress());
      const platform_initialFees = await secondaryMarket.totalFeesCollected();

      // Approve USDC for purchase
      await mockUSDC.connect(investor3).approve(await secondaryMarket.getAddress(), totalPrice);

      // Purchase tokens
      await secondaryMarket.connect(investor3).purchaseTokens(orderId, purchaseAmount);

      // Verify balances after purchase
      const seller_finalUSDC = await mockUSDC.balanceOf(investor2.getAddress());
      const buyer_finalUSDC = await mockUSDC.balanceOf(investor3.getAddress());
      const buyer_finalTokens = await token.balanceOf(investor3.getAddress());
      const platform_finalFees = await secondaryMarket.totalFeesCollected();

      // Seller receives payment minus fees
      expect(seller_finalUSDC - seller_initialUSDC).to.equal(sellerAmount);
      // Buyer pays full price
      expect(buyer_initialUSDC - buyer_finalUSDC).to.equal(totalPrice);
      // Buyer receives tokens
      expect(buyer_finalTokens - buyer_initialTokens).to.equal(purchaseAmount);
      // Platform collects fee
      expect(platform_finalFees - platform_initialFees).to.equal(platformFeeAmount);

      console.log(
        `💰 Investor 3 purchased ${ethers.formatEther(purchaseAmount)} tokens for ${ethers.formatUnits(totalPrice, STABLECOIN_DECIMALS)} USDC`,
      );
      console.log(
        `💰 Investor 2 received ${ethers.formatUnits(sellerAmount, STABLECOIN_DECIMALS)} USDC (after platform fee)`,
      );
      console.log(`💰 Platform collected ${ethers.formatUnits(platformFeeAmount, STABLECOIN_DECIMALS)} USDC in fees`);

      console.log("3️⃣ Investor 2 cancelling remaining sell order");
      // Cancel the remaining sell order
      await secondaryMarket.connect(investor2).cancelSellOrder(orderId);

      // Verify order is cancelled
      const updatedOrderDetails = await secondaryMarket.getSellOrder(orderId);
      expect(updatedOrderDetails.active).to.be.false;

      // Verify remaining tokens returned to seller
      const expectedRemainingTokens = sellAmount - purchaseAmount;
      const seller_finalTokens = await token.balanceOf(investor2.getAddress());
      expect(seller_finalTokens - (seller_initialTokens - sellAmount)).to.equal(expectedRemainingTokens);

      console.log(
        `✅ Sell order cancelled and ${ethers.formatEther(expectedRemainingTokens)} remaining tokens returned to seller`,
      );
      console.log("------------------------------------------------");

      // ==================== ADVANCE TO 7 YEARS - FULL REDEMPTION ====================
      console.log("🧪 PHASE 8: FULL REDEMPTION PERIOD (YEAR 7)");
      console.log("------------------------------------------------");

      // Advance time to 7 years
      console.log("1️⃣ Advancing time to 7 years after investment");
      await time.increase(2 * SECONDS_IN_YEAR); // Already at 5 years, adding 2 more
      console.log("⏱️ Time advanced to 7 years after investment");

      // Check redemption status
      console.log("2️⃣ Checking redemption status");
      const status7Years = await vestingManager.getRedemptionStatus(investor3.getAddress());
      expect(status7Years.canRedeemEarly).to.be.true;
      expect(status7Years.canRedeemFully).to.be.true;
      console.log("✅ Redemption status correctly shows eligible for full redemption");

      // Calculate token values for full redemption
      // Calculate token values for full redemption
      console.log("3️⃣ Full redemption without penalty");
      const fullRedeemAmount = await token.balanceOf(investor3.getAddress());

      // Get the CURRENT total supply right before redemption
      const currentTotalSupplyBeforeRedemption = await token.totalSupply();
      console.log("Current total supply before redemption:", ethers.formatEther(currentTotalSupplyBeforeRedemption));

      // Calculate expected redemption value with current supply
      const fullTokenValueInStablecoin = (PROPERTY_VALUE * fullRedeemAmount) / currentTotalSupplyBeforeRedemption;

      const truncatedValueInEther = ethers.formatUnits(fullTokenValueInStablecoin, 18).split(".")[0];

      // Convert to USDC amount (6 decimals)
      const expectedFullRedemptionUSDC = ethers.parseUnits(truncatedValueInEther, STABLECOIN_DECIMALS);

      // Record initial balances
      const investor3_initialTokenBalance = await token.balanceOf(investor3.getAddress());
      const investor3_initialUSDCBalance = await mockUSDC.balanceOf(investor3.getAddress());

      // Approve token transfer to vesting manager
      await token.connect(investor3).approve(vestingManager.getAddress(), fullRedeemAmount);
      await compliance.transferOwnership(token);
      console.log("✅ Compliance ownership transferred");

      // Redeem tokens
      await vestingManager.connect(investor3).redeemTokens(fullRedeemAmount);

      // Verify balances after redemption
      const investor3_finalTokenBalance = await token.balanceOf(investor3.getAddress());
      const investor3_finalUSDCBalance = await mockUSDC.balanceOf(investor3.getAddress());

      expect(investor3_initialTokenBalance - investor3_finalTokenBalance).to.equal(fullRedeemAmount);
      expect(investor3_finalUSDCBalance - investor3_initialUSDCBalance).to.be.closeTo(
        expectedFullRedemptionUSDC,
        ethers.parseUnits("1", STABLECOIN_DECIMALS), // Allow for small rounding differences
      );

      console.log(`💰 Investor 3 redeemed ${ethers.formatEther(fullRedeemAmount)} tokens`);
      console.log(
        `💰 Received ${ethers.formatUnits(investor3_finalUSDCBalance - investor3_initialUSDCBalance, STABLECOIN_DECIMALS)} USDC (no penalty)`,
      );
      console.log("✅ Full redemption without penalty verified");
      console.log("------------------------------------------------");

      // ==================== PLATFORM MANAGEMENT FUNCTIONS ====================
      console.log("🧪 PHASE 9: PLATFORM MANAGEMENT FUNCTIONS");
      console.log("------------------------------------------------");

      console.log("1️⃣ Testing withdrawal of platform fees");
      // Record initial balances
      const recipient_initialUSDC = await mockUSDC.balanceOf(platformOperator.getAddress());
      const platform_currentFees = await secondaryMarket.totalFeesCollected();

      // Withdraw fees
      await secondaryMarket.connect(deployer).withdrawFees(platformOperator.getAddress());

      // Verify balances after withdrawal
      const recipient_finalUSDC = await mockUSDC.balanceOf(platformOperator.getAddress());
      const platform_finalFeesAfterWithdrawal = await secondaryMarket.totalFeesCollected();

      expect(recipient_finalUSDC - recipient_initialUSDC).to.equal(platform_currentFees);
      expect(platform_finalFeesAfterWithdrawal).to.equal(0);

      console.log(
        `💰 Platform fees (${ethers.formatUnits(platform_currentFees, STABLECOIN_DECIMALS)} USDC) successfully withdrawn to platform operator`,
      );

      console.log("2️⃣ Testing parameter updates");
      // Update dividend rate
      const newDividendRate = 600; // 6%
      console.log("👑 Current ownerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:", await dividendManager.owner());

      await realEstateManager.updateDividendRate(newDividendRate);
      expect(await dividendManager.dividendRate()).to.equal(newDividendRate);
      console.log(`✅ Dividend rate updated to ${newDividendRate} basis points (${newDividendRate / 100}%)`);

      // Update platform fee
      const newPlatformFee = 100; // 1%
      await secondaryMarket.updatePlatformFee(newPlatformFee);
      expect(await secondaryMarket.platformFee()).to.equal(newPlatformFee);
      console.log(`✅ Platform fee updated to ${newPlatformFee} basis points (${newPlatformFee / 100}%)`);

      // Update early redemption penalty
      const newPenaltyRate = 500; // 5%
      await vestingManager.updateEarlyRedemptionPenalty(newPenaltyRate);
      expect(await vestingManager.earlyRedemptionPenalty()).to.equal(newPenaltyRate);
      console.log(`✅ Early redemption penalty updated to ${newPenaltyRate} basis points (${newPenaltyRate / 100}%)`);
      console.log("------------------------------------------------");

      // ==================== TOKEN RECOVERY FUNCTION ====================
      console.log("🧪 PHASE 10: TOKEN RECOVERY FUNCTION");
      console.log("------------------------------------------------");

      console.log("1️⃣ Testing token recovery for lost wallet");

// Assume investor1 lost access to their wallet and needs recovery to a new wallet
const newWallet = ethers.Wallet.createRandom().connect(ethers.provider);

// Get initial investor1 token balance
const investor1Address = await investor1.getAddress(); // Await the Promise
const lostWalletBalance = await token.balanceOf(investor1Address);
console.log(`💰 Lost wallet has ${ethers.formatEther(lostWalletBalance)} tokens`);

// Get the new wallet address
const newWalletAddress = await newWallet.getAddress(); // Await the Promise

// Register new wallet in identity registry
await investor1Identity.connect(investor1).addKey(
  ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address"], [newWalletAddress])),
  1, // Purpose: MANAGEMENT
);

const investor1IdentityAddress = await investor1Identity.getAddress(); // Await the Promise
await identityRegistry.registerIdentity(
  newWalletAddress,
  investor1IdentityAddress, // Same identity contract as the old wallet
  COUNTRY_US,
);
console.log("✅ New wallet registered in identity registry");

// Recover tokens
await token.connect(deployer).recoveryAddress(investor1Address, newWalletAddress);

// Verify token balances after recovery
const oldWalletBalance = await token.balanceOf(investor1Address);
const newWalletBalance = await token.balanceOf(newWalletAddress);

expect(oldWalletBalance).to.equal(0);
expect(newWalletBalance).to.equal(lostWalletBalance);

console.log(`💰 Successfully recovered ${ethers.formatEther(newWalletBalance)} tokens to new wallet`);
console.log("✅ Token recovery function verified");
console.log("------------------------------------------------");

      // ==================== FINAL PROPERTY STATE VERIFICATION ====================
      console.log("🧪 PHASE 12: FINAL PROPERTY STATE VERIFICATION");
      console.log("------------------------------------------------");

      // Calculate and display final property state
      const finalTotalSupply = await token.totalSupply();
      const totalRedeemed = PROPERTY_VALUE - finalTotalSupply;
      const percentageRedeemed = (totalRedeemed * 100n) / PROPERTY_VALUE;

      console.log(`📊 Initial property value: ${ethers.formatEther(PROPERTY_VALUE)} tokens`);
      console.log(`📊 Current total supply: ${ethers.formatEther(finalTotalSupply)} tokens`);
      console.log(
        `📊 Total redeemed: ${ethers.formatEther(totalRedeemed)} tokens (${percentageRedeemed.toString()}% of property)`,
      );

      // Display investor positions
      console.log("📊 Final investor positions:");
      const investor1FinalBalance = await token.balanceOf(investor1.getAddress());
      const investor2FinalBalance = await token.balanceOf(investor2.getAddress());
      const investor3FinalBalance = await token.balanceOf(investor3.getAddress());
      const newWalletFinalBalance = await token.balanceOf(newWallet.getAddress());

      console.log(
        `📊 Investor 1: ${ethers.formatEther(investor1FinalBalance)} tokens (${(investor1FinalBalance * 100n) / finalTotalSupply}% ownership)`,
      );
      console.log(
        `📊 Investor 2: ${ethers.formatEther(investor2FinalBalance)} tokens (${(investor2FinalBalance * 100n) / finalTotalSupply}% ownership)`,
      );
      console.log(
        `📊 Investor 3: ${ethers.formatEther(investor3FinalBalance)} tokens (${(investor3FinalBalance * 100n) / finalTotalSupply}% ownership)`,
      );
      console.log(
        `📊 Recovered wallet: ${ethers.formatEther(newWalletFinalBalance)} tokens (${(newWalletFinalBalance * 100n) / finalTotalSupply}% ownership)`,
      );
      console.log("================================================");

      console.log("✅ REAL ESTATE TOKEN LIFECYCLE TEST COMPLETED SUCCESSFULLY");
      console.log("================================================");
    });
  });
});
