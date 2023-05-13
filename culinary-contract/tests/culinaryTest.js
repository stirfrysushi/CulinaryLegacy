const Culinary = artifacts.require('../contracts/Culinary.sol')
const truffleAssert = require('truffle-assertions');


contract('Culinary', function (accounts) {
    let culinary
    
    // initialization 
    beforeEach('Setup Culinary Contract', async function () {
      culinary = await Culinary.new();
      console.log('done');
    });

    // example test 
    describe('Initialization', async ()=>{
      it('Success on initialization to bidding phase.', async function () {
        let count = await culinary.recipeCounts();
        assert.equal(count, 0);
      });
    });
}

// REMEMBER -> npm i 
// THEN     -> truffle test
