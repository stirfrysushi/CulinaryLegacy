//https://ethereum.stackexchange.com/questions/9142/how-to-convert-a-string-to-bytes32
//https://ethereum.stackexchange.com/questions/2519/how-to-convert-a-bytes32-to-string
pragma solidity >=0.4.0 <0.6.0;
contract CulinaryLegacyRecipe{
    //###########Data#####################
	struct Recipe {
        uint recipeID; 
        uint price;
    }
    struct User {
        uint userID;
        bool registered;
    }

    uint index;
    mapping(Recipe => User) owners;//TODO: must be elementary type name for mapping
    address contract_owner;
    mapping(address => User) registeredUser
    //#########Event and Modifier##############
    event recipeRequestCompleted(...)
    modifier onlyContractOwner(){
        require(msg.sender == contract_owner);
        _;
    }
    modifier onlyRecipeOwner(...)
    //#########Event and Modifier##############

    //#########Functions###############
    function register() public {
        address user = msg.sender;
        registeredUser[user].registered = true;
        registeredUser[user].userID = index;
        index.increment();
    }
    function unregister(uint userID) //Do we need this?
    function request(uint recipeID)
    function response(uint recipeID) onlyRecipeOwner
    function view(uint recipeID)
    function sell(uint recipeID)
    function buy(uint recipeID)
    function terminateContract () onlyContractOwner{
        
    }
    function unregisterMember(uint userID) onlyContractOwner


}