const Culinary = artifacts.require('../contracts/CulinaryLegacyRecipe.sol')
const truffleAssert = require('truffle-assertions');


contract('Culinary', function (accounts) {
    let culinary
    let contractOwner = accounts[0]
    let user1 = accounts[1]; 
    let user2 = accounts[2];
    
    // initialization 
    beforeEach('Setup Culinary Contract', async function () {
      // deploy a new contract using .new() function 
      culinary = await Culinary.new();
      console.log('A new contract is deployed'); 
    });

    // test for first deployed contract
    describe('Initialization', async () =>{
      it('Success on initialization to new deployed contract.', async function () {
        // testing state variable of contract 
        let count = await culinary.recipeCounts();
        assert.equal(count, 0);
      });

      it('Success on initializing contract owner', async function () {
        // testing owner 
        let owner_address = await culinary.contractOwner();
        assert.equal(owner_address, contractOwner); 
      });
    });

    // test for registered user 
    describe('User Testing', async() => {

      it('Success on registering users', async function() {
        // testing balance after registered
        culinary.register({ from: accounts[1]});
        let balance = await culinary.balanceOf({from: user1}); 
        assert.equal(balance, 0); 
      }); 

      // testing registered user adding recipe
      it('Success on adding recipe + increased balance', async function() {
        await culinary.addRecipe(accounts[1], 10, {from: user1});
        let new_balance = await culinary.balanceOf({from: user1}); 
        assert.equal(new_balance,1); 
        
        let current_recipeCounts = await culinary.recipeCounts();
        assert.equal(current_recipeCounts,1); 
        
      });

      // testing request recipes from other users 
      it('Success on requesting recipe', async function() {
        // requesting newly added recipe (id = 0) from user1
        await culinary.request(0, user1, {from: user2});
        await culinary.response(user1, user2, 0, {from:user1}); 

        let balance_user2 = culinary.balaneOf({from:user2}); 
        let balance_user1 = culinary.balanceOf({from:user1}); 
        
        // assert balance of user1 and user2
        assert.equal(balance_user1,0);
        assert.equal(balance_user2,1);
      }); 

    });
})

// REMEMBER -> npm i 
// THEN     -> truffle test
