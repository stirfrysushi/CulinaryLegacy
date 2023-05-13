//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "./helper_contracts/ERC721.sol";

contract CulinaryLegacyRecipe {
    //##############Data Structure#####################
	struct Recipe {
        uint256 recipeID; 
        uint256 price;
    }

    uint256 public recipeCounts; //increment id for recipe
    uint256 public numberOfUsers; 

    address public contract_owner;
    mapping(address => uint256) public registeredUser; //keeping track registered user (address => 0/1)
    mapping(uint256 => Recipe) public recipeMap; // recipeId -> recipe object
    mapping(uint256 => address) public recipeOwner; //recipeId -> creator // different recipeId shares the same creator
    //mapping(uint256 => uint256) public recipeNames; //recipeID -> id given by users
    mapping(address => uint256) public ownedRecipesCount; // address -> number of recipes owned // this is for counting balance 

    //#########Event and Modifier##############
    
    //Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event recipeRequestCompleted(address indexed seller, address indexed buyer, uint recipeID); 
    event recipeRequestDenied(address indexed seller, address indexed buyer, uint recipeID); 
    event recipeRequest(address indexed seller, address indexed buyer, uint recipeID); 
    event _register(address from, string message);

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

   function balanceOf() public view returns (uint256) {
        return ownedRecipesCount[msg.sender];
    }


    function register() public payable {
        registeredUser[msg.sender] = 1;
        numberOfUsers++; 
        emit _register(msg.sender, "register successfully");
    }

    function unregisterMember(address userID) onlyContractOwner public{
        require(registeredUser[userID] == 0, "User not registered"); 
        registeredUser[userID] = 0;
    }
    
    //self-unregister onself from the contract
    function selfUnregister() public onlyRegisteredUser{
        if (msg.sender != contract_owner){
            registeredUser[msg.sender] = 0;
        }
    }
    
    //Create new recipe for sale
    //remove id as recipeCounts is automatically incremented
    function addRecipe(address owner, uint price) public {
        recipeMap[recipeCounts] = Recipe(recipeCounts, price);
        //recipeNames[recipeCounts] = id; 
        mint(owner,recipeCounts);
        recipeCounts = recipeCounts+1;
        ownedRecipesCount[owner]++; 
    }
    function mint(address to, uint256 recipeId) internal {
        require(to != address(0), "ZeroAddressMiniting");
        require(!exists(recipeId), "AlreadyMinted");
        recipeOwner[recipeId] = to;
        //emit Transfer(address(0), to, assetId);
    }
    
    function request(uint recipeID,  address payable seller) payable public{
        require(recipeOwner[recipeID] == seller, "NotTheRecipeOwner");
        recipeOwner[recipeID]=msg.sender;
        seller.transfer(recipeMap[recipeID].price * 1000000000000000000);
        ownedRecipesCount[msg.sender]++; 
        ownedRecipesCount[seller]--; 
        emit recipeRequest(msg.sender , seller, recipeID);
    }

    function response(address fromSeller, address toBuyer, uint recipeID) public{
        // if buyer not registered -> revert + announce cancellation 
        if (registeredUser[toBuyer] != 1) {
            emit recipeRequestDenied(fromSeller, toBuyer, recipeID);
            revert(); 
        } 
        // if seller does not own recipe -> cancel (for some reason the onlyRecipeOwner is triggering the compiler??)
        if (recipeOwner[recipeID] != fromSeller) {
            emit recipeRequestDenied(fromSeller, toBuyer, recipeID);
            revert(); 
        }
        // else -> announce completion + transfer ownership 
        recipeOwner[recipeID] = msg.sender; 
        emit recipeRequestCompleted(fromSeller,toBuyer,recipeID);
    }

    function terminateContract () onlyContractOwner public{
        selfdestruct(msg.sender);
    }

    //for testing purpose
    //function ownerOf(uint256 recipeId) onlyRecipeOwner(recipeId) public view returns (address)
    function ownerOf(uint256 recipeId) public view returns (address) {
        address owner = recipeOwner[recipeId];
        require(owner != address(0), "NoAssetExists");
        return owner;
    }

    function recipeCountsLength() public view returns (uint) {
        return recipeCounts;
    }
    //########Functions used by other functions##################
    
    function exists(uint256 recipeId) internal view returns (bool) {
        return recipeOwner[recipeId] != address(0);
    }
}