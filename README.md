# RMRK EVM Demo

## Project Structure

The project has three main folders:

- contracts
- scripts
- ui

### contracts
The [contracts folder](/contracts/) contains the smart contracts for RMRK EVM Demo. It makes use of [@rmrk-team/evm-contracts](https://www.npmjs.com/package/@rmrk-team/evm-contracts) library. 
> Note: Since the contracts in the package seems to be of size greater than 24.4 KB, `allowUnlimitedContractSize` is set to `true`.

### scripts
The [scripts folder](/scripts/) contains the script to deploy to deploy the contracts as well as create a .env file for the ui.

### ui
The [ui folder](/ui/) is the user interface built in next.

## Run Locally

### Clone the Repository

```bash
git clone https://github.com/prajwolrg/rmrk-evm-demo.git
```
### Install dependencies
```bash
npm i
```
#### Install dependencies of of UI
```bash
cd ui
npm i
```
### Start hardhat instance
```bash
npx hardhat node
```
### In a new terminal, deploy the contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Start the UI
```bash
cd ui
yarn start
```


