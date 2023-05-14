const culinary = artifacts.require("CulinaryLegacyRecipe");

module.exports = function(deployer) {
  deployer.deploy(culinary);
};