const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BROskiToken...");
  const BROskiToken = await hre.ethers.getContractFactory("BROskiToken");
  const broskiToken = await BROskiToken.deploy();
  await broskiToken.deployed();
  console.log("✅ BROskiToken deployed to:", broskiToken.address);

  console.log("\n🚀 Deploying FeatureGate...");
  const FeatureGate = await hre.ethers.getContractFactory("FeatureGate");
  const featureGate = await FeatureGate.deploy(broskiToken.address);
  await featureGate.deployed();
  console.log("✅ FeatureGate deployed to:", featureGate.address);

  // Make FeatureGate a minter
  console.log("\n🔧 Setting up roles...");
  await broskiToken.addMinter(featureGate.address);
  console.log("✅ FeatureGate set as minter");

  // Add some initial features
  console.log("\n📝 Adding initial features...");
  await featureGate.addFeature("Premium Editor", ethers.utils.parseEther("1000"));
  await featureGate.addFeature("AI Code Completion", ethers.utils.parseEther("5000"));
  await featureGate.addFeature("Deployment Tools", ethers.utils.parseEther("10000"));
  console.log("✅ Added initial features");

  console.log("\n✨ Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log(`BROskiToken: ${broskiToken.address}`);
  console.log(`FeatureGate: ${featureGate.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
