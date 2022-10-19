import { Contract } from 'ethers';

interface IProps {
  contract: Contract;
  tokenId: string;
}

export const fetchSignleNft = async ({ contract, tokenId }: IProps) => {
  const name: string = await contract.name();

  //TODO: fix direct tokenURI [Expected to be fixed by RMRK team]
  const collectionMetadataUri = await contract.tokenURI(tokenId);
  let res = await fetch(`${collectionMetadataUri}/${tokenId}.json`);
  const data = await res.json();
  const imageUri = data.image

  // console.log('Collection URI', collectionMetadataUri);
  // console.log('Image URI', imageUri);

  // const tokenUri: string = await contract.tokenURI(tokenId)
  const tokenUri: string = imageUri
  // console.log(tokenUri)

  const allResources: string[] = await contract.getAllResources();
  const activeResources: string[] = await contract.getActiveResources(tokenId);
  const pendingResources: string[] = await contract.getPendingResources(tokenId);
  const allData: string[] = [];
  const pendingResourcesData: string[] = [];
  const activeResourcesData: string[] = [];
  for (const r of allResources) {
    const resourceData = await contract.getResource(r);
    allData.push(resourceData);
  }
  for (const r of pendingResources) {
    const resourceData = await contract.getResource(r);
    pendingResourcesData.push(resourceData);
  }
  for (const r of activeResources) {
    const resourceData = await contract.getResource(r);
    activeResourcesData.push(resourceData);
  }

  // console.log("Fetched", allData, pendingResourcesData, activeResourcesData, name, allResources, activeResources, pendingResources, tokenUri)

  return {
    allData,
    pendingResourcesData,
    activeResourcesData,
    name,
    allResources,
    activeResources,
    pendingResources,
    tokenUri,
  };
};
