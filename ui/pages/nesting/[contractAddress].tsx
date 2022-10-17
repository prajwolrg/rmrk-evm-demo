import NftList from "../../components/nft-list"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Contract, ethers, Signer } from "ethers"
import { useSigner } from "wagmi"
import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { NextPage } from "next"
import styles from "../../styles/Home.module.css"
import Head from "next/head"
import Resource from "../../components/resource"
import abis from "../../abis/abis"
import AddResourceToCollection from "../../components/add-resource"

const NestingNftCollection: NextPage = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  let nestingContract: Contract
  const addRecentTransaction = useAddRecentTransaction()
  const { data: signer, isSuccess } = useSigner()
  const [currentRmrkDeployment, setCurrentRmrkDeployment] = useState<string>("")
  const [allResourcesData, setAllResourcesData] = useState<string[]>([])
  const [resources, setResources] = useState<string[]>([])
  const [resourceInput, setResourceInput] = useState<string>("")
  const [collectionName, setCollectionName] = useState<string>("")
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [ownedNfts, setOwnedNfts] = useState<
    { tokenId: number; owner: string; tokenUri: string }[]
  >([])

  useEffect(() => {
    console.log("Loading chain data")
    console.log(currentRmrkDeployment)
    if (ethers.utils.isAddress(contractAddress as string)) {
      setCurrentRmrkDeployment(contractAddress as string)
      fetchNftCollection().then(() => {})
      getOwnedNfts().then((nfts) => {
        setOwnedNfts(nfts)
      })
    }
  }, [signer, contractAddress])

  async function fetchNftCollection() {
    if (signer instanceof Signer) {
      nestingContract = new Contract(
        contractAddress as string,
        abis.nestingImplAbi,
        signer
      )
      const name: string = await nestingContract.name()
      const allResources: string[] = await nestingContract.getAllResources()
      const allData: string[] = []
      for (const r of allResources) {
        const resourceData = await nestingContract.getResource(r)
        allData.push(resourceData)
      }
      setAllResourcesData(allData)
      setResources(allResources)
      setCollectionName(name)
    }
  }

  async function getOwnedNfts() {
    const nfts = []

    if (
      signer instanceof Signer &&
      ethers.utils.isAddress(currentRmrkDeployment)
    ) {
      nestingContract = new Contract(
        currentRmrkDeployment,
        abis.nestingImplAbi,
        signer
      )
      let signerAddress = await signer.getAddress()
      let contractOwner = await nestingContract.owner()
      let isContractOwner = signerAddress === contractOwner
      setIsOwner(isContractOwner)

      const nftSupply = Number(await nestingContract.totalSupply())
      console.log("NFT supply", nftSupply)
      for (let i = 0; i < nftSupply; i++) {
        let isOwner = false
        let signerAddress = await signer.getAddress()
        let tokenUri
        const nftId = i+1; //NFT ID starts from 1. Note: NFT Id = 0 means NFT does not exist.
        try {
          tokenUri = await nestingContract.tokenURI(nftId) 
          const nftOwner = await nestingContract.ownerOf(nftId)
          // console.log('NFT Owner', nftOwner)
          isOwner = nftOwner === signerAddress
          // console.log('Is owner?', isOwner)
        } catch (error) {
          console.log(error)
        }
        if (isOwner) {
          nfts.push({
            tokenId: nftId,
            owner: signerAddress,
            tokenUri
          })
        }
      }

    }
    return nfts
  }

  async function mintNft() {
    if (
      signer instanceof Signer &&
      ethers.utils.isAddress(currentRmrkDeployment)
    ) {
      nestingContract = new Contract(
        currentRmrkDeployment,
        abis.nestingImplAbi,
        signer
      )

      const signerAddress = await signer.getAddress()

      const options = {
        value: nestingContract.pricePerMint(),
      }
      const tx = await nestingContract
        .connect(signer)
        .mint(signerAddress, 1, options)

      addRecentTransaction({
        hash: tx.hash,
        description: "Minting a new RMRK NFT",
        confirmations: 1,
      })
      await tx.wait(1)
    }
  }

  async function addResource() {
    if (signer instanceof Signer) {
      nestingContract = new Contract(
        currentRmrkDeployment,
        abis.nestingImplAbi,
        signer
      )
      const tx = await nestingContract
        .connect(signer)
        .addResourceEntry(resourceInput)
      addRecentTransaction({
        hash: tx.hash,
        description: "Adding a new resource to collection",
        confirmations: 1,
      })
      await tx.wait(1)
    }
  }

  function handleResourceInput(e: React.ChangeEvent<HTMLInputElement>) {
    setResourceInput(e.target.value)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>RMRK Multi-resource App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        {/*<link rel="icon" href="/favicon.ico" />*/}
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h4 className={styles.description}>
          Collection name: {collectionName}
        </h4>
        <ul className="mt-1">Usage Notes:</ul>
        <li>
          You have to be the Owner of the NFT Collection to add new resources
        </li>
        <li>
          If you are not authorized like above the transactions will be reverted
        </li>

        <p className="mb-4 mt-5">
          Mint an NFT to be able to attach multiple resources to it:
        </p>
        <button
          onClick={() => {
            mintNft().then((r) => getOwnedNfts())
          }}
          className="btn btn-wide btn-primary"
        >
          Mint NFT
        </button>
        <p className="mt-5">
          It might take a few minutes to show your NFTs when just minted.
        </p>
        <p className="mb-5">
          Click on the NFT card to open resource management page.
        </p>
        <NftList
          nfts={ownedNfts}
          tokenContract={currentRmrkDeployment}
          tokenType={"nesting"}
        />

        <p className="text-center text-2xl mt-10">NFT Collection Resources:</p>
        {resources.map((resource, index) => {
          return (
            <div key={index} className={styles.card}>
              <Resource
                key={index}
                resource={resource}
                strings={allResourcesData}
                index={index}
              />
            </div>
          )
        })}
        {isOwner && (
          <AddResourceToCollection
            value={resourceInput}
            onChange={handleResourceInput}
            onClick={() => {
              addResource().then(() => fetchNftCollection())
            }}
          />
        )}
      </main>
      <footer className={styles.footer}></footer>
    </div>
  )
}

export default NestingNftCollection
