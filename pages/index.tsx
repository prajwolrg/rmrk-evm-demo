import { ConnectButton } from "@rainbow-me/rainbowkit"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import Link from "next/link"

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome to <a href="https://rmrk.app">RMRK!</a>
        </h1>

        <p className={styles.description}>
          To get started try one of these and mint an NFT:
        </p>

        <div className={styles.grid}>
          <Link href="/nesting" className={styles.card}>
            <div className={styles.card}>
              <h2>Nesting Demo &rarr;</h2>
              <p>Make your NFT own other NFTs.</p>
            </div>
          </Link>

          <Link href="/multi-resource" >
            <div className={styles.card}>
              <h2>Multi-resource Demo &rarr;</h2>
              <p>Multiple file types inside one NFT.</p>
            </div>
          </Link>

          <Link href="/marketplace" >
            <div className={styles.card}>
              <h2>Marketplace Demo &rarr;</h2>
              <p>Buy and sell NFTs.</p>
            </div>
          </Link>

          <Link href="/equipppable" >
            <div className={styles.card}>
              <h2>Equippable NFTs Demo &rarr;</h2>
              <p>Equip items to your NFT characters.</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}

export default Home
