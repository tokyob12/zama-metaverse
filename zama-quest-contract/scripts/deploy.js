const hre = require("hardhat");

async function main() {
  console.log("Deploying ScoreVerifier...");

  const ScoreVerifier = await hre.ethers.getContractFactory("ScoreVerifier");
  const contract = await ScoreVerifier.deploy();

  await contract.waitForDeployment();

  console.log("ScoreVerifier deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
