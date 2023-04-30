pragma solidity >=0.4.22 <0.9.0;
import "./helper_contracts/ERC721.sol";
contract CulinaryLegacyRecipe is ERC721{
    //##############Data Structure#####################
	struct Recipe {
        uint256 recipeID; 
        uint256 price;
    }

    uint256 recipeCount; //increment id for recipe
    address contract_owner;
    mapping(address => uint256) registeredUser; //keeping track registered user (address => 0/1)
    mapping(uint256 => Recipe) recipeMap; // recipeId -> recipe object
    mapping(uint256 => address) recipeOwner; //recipeId -> creator // different recipeId shares the same creator
    //#########Event and Modifier##############
    //Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event recipeRequestCompleted();
    modifier onlyContractOwner(){
        require(msg.sender == contract_owner);
        _;
    }
    modifier onlyRecipeOwner(uint recipdeId){
        require(msg.sender == recipeOwner[recipdeId]);
        _;
    }
    modifier onlyRegisteredUser(){
        require(registeredUser[msg.sender] == 1);
        _;
    }
    //#########Functions###############
    constructor() public{
        contract_owner = msg.sender;
    }
    function register() public {
        registeredUser[msg.sender] = 1;
    }
    //self-unregister onself from the contract
    function selfUnregister() public onlyRegisteredUser{
        if (msg.sender != contract_owner){
            registeredUser[msg.sender] = 0;
        }
    }
    //Create new recipe for sale
    function addRecipe(uint price) public onlyRegisteredUser{
        recipeMap[recipeCount] = Recipe(recipeCount, price);
        recipeOwner[recipeCount] = msg.sender;
        mint(msg.sender,recipeCount);
        recipeCount = recipeCount+1;
    }
    //TODO: consider checking ASK example
    function request(uint recipeId, address seller) onlyRegisteredUser payable public{
        require(recipeOwner[recipeId] == seller, "NotTheRecipeOwner");
        recipeOwner[recipeId]=msg.sender;
        address payable _addr = payable(seller);
        _addr.transfer(recipeMap[recipdeId].price);
        emit Transfer(from, msg.sender, recipeId);
    }
    
    //for testing purpose
    function ownerOf(uint256 recipeId) onlyRecipeOwner public view returns (address) {
        address owner = recipeOwner[recipeId];
        return owner;
    }
    function terminateContract () onlyContractOwner public{
        selfdestruct(msg.sender);
    }
    //########Functions used by other functions##################
    function mint(address to, uint256 recipeId) internal {
        //require(to != address(0), "ZeroAddressMiniting");
        require(!exists(assetId), "AlreadyMinted");
        recipeOwner[recipeId] = to;
        ownedAssetsCount[to]++;
        emit Transfer(address(0), to, assetId);
    }
}