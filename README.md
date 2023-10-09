# Flare (FLR) Staking Tool

This is the frontend Vue.js application for the Flare (FLR) Staking Tool.

## Prerequisites

-   Yarn (https://classic.yarnpkg.com/en/docs/install/)
-   Recent version of npm (7.4.0)
-   Node v16
-   Gecko, Flare client in Golang (https://github.com/flare-foundation/go-flare)

## Installation

1. Clone the repo `git clone https://github.com/OneByte-Technologies/flare-staking-tool.git`
2. Go to root of the project `cd flare-staking-tool`
3. Install javascript dependencies with `yarn install`.

## Running The Project

In order for the wallet to work, it needs the Flare network to operate on. By default the wallet will connect to the Flare Mainnet.

1. If you want to connect to a local network, make sure you have installed and able to run a go-flare node properly.
2. Run the project with hot reloading `yarn serve`

When you go to the website on your browser, you might get a warning saying
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

1.  Compile and minify to have a production ready application with `yarn build`.
2.  Serve from the `/dist` directory.

## Changing the Network

By default the wallet will connect to the Flare Mainnet. You can change to another network by clicking the button labeled `Mainnet` or `Coston2` on the navigation bar and selecting another network, or add a custom network.

## Explorer API

A valid explorer API is required to correctly display balances for Mnemonic and Ledger type wallets.
The wallet uses the Flare Explorer API to display wallet transaction history.

WARNING: This history might be out of order and incomplete.

## Browser Support

We suggest using Google Chrome to view the Flare Staking Tool website.

### Firefox and https

Firefox does not allow https requests to localhost. But the Flare Staking Tool uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.js` file in the root directory and change

```
devServer: {
    https: true
},
```

to

```
devServer: {
    https: false
},
```

and run `yarn serve` to reflect the change.

# Accounts

The wallet can encrypt your private keys into a secure file encrypted by a password.

```json
{
    "accounts": iUserAccountEncrypted[]
}
```

# Dependencies

##### Flare Node (https://github.com/flare-foundation/go-flare)

To get utxos and to send transactions.

<!-- #### Explorer API Node (https://github.com/ava-labs/ortelius) -->

<!-- To check if an address was used before, and to get activity history. -->

# Default Connections

The wallet needs to connect to a Flare node, and an explorer node to operate properly.

By default, there are two network options to connect to: `Mainnet` and `Coston2`.

##### Mainnet

-   Flare API: `https://flare-api.flare.networ:443`

##### Coston2 (Testnet)

-   Flare API: `https://coston2-api.flare.network:443`
