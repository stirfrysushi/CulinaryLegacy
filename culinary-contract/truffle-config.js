const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "0661998c22d242819a3132bcc27b640b";
const mnemonic = "catch humble correct other version cotton teach banner advance cluster pass jazz" ; // Seed phrase

module.exports = {
  networks: {
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraKey}`),
      from: "0x9350dc8F330190d89f74de744765bb950428FF97",
      network_id: 5, // Goerli's network ID
      gas: 5500000,
    },

    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },

  compilers: {
    solc: {
       version: "0.5.8"
    }
  }
};