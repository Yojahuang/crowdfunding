import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { CrowdFunding, FanToken } from "../typechain-types";

describe("CrowdFunding", function () {
    let crowdFunding : CrowdFunding, fanToken: FanToken;
    let owner: SignerWithAddress, donator: SignerWithAddress, otherClient: SignerWithAddress;

    beforeEach(async() => {
        [owner, donator, otherClient] = await ethers.getSigners();
    
        const FanToken = await ethers.getContractFactory("FanToken");
        fanToken = await FanToken.deploy();

        const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        crowdFunding = await CrowdFunding.deploy();

        await fanToken.connect(owner).approve(crowdFunding.address, 10000);

        await crowdFunding.connect(owner).createFundRaising("title", "description", 
            fanToken.address, 20, 10000);
    })

    it("should check the title and the description", async() => {
        let projectInfo = await crowdFunding.projects(0);
        expect(projectInfo.title).to.be.equal("title");
        expect(projectInfo.description).to.be.equal("description");
    })

    it("should fail the request of terminate fund raising process when msg.sender is not owner of fundraising", async() => {
        try {
            await crowdFunding.connect(otherClient).terminateFundRaising(0);
        } catch (error) {
            expect(error).not.be.equal(null);
            return;
        }
        expect(true).to.be.equal(false);
    })
});
