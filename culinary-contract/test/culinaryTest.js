const Culinary = artifacts.require('../contracts/CulinaryLegacyRecipe.sol')
const truffleAssert = require('truffle-assertions');


contract('Culinary', function (accounts) {
    let culinary
    let success = '0x01'
    let contractOwner = accounts[0];
    let user1 = accounts[1]; 
    let user2 = accounts[2];
    
    beforeEach('Setup Culinary Contract', async function () {
      culinary = await Culinary.new();
    });

    // test for first deployed contract
    describe('Initialization - Deploying Contract', async () =>{
      it('Success on initialization to new deployed contract.', async function () {
        // testing state variable of contract 
        let count = await culinary.recipeCounts();
        assert.equal(count, 0);
      });

      it('Success on initializing contract owner', async function () {
        // testing owner 
        let owner_address = await culinary.contract_owner();
        assert.equal(owner_address, contractOwner); 
      });
    });

    // test for registered user 
    describe('User Testing', async() => {

      it('Success on registering users', async function() {

        // testing balance after registered 
        await culinary.register({ from: user1});
        let balance = await culinary.balanceOf({from: user1}); 
        assert.equal(balance, 0); 

        // test that user is registered -> numberOfUsers += 1
        let count = await culinary.numberOfUsers(); 
        assert.equal(count,1); 
      }); 

      // testing registered user adding recipe
      it('Success on adding recipe + increased balance', async function() {

        await culinary.register({ from: user1});
        await culinary.addRecipe(user1, 10, {from: user1});

        // check balance after adding recipe 
        let new_balance = await culinary.balanceOf({from: user1}); 
        assert.equal(new_balance,1); 
        
        // checking number of recipe in data 
        let current_recipeCounts = await culinary.recipeCounts();
        assert.equal(current_recipeCounts,1); 
      });

      // testing request recipes from other users 
      it('Success on requesting and responding recipe', async function() {

         // register both member 
        await culinary.register({ from: user1});
        await culinary.register({ from: user2});
        
        // check balance of user1
        let balance_user1 = await culinary.balanceOf({from:user1}); 
        assert.equal(balance_user1,0);

        // check balance of user2
        let balance_user2 = await culinary.balanceOf({from:user2}); 
        assert.equal(balance_user2, 0);

        // user1 add recipe 
        await culinary.addRecipe(user1, 0, {from: user1}); 

        // check number of recipe in data 
        let current_recipeCount = await culinary.recipeCounts(); 
        assert.equal(current_recipeCount, 1); 

        // check that user1 has 1 recipe stored 
        let recipesOwned = await culinary.ownedRecipesCount(user1); 
        assert.equal(recipesOwned,1); 

        // user2 request recipe -> assert that it is successful
        let result = await culinary.request(0, user1, {from: user2});
        assert.equal(result.receipt.status, success); 

        // user1 response -> assert that it is successful 
        let result1 = await culinary.response(user2, user1, 0, {from:user1}); 
        assert.equal(result1.receipt.status, success);

      }); 

    });
})

// REMEMBER -> npm i THEN -> truffle test
