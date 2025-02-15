import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the ERC1400RealEstate contract using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployERC1400RealEstate: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying ERC1400RealEstate contract with deployer:", deployer);

  await deploy("ERC1400RealEstate", {
    from: deployer,
    // Contract constructor arguments (modify these as needed for your contract)
    args: [],
    log: true,
    autoMine: true, // Faster deployment on localhost
  });

  // Get the deployed contract instance
  const erc1400RealEstate = await hre.ethers.getContract<Contract>("ERC1400RealEstate", deployer);
  console.log("✅ ERC1400RealEstate deployed at:", erc1400RealEstate.address);
};

export default deployERC1400RealEstate;

deployERC1400RealEstate.tags = ["ERC1400RealEstate"];
