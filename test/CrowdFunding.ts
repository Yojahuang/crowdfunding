import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { CrowdFunding, FanToken } from "../typechain-types";

describe("Test CrowdFunding.sol", function () {
    let crowdFunding : CrowdFunding, fanToken: FanToken;
    let owner: SignerWithAddress, buyer: SignerWithAddress, otherClient: SignerWithAddress;

    const price = ethers.BigNumber.from(1000000000);
    const targetBalance = ethers.BigNumber.from(100000000);
    const title = "title";
    const description = "description";

    beforeEach(async() => {
        [owner, buyer, otherClient] = await ethers.getSigners();
    
        const FanToken = await ethers.getContractFactory("FanToken");
        fanToken = await FanToken.deploy(targetBalance);

        const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        crowdFunding = await CrowdFunding.deploy();

        await fanToken.connect(owner).approve(crowdFunding.address, targetBalance);

        await crowdFunding.connect(owner).createFundRaising(title, description, 
            fanToken.address, price, targetBalance);
    })

    it("should check the title and the description", async() => {
        let projectInfo = await crowdFunding.projects(0);
        expect(projectInfo.title).to.be.equal(title);
        expect(projectInfo.description).to.be.equal(description);
    })

    describe("Cancel purchase", ()=> {
        it("should fail the request of cancel purchase when msg.sender didn't buy the token before", async() => {
            try {
                await crowdFunding.connect(otherClient).cancelPurchase(0, 100);
            } catch (error) {
                expect(error).not.be.equal(null);
                return;
            }
            // This should throw error when the program didn't catch error above
            expect(true).to.be.equal(false);
        })


        it("should refund the eth", async() => {
            let balanceAtBegining = await ethers.provider.getBalance(buyer.address);
            await crowdFunding.connect(buyer).purchaseToken(0, targetBalance, {value: price.mul(targetBalance)});

            let balanceAfterBuying = await ethers.provider.getBalance(buyer.address);
            expect(balanceAtBegining).to.be.greaterThan(balanceAfterBuying); 

            await crowdFunding.connect(buyer).cancelPurchase(0, targetBalance);
            let balanceAfterRefund = await ethers.provider.getBalance(buyer.address);

            expect(balanceAfterRefund).to.be.greaterThan(balanceAfterBuying);
        })
    })

    describe("terminate fundraising", () => {
        it("should fail the request of terminate fundraising process when msg.sender is not owner of fundraising", async() => {
            try {
                await crowdFunding.connect(otherClient).terminateFundRaising(0);
            } catch (error) {
                expect(error).not.be.equal(null);
                return;
            }
            // This should throw error when the program didn't catch error above
            expect(true).to.be.equal(false);
        })
    })
});
