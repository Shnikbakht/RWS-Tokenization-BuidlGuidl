# ERC-3643 Real Estate Tokenization Platform

This project implements the ERC-3643 token standard (formerly known as T-REX) for tokenizing real estate assets as fractionalized security tokens. The implementation is non-upgradeable and uses OpenZeppelin base contracts where applicable.

## Features

- **Compliant Transfers**: Ensures all token transfers adhere to regulatory requirements
- **Identity Verification**: Uses on-chain identities linked to wallets for KYC/AML compliance
- **Fractionalization**: Splits real estate properties into fractional shares (1000 shares per property)
- **Token Recovery**: Allows the recovery of tokens if a wallet is lost
- **Freezing Mechanism**: Supports freezing portions of token balances
- **Forced Transfers**: Enables authorities to force transfers when legally required

## Project Structure

The project consists of the following smart contracts:

1. **IdentityRegistry.sol**: Manages the association between wallet addresses and on-chain identities
2. **IdentityRegistryStorage.sol**: Stores identity data, separating storage from logic
3. **TrustedIssuersRegistry.sol**: Manages the list of trusted claim issuers
4. **ClaimTopicsRegistry.sol**: Manages the required claim topics for token holders
5. **Compliance.sol**: Enforces compliance rules for token transfers
6. **ERC3643Token.sol**: The main token contract with fractionalization logic

## Deployment Order

The contracts should be deployed in the following order:

1. ClaimTopicsRegistry
2. TrustedIssuersRegistry
3. IdentityRegistryStorage
4. IdentityRegistry (requires addresses of TrustedIssuersRegistry, ClaimTopicsRegistry, and IdentityRegistryStorage)
5. Compliance (requires address of IdentityRegistry)
6. ERC3643Token (requires addresses of IdentityRegistry and Compliance)

## Prerequisites

- Node.js (v14 or later)
- NPM or Yarn
- Hardhat development environment

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd erc3643-real-estate-tokenization

# Install dependencies
npm install
```

## Deployment

The project uses hardhat-deploy for deployment management.

```bash
# Deploy to local network
npx hardhat deploy --tags ERC3643 --network localhost

# Deploy to a specific network (e.g., Polygon)
npx hardhat deploy --tags ERC3643 --network polygon
```

## Testing

```bash
# Run tests
npx hardhat test

# Run a specific test file
npx hardhat test test/test-erc3643.ts
```

## Local Development

```bash
# Start a local Hardhat node
npx har# ERC-3643 Real Estate Tokenization Platform

This project implements the ERC-3643 token standard (formerly known as T-REX) for tokenizing real estate assets as fractionalized security tokens.

## Features

- **Compliant Transfers**: Ensures all token transfers adhere to regulatory requirements.
- **Identity Verification**: Uses on-chain identities linked to wallets for KYC/AML compliance.
- **Fractionalization**: Splits real estate properties into fractional shares (1000 shares per property).
- **Token Recovery**: Allows the recovery of tokens if a wallet is lost.
- **Freezing Mechanism**: Supports freezing portions of token balances.
- **Forced Transfers**: Enables authorities to force transfers when legally required.

## Project Structure

The project consists of the following smart contracts:

1. **IdentityRegistry.sol**: Manages the association between wallet addresses and on-chain identities.
2. **TrustedIssuersRegistry.sol**: Manages the list of trusted claim issuers.
3. **ClaimTopicsRegistry.sol**: Manages the required claim topics for token holders.
4. **Compliance.sol**: Enforces compliance rules for token transfers.
5. **ERC3643Token.sol**: The main token contract with fractionalization logic.

## Prerequisites

- Node.js (v14 or later)
- NPM or Yarn
- Hardhat development environment

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd erc3643-real-estate-tokenization

# Install dependencies
npm install
```

## Deployment

The contracts should be deployed in the following order:

1. ClaimTopicsRegistry
2. TrustedIssuersRegistry
3. IdentityRegistry
4. Compliance
5. ERC3643Token

A deployment script is provided in `scripts/deploy.js`:

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to a specific network (e.g., Polygon)
npx hardhat run scripts/deploy.js --network polygon
```

## Testing

```bash
# Run tests
npx hardhat test

# Run a specific test file
npx hardhat test test/test-erc3643.js
```

## Local Development

```bash
# Start a local Hardhat node
npx hardhat node

# Deploy to local node
npx hardhat run scripts/deploy.js --network localhost
```

## Usage Example

1. Deploy the ERC-3643 token system
2. Create on-chain identities for investors
3. Register trusted claim issuers
4. Add required claim topics
5. Issue claims to investor identities
6. Register investor identities in the registry
7. Mint tokens to verified investors
8. Investors can now transfer tokens between each other, subject to compliance checks

## Configuration

Modify the property details and compliance rules in the deployment script according to your specific requirements.

## License

MIT

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.