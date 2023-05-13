const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations, {
    from: "0x9350dc8F330190d89f74de744765bb950428FF97",
    gas: "1000000",
    gasPrice: "9000000000",
  });
};
