import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { FanToken } from "../typechain-types";

describe("FanToken", function () {
    let fanToken: FanToken;
    let owner: SignerWithAddress;
    const amount = ethers.BigNumber.from(100000000);

    beforeEach(async() => {
        [owner] = await ethers.getSigners();
        

        const FanToken = await ethers.getContractFactory("FanToken");
        fanToken = await FanToken.deploy(amount);
    })

    it("should check the symbol and name of fantoken", async() => {
        expect(await fanToken.symbol()).to.be.equal("FAN");
        expect(await fanToken.name()).to.be.equal("FanToken");
    })
});
