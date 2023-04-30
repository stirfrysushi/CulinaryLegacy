pragma solidity >=0.4.22 <0.9.0;
contract CulinaryLegacyRecipe{
    //##############Data Structure#####################
	struct Recipe {
        uint recipeID; 
        uint price;
    }

    uint index; //increment id for recipe
    address contract_owner;
    mapping(address => uint) registeredUser; //keeping track registered user
    mapping(uint => Recipe) recipeMap; // recipeId -> recipe object
    mapping(uint => address) recipeCreator; //recipeId -> creator // different recipeId shares the same creator
    mapping(uint => address[]) recipeOwner; //recipeId -> owners

    //#########Event and Modifier##############
    constructor() public{
        contract_owner = msg.sender;
    }
    event recipeRequestCompleted();
    modifier onlyContractOwner(){
        require(msg.sender == contract_owner);
        _;
    }
    modifier onlyRecipeOwner(uint recipdeId){
        require(msg.sender == recipeCreator[recipdeId]);
        _;
    }
    modifier onlyRegisteredUser(){
        require(registeredUser[msg.sender] == 1);
        _;
    }
    //#########Functions###############
    function register() public {
        address user = msg.sender;
        registeredUser[user] = 1;
    }
    //self-unregister onself from the contract
    function selfUnregister() public onlyRegisteredUser{
        if (msg.sender != contract_owner){
            registeredUser[msg.sender] = 0;
        }
    }
    //Create new recipe for sale
    function addRecipe(uint price) public onlyRegisteredUser{
        recipeMap[index] = Recipe(index, price);
        recipeCreator[index] = msg.sender;
        recipeOwner[index].push(msg.sender);
        index++;
    }
    //TODO: consider checking ASK example
    function request(uint recipeID, address seller) onlyRegisteredUser payable public{
        recipeOwner[recipeID].push(msg.sender);
        address payable _addr = payable(seller);
        _addr.transfer(msg.value);
    }
    ////TODO: consider checking ASK example
    //function response(uint recipeID) onlyRecipeOwner public{}
    
    //for testing purpose
    function viewAllOwnersOfThisRecipe(uint recipeID) public view returns (address[] memory) {
        return recipeOwner[recipeID];
    }
    //function sell(uint recipeID) public{}//do we need this as sell action considered to be a response?
    //function buy(uint recipeID) public{}//do we need this as buy action considered to be a request?
    function terminateContract () onlyContractOwner public{
        selfdestruct(msg.sender);
    }

    function unregisterMember(address userID) onlyContractOwner public{
        // check if user is registered
        require(registeredUser[userID] == 0, "User not registered"); 
        // set user to be 0 -- unregistered now 
        registeredUser[userID] = 0;
    }

}