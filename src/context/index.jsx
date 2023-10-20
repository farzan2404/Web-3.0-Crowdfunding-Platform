import React, { useContext, createContext } from "react";
import { ethers } from "ethers";
import { EditionMetadataWithOwnerOutputSchema } from "@thirdweb-dev/sdk";

// below are the utility functions coming from web3
import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from "@thirdweb-dev/react";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // connecting our smart contract with  its address below
  const { contract } = useContract(
    "0x81d7B234D4009c3595355637e54a3472fF53d319"
  );

  const { mutateAsync: createCampaigns } = useContractWrite(
    contract,
    "createCampaigns"
  );
  // By calling the above function will be able to create out campaign by passing all our parameter.

  const address = useAddress();
  const connect = useMetamask();

  // With this function we finally create our campaign
  const publishCampaign = async (form) => {
    try {
      const data = await createCampaigns({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target,
          new Date(form.deadline).getTime(), // deadline,
          form.image,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  // get campaigns.
  const getCampaigns = async () => {
    const campaigns = await contract.call("getCampaigns");

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()), // Error likely here
      deadline: campaign.deadline.toNumber(),
      amtCollected: ethers.utils.formatEther(campaign.amtCollected.toString()), // Error likely here
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaigns', [pId], { value: ethers.utils.parseEther(amount)});

    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaigns: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,

      }}
    >
      {children}
    </StateContext.Provider>
  );
};
export const useStateContext = () => useContext(StateContext);
// With this our first call to the smart contract is done.
