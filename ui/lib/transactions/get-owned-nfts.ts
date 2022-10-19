import { Contract, ethers, Signer } from 'ethers';

interface IProps {
  signer?: ethers.Signer | null;
  contractAddress: string;
  abi: ethers.ContractInterface;
}

export const getOwnedNfts = async ({ signer, contractAddress, abi }: IProps) => {
  const nfts = [];
  let isContractOwner = false;
  if (signer instanceof Signer && ethers.utils.isAddress(contractAddress)) {
    const multiResourceContract = new Contract(contractAddress, abi, signer);
    const owner = await multiResourceContract.owner();
    const caller = await signer.getAddress();
    if (owner === caller) isContractOwner = true;
    const nftSupply = await multiResourceContract.totalSupply();
    console.log('NFT Supply', nftSupply)
    for (let i = 1; i <= nftSupply.toNumber(); i++) {
      let isAssetOwner = false;
      try {
        const assetOwner = await multiResourceContract.ownerOf(i);
        console.log('Asset Owner', assetOwner)
        const caller = await signer.getAddress();
        console.log('Caller', caller)
        isAssetOwner = assetOwner === caller;
        console.log('Is Asset Owner ? ', isAssetOwner)
      } catch (error) {
        console.log(error);
      }
      if (isAssetOwner) {
        const owner = await signer.getAddress();
        console.log('YES Owner')
        console.log(i)

        //TODO: fix direct tokenURI [Expected to be fixed by RMRK team]
        const collectionMetadataUri = await multiResourceContract.tokenURI(i)
        let res = await fetch(`${collectionMetadataUri}/${i}.json`)
        const data = await res.json()
        const imageUri = data.image_url;

        const tokenUri = imageUri

        console.log("Collection URI", collectionMetadataUri)
        console.log("Image URI", tokenUri)

        nfts.push({
          tokenId: i,
          owner,
          tokenUri,
        });
      }
    }
  }
  return { nfts, isContractOwner };
};
