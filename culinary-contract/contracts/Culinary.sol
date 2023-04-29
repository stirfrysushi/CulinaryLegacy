//https://ethereum.stackexchange.com/questions/9142/how-to-convert-a-string-to-bytes32
//https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
pragma solidity >=0.4.0 <0.6.0;
contract CulinaryLegacyRecipe{
    //##############Data Structure#####################
	struct Recipe {
        uint recipeID; 
        uint price;
    }

    uint index; //increment id for recipe
    address contract_owner;
    mapping(address => bool) registeredUser; //keeping track registered user
    mapping(uint => Recipe) recipeMap; // id -> recipe object
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
        require(registeredUser[msg.sender].registered);
        _;
    }
    //#########Functions###############
    function register() public {
        address user = msg.sender;
        registeredUser[user] = true;
    }
    function unregister(uint userID) public {} //Do we need this?

    //Create new recipe for sale
    function addRecipe(uint price) public onlyRegisteredUser{
        Recipe recipe = Recipe(index, price);
        recipeCreator[index] = msg.sender;
        index.increment();
    }
    //TODO: consider checking ASK example
    function request(uint recipeID) public{

    }
    ////TODO: consider checking ASK example
    function response(uint recipeID) onlyRecipeOwner public{}
    function viewAll(uint recipeID) public {} //what is the purpose of view?
    function sell(uint recipeID) public{}//do we need this as sell action considered to be a response?
    function buy(uint recipeID) public{}//do we need this as buy action considered to be a request?
    function terminateContract () onlyContractOwner public{
        selfdestruct(contract_owner);
    }
    function unregisterMember(uint userID) onlyContractOwne public{}


}