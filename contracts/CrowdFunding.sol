// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdFunding {
    struct Project {
        string title;
        string description;
        address payable owner;
        IERC20 token;
        uint256 price;
        mapping(address => uint256) purchase;
        address payable[] buyers;
        uint256 balance;
        uint256 targetBalance;
        bool finished;
    }

    mapping(uint256 => Project) public projects;
    uint256 projectIndex;

    constructor() {
        projectIndex = 0;
    }

    modifier isOwner(uint256 index) {
        require(msg.sender == projects[index].owner, "You must be the owner of the project to terminate fund raising process");
        _;
    }

    modifier haventFinished(uint256 index) {
        require(projects[index].finished == false, "Fund raising process has finished");
        _;
    }

    function createFundRaising(
        string memory _title, string memory _description,
        IERC20 _contractAddress,
        uint256 _price, uint256 _targetBalance
    ) public {
        Project storage project = projects[projectIndex];
        project.title = _title;
        project.description = _description;
        project.owner = payable(msg.sender);
        project.token = _contractAddress;
        project.price = _price;
        project.balance = _targetBalance;
        project.targetBalance = _targetBalance;
        project.finished = false;
        
        project.token.transferFrom(msg.sender, address(this), _targetBalance);

        projectIndex = projectIndex + 1;
    }

    function purchaseToken(uint256 index, uint256 amountOfTokens) haventFinished(index) public payable {
        require(projects[index].targetBalance - projects[index].balance >= amountOfTokens, "Insufficient token available for buying!");
        require(projects[index].price * amountOfTokens <= msg.value, "Insufficient fund!");
        
        if (projects[index].purchase[msg.sender] == 0) {
            projects[index].buyers.push(payable(msg.sender));
        }

        projects[index].purchase[msg.sender] = projects[index].purchase[msg.sender] + amountOfTokens;
    }

    function cancelPurchase(uint256 index, uint256 amountOfTokens) haventFinished(index) public {
        require(projects[index].purchase[msg.sender] >= amountOfTokens, "You must have sufficient amount of tokens you claimed you have!");
    
        projects[index].purchase[msg.sender] -= amountOfTokens;
    
        if (projects[index].purchase[msg.sender] == 0) {
            for (uint i = 0; i < projects[index].buyers.length; ++i) {
                if (projects[index].buyers[i] == msg.sender) {
                    if (i != projects[index].buyers.length - 1) {
                        uint end = projects[index].buyers.length - 1;
                        projects[index].buyers[i] = projects[index].buyers[end];
                    }
                    projects[index].buyers.pop();
                    break;
                }
            }
        }

        bool sent = payable(msg.sender).send(amountOfTokens * projects[index].price);
        require(sent, "Transcation failed");
    }

    function terminateFundRaising(uint256 index) public haventFinished(index) isOwner(index) {
        // airdrop the token to every buyer        
        projects[index].finished = true;
        for (uint i = 0; i < projects[index].buyers.length; ++i) {
            address buyer = projects[index].buyers[i];
            
            projects[index].token.transfer(buyer, 
                projects[index].purchase[buyer]);
        }
    
        bool sent = projects[index].owner.send(projects[index].balance * projects[index].price);
        require(sent, "Transcation failed");
    
        projects[index].token.transfer(projects[index].owner, 
            projects[index].targetBalance - projects[index].balance);
    }
}
