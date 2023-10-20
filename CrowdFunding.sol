// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amtCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    // mapping named as 'campaigns'.
    // each campaigns has its unique identifer(uint256) and associated data stored in a "Campaign struct."
    // using mapping data structures to map uint256(key) and Campaign (values).

    uint256 public numberOfCampaigns = 0;

    function createCampaigns(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];
        // inserting numberOfCampaigns into campaigns array;
        // campaign is the object of the class Campaign.

        require(
            campaign.deadline < block.timestamp,
            "The deadline should be a date in the future."
        );
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amtCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    // Campaign created successfully.
    // Above, return the id of the campaigns that we create.

    function donateToCampaigns(uint256 _id) public payable {
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];
        // getting the campaign that we want to donate.
        campaign.donators.push(msg.sender);
        // push address of the donator.
        campaign.donations.push(amount);
        //amount donated.

        // Below code just checks the ether amount payed successfully or Not?
        // if, yes amtCollected will be incremented by the amt that is been collected.
        // payable is the keyword that indicates that address can receive Ether payments.
        (bool send, ) = payable(campaign.owner).call{value: amount}("");

        if (send) {
            campaign.amtCollected = campaign.amtCollected + amount;
        }
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCompaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCompaigns[i] = item;
        }

        return allCompaigns;
    }
}
