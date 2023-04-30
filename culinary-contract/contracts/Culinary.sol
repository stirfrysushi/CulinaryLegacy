//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
import "./helper_contracts/ERC721.sol";
contract CulinaryLegacyRecipe is ERC721{
    //##############Data Structure#####################
	struct Recipe {
        uint256 recipeID; 
        uint256 price;
    }
    uint256 recipeCount; //increment id for recipe
    address payable contract_owner;
    mapping(address => uint256) registeredUser; //keeping track registered user (address => 0/1)
    mapping(uint256 => Recipe) recipeMap; // recipeId -> recipe object
    mapping(uint256 => address) recipeOwner; //recipeId -> creator // different recipeId shares the same creator

    //#########Event and Modifier##############
    //Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event recipeRequestCompleted(address indexed seller, address indexed buyer, uint recipeID); 
    event recipeRequestDenied(address indexed seller, address indexed buyer, uint recipeID); 
    event recipeRequest(address indexed seller, address indexed buyer, uint recipeID); 

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
    function addRecipe(uint price) public onlyRegisteredUser{
        recipeMap[recipeCount] = Recipe(recipeCount, price);
        mint(msg.sender,recipeCount);
        recipeCount = recipeCount+1;
    }
    
    //TODO: consider checking ASK example
    function request(uint recipeID, address buyer, address payable seller) onlyRegisteredUser payable public{
        require(recipeOwner[recipeID] == seller, "NotTheRecipeOwner");
        recipeOwner[recipeID]=buyer;
        seller.transfer(msg.value);
        emit recipeRequest(buyer, seller, recipeID);
    }

    ////TODO: consider checking ASK example
    function response(address fromSeller, address toBuyer, uint recipeID) public{
        // if buyer not registered -> revert + announce cancellation 
        if (registeredUser[toBuyer] != 1) {
            revert(); 
            emit recipeRequestDenied(fromSeller, toBuyer, recipeID);
        } 
        // if seller does not own recipe -> cancel (for some reason the onlyRecipeOwner is triggering the compiler??)
        if (recipeOwner[recipeID] != fromSeller) {
            revert(); 
            emit recipeRequestDenied(fromSeller, toBuyer, recipeID);
        }
        // else -> announce completion + transfer ownership 
        recipeOwner[recipeID] = msg.sender; 
        emit recipeRequestCompleted(fromSeller,toBuyer,recipeID);
    }

    function terminateContract () onlyContractOwner public{
        selfdestruct(contract_owner);
    }

    //for testing purpose
    function ownerOf(uint256 recipeId) onlyRecipeOwner(recipeId) public view returns (address) {
        address owner = recipeOwner[recipeId];
        require(owner != address(0), "NoAssetExists");
        return owner;
    }

    //########Functions used by other functions##################
    function mint(address to, uint256 recipeId) internal {
        require(to != address(0), "ZeroAddressMiniting");
        require(!exists(recipeId), "AlreadyMinted");
        recipeOwner[recipeId] = to;
        //emit Transfer(address(0), to, assetId);
    }
    function exists(uint256 recipeId) internal view returns (bool) {
        return recipeOwner[recipeId] != address(0);
    }
}