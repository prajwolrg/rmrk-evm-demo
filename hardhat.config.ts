import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

require('dotenv').config()

const TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY;
console.log(TESTNET_PRIVATE_KEY)

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.16",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        arctic: {
            url: 'https://arctic-rpc.icenetwork.io:9933',
            accounts: [`0x${TESTNET_PRIVATE_KEY}`],
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: false,
    },
};

export default config;
