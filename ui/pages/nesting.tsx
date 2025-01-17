import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import { nestingFactoryContractDetails } from "../constants"
import { useAccount, useContract, useProvider, useSigner } from "wagmi"
import { Contract, Signer } from "ethers"
import NftList from "../components/nft-list"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import abis from "../abis/abis"

const Nesting: NextPage = () => {
  const provider = useProvider()
  const { data: signer, isSuccess } = useSigner()
  const { address, isConnected } = useAccount()
  const addRecentTransaction = useAddRecentTransaction()
  let nestingContract: Contract
  const [currentRmrkDeployment, setCurrentRmrkDeployment] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [rmrkCollections, setRmrkCollections] = useState<string[]>([])
  const [nameInput, setNameInput] = useState<string>("Test Collection")
  const [symbolInput, setSymbolInput] = useState<string>("TEST")
  const [collectionMetadataInput, setCollectionMetadataInput] =
    useState<string>("")
  const [maxSupplyInput, setSupplyInput] = useState<number>(10000)
  const [priceInput, setPriceInput] = useState<number>(0)
  const [ownedNfts, setOwnedNfts] = useState<
    { tokenId: number; owner: string; tokenUri: string }[]
  >([])
  const factoryContract = useContract({
    ...nestingFactoryContractDetails,
    signerOrProvider: signer,
  })

  function handleNameInput(e: React.ChangeEvent<HTMLInputElement>) {
    setNameInput(e.target.value)
  }

  function handleSymbolInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSymbolInput(e.target.value)
  }

  function handleMetadataInput(e: React.ChangeEvent<HTMLInputElement>) {
    setCollectionMetadataInput(e.target.value)
  }

  function handleMaxSupplyInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSupplyInput(Number(e.target.value))
  }

  function handlePriceInput(e: React.ChangeEvent<HTMLInputElement>) {
    setPriceInput(Number(e.target.value))
  }

  function handleContractSelection(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentRmrkDeployment(rmrkCollections[Number(e.target.value)])
  }

  async function getOwnedNfts() {
    const nfts = []

    if (signer instanceof Signer) {
      nestingContract = new Contract(
        currentRmrkDeployment,
        abis.nestingImplAbi,
        signer
      )

      const nftSupply = Number(await nestingContract.totalSupply())
      console.log("NFT supply", nftSupply)
      for (let i = 0; i < nftSupply; i++) {
        let isOwner = false
        let signerAddress = await signer.getAddress()
        let imageUri
        const nftId = i + 1 //NFT ID starts from 1. Note: NFT Id = 0 means NFT does not exist.
        try {
          //TODO: fix direct tokenURI [Expected to be fixed by RMRK team]
          const collectionUri = await nestingContract.tokenURI(nftId)
          let res = await fetch(`${collectionUri}/${nftId}.json`)
          const data = await res.json()
          const initialImageUri = data.image_url
          let [, cid] = initialImageUri.split("/ipfs/")
          imageUri = `https://ipfs.io/ipfs/${cid}`

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
            tokenUri: imageUri,
          })
        }
      }
    }
    return nfts
  }

  async function mintNft() {
    if (signer instanceof Signer) {
      nestingContract = new Contract(
        currentRmrkDeployment,
        abis.nestingImplAbi,
        signer
      )

      const options = {
        value: nestingContract.pricePerMint(),
      }
      const signerAddress = await signer.getAddress()
      const tx = await nestingContract
        .connect(signer)
        .mint(signerAddress, 1, options)

      addRecentTransaction({
        hash: tx.hash,
        description: "Minting a new RMRK NFT",
        confirmations: 1,
      })
    }
  }

  async function deployNft() {
    if (signer instanceof Signer) {
      const tx = await factoryContract
        .connect(signer)
        .deployRMRKNesting(
          nameInput,
          symbolInput,
          maxSupplyInput,
          priceInput,
          collectionMetadataInput
        )

      addRecentTransaction({
        hash: tx.hash,
        description: "Deploying a new RMRK NFT contract",
        confirmations: 1,
      })

      const receipt = await tx.wait()
      // setCurrentRmrkDeployment(receipt.events[1].args[0])
    }
  }

  async function queryCollections() {
    if (signer instanceof Signer) {
      const collections: string[] = []
      const allCollectionDeployments = await factoryContract.getCollections()
      for (let i = 0; i < allCollectionDeployments.length; i++) {
        console.log(allCollectionDeployments[i])
        const collection = new Contract(
          allCollectionDeployments[i],
          abis.nestingImplAbi,
          provider
        )
        if ((await collection.owner()) == address) {
          collections.push(allCollectionDeployments[i])
        }
      }

      setRmrkCollections(collections)
    }
  }

  function fetchData() {
    setLoading(true)
    queryCollections().then((r) => {
      setLoading(false)
    })
    if (currentRmrkDeployment.length > 0)
      getOwnedNfts().then((nfts) => {
        setOwnedNfts(nfts)
      })
  }

  useEffect(() => {
    console.log("Loading chain data")
    fetchData()
  }, [signer, currentRmrkDeployment])

  return (
    <div className={styles.container}>
      <Head>
        <title>RMRK Nesting App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        {/*<link rel="icon" href="/favicon.ico" />*/}
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>Nesting Demo</h1>

        <p className="mb-4">
          Create a new NFT collection contract so you can mint and nest nfts:
        </p>

        <div className="form-control w-full max-w-xs mb-2">
          <label className="label">
            <span className="label-text">Collection Name</span>
          </label>
          <input
            inputMode="text"
            placeholder="Name"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={nameInput}
            onChange={handleNameInput}
          ></input>
          <label className="label">
            <span className="label-text">Collection Symbol</span>
          </label>
          <input
            inputMode="text"
            placeholder="Symbol"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={symbolInput}
            onChange={handleSymbolInput}
          ></input>
          <label className="label">
            <span className="label-text">Max NFT Supply</span>
          </label>
          <input
            inputMode="numeric"
            placeholder="Max supply"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={maxSupplyInput}
            onChange={handleMaxSupplyInput}
          ></input>
          <label className="label">
            <span className="label-text">Price per NFT mint (in wei)</span>
          </label>
          <input
            inputMode="numeric"
            placeholder="Price"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={priceInput}
            onChange={handlePriceInput}
          ></input>
          <label className="label">
            <span className="label-text">Collection Metadata URI</span>
          </label>
          <input
            inputMode="text"
            placeholder="Collection metadata URI"
            className="input input-bordered w-full max-w-xs my-0.5"
            value={collectionMetadataInput}
            onChange={handleMetadataInput}
          ></input>
        </div>

        <button
          onClick={() => {
            deployNft().then((r) => fetchData())
          }}
          className="btn btn-wide btn-primary"
        >
          Deploy NFT contract
        </button>

        <p className="mt-5">
          Your RMRK NFT Contract will be deployed on the Arctic testnet.{" "}
        </p>

        {rmrkCollections.length > 0 && (
          <>
            <h1 className="text-2xl mt-8 mb-5">Your RMRK NFT Collections:</h1>
            <p className="mb-2">Select which one do you want to use:</p>
            {rmrkCollections?.map((contract, index) => {
              return (
                <div
                  key={index}
                  className="card-compact hover:bg-accent-content/5"
                >
                  <input
                    type="radio"
                    name="radio-contract"
                    className="radio checked:bg-red-500"
                    value={index}
                    onChange={handleContractSelection}
                  />

                  <Link href={"/nesting/" + contract}>
                    <code className="mx-2 hover:underline">{contract}</code>
                  </Link>
                  <a href={"https://arctic.epirus.io/address/" + contract}>
                    <Image
                      alt="logo"
                      src="/ice.svg"
                      width="25"
                      height="25"
                    />
                  </a>
                </div>
              )
            })}
          </>
        )}

        {currentRmrkDeployment.length > 0 && (
          <>
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
          </>
        )}
        {loading && <progress className="progress mt-2 w-72"></progress>}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}

export default Nesting
