// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CulinaryLegacyRecipe {

    // structs definition + data 
    struct Recipe {
        uint recipeID; 
        uint price; 
    }
    struct User {
        uint userID; 
        bool registered; 
    }
    uint index; 
    mapping(uint => User) owners; 
    mapping(address => User) registeredUser; 
    address contract_owner; 

}