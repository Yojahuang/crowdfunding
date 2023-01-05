// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Use FanToken as sample token
contract FanToken is ERC20 {
    constructor() ERC20("FanToken", "FAN") {
        _mint(msg.sender, 10**5);
    }
}