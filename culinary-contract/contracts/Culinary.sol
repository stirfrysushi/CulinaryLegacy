//https://ethereum.stackexchange.com/questions/9142/how-to-convert-a-string-to-bytes32
//https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
pragma solidity >=0.4.0 <0.6.0;
contract CulinaryLegacyRecipe{
    //##############Data Structure#####################
	struct Recipe {
        uint recipeID; 
        uint price;
    }
    struct User {
        uint[] recipeOwned //recipe owned by this user
        bool registered;
    }

    uint index; //increment id for recipe
    //mapping(Recipe => address) owners;//TODO: must be elementary type name for mapping
    address contract_owner;
    mapping(address => User) registeredUser //keeping track registered user
    mapping(address => Recipe) recipeCreator //keeping track of the creator of the recipe

    //#########Event and Modifier##############
    event recipeRequestCompleted(...)
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
        registeredUser[user].registered = true;
    }
    function unregister(uint userID) //Do we need this?

    //Create new recipe for sale
    //TODO: allow one user to create multiple recipe 
    //-> suggest: update recipeCreator to map address to list of Recipe
    function addRecipe(uint price) onlyRegisteredUser public {
        Recipe recipe = Recipe(index, price)
        index.increment()
        recipeCreator[msg.sender] = recipe
    }
    //TODO: consider checking ASK example
    function request(uint recipeID) {

    }
    ////TODO: consider checking ASK example
    function response(uint recipeID) onlyRecipeOwner
    function view(uint recipeID)//what is the purpose of view?
    function sell(uint recipeID)//do we need this as sell action considered to be a response?
    function buy(uint recipeID)//do we need this as buy action considered to be a request?
    function terminateContract () onlyContractOwner{
        selfdestruct(contract_owner);
    }
    function unregisterMember(uint userID) onlyContractOwner


}