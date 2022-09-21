// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  console.log('Deployer address: ' + (await accounts[0].getAddress()));

  console.log('Deploy the RMRKEquippableFactory contract')
  const RMRKEquippableFactory = await ethers.getContractFactory('RMRKEquippableFactory');
  const rmrkEquippableFactory = await RMRKEquippableFactory.deploy();
  await rmrkEquippableFactory .deployed();
  console.log('RMRK Equippable Factory deployed to:', rmrkEquippableFactory.address);

  console.log('Deploy the RMRKMultiResourceFactory contract')
  const RMRKMultiResourceFactory = await ethers.getContractFactory('RMRKMultiResourceFactory');
  const rmrkMultiResourceFactory = await RMRKMultiResourceFactory.deploy();
  await rmrkMultiResourceFactory.deployed();
  console.log('RMRK Multi Resource Factory deployed to:', rmrkMultiResourceFactory.address);

  console.log('Deploy the RMRKNestingFactory contract to deploy')
  const RMRKNestingFactory = await ethers.getContractFactory('RMRKNestingFactory');
  const rmrkNestingFactory = await RMRKNestingFactory.deploy();
  await rmrkNestingFactory.deployed();
  console.log('RMRK Multi Resource Factory deployed to:', rmrkNestingFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
