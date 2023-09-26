<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div v-show="!isConfirm" key="form" class="ins_col">
                        <div style="margin-bottom: 30px">
                            <h4>P chain address</h4>
                            <p class="desc">Your P Chain Address is: {{ pAddress }}</p>
                            <input
                                type="text"
                                v-model="pAddress"
                                style="width: 100%"
                                placeholder="P Chain Address"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>C chain address</h4>
                            <p class="desc">Your C Chain Address is: {{ cChainAddr }}</p>
                            <input
                                type="text"
                                v-model="cChainAddress"
                                style="width: 100%"
                                placeholder="C Chain Address"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>Public Key</h4>
                            <p class="desc">Your Public Key is :{{ pubKey }}</p>
                            <input
                                type="text"
                                v-model="pubKey"
                                style="width: 100%"
                                placeholder="publickey"
                            />
                        </div>
                        <v-btn @click="bindAddress" block class="button_secondary" depressed>
                            Bind address
                        </v-btn>
                    </div>
                </transition-group>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { WalletType, WalletNameType } from '@/js/wallets/types'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { issueC } from '@/helpers/issueTx'
import { defaultContractAddresses, getAddressBinderABI } from './FlareContractConstants'
import { ethers } from 'ethers'
import { bech32 } from 'bech32'
import { cChain } from '@/AVA'
import { KeyChain } from 'avalanche/dist/apis/evm'
import { ava } from '@/AVA'

@Component({})
export default class AddressBinder extends Vue {
    // ...
    pChainAddress: string = this.$store.state.activeWallet.getCurrentAddressPlatform()
    wallet = this.$store.state.activeWallet
    ethersWallet = new ethers.Wallet(this.wallet.ethKey)
    pubKey: string = this.ethersWallet.publicKey
    cChainAddress: string = ''
    pAddress =
        '0x' +
        Buffer.from(bech32.fromWords(bech32.decode(this.pChainAddress.slice(2)).words)).toString(
            'hex'
        )

    async bindAddress() {
        const cAddress = this.wallet.getEvmChecksumAddress()
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress: string = defaultContractAddresses.AddressBinder.costwo //change to dynamic
        const abi = getAddressBinderABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const nonce = await provider.getTransactionCount(cAddress)

        const gasEstimate = await contract.estimateGas.registerAddresses(
            this.pubKey,
            this.pAddress,
            cAddress,
            { from: cAddress }
        )
        console.log('Gas Estimate', gasEstimate)
        const gasPrice = await provider.getGasPrice()
        console.log('Gas Price', gasPrice)
        const populatedTx = await contract.populateTransaction.registerAddresses(
            this.pubKey,
            this.pAddress,
            cAddress
        )
        console.log('populated tx', populatedTx)
        const chainId = ava.getNetworkID()
        const unsignedTx = {
            ...populatedTx,
            nonce,
            chainId: chainId,
            gasPrice,
            gasLimit: gasEstimate,
        }
        console.log('unsignedtx', unsignedTx)
        const signedTx = await this.ethersWallet.signTransaction(unsignedTx)
        const txId = await contract.provider.sendTransaction(signedTx)
        console.log('txId', txId)
    }

    get activeWallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get cChainAddr() {
        let wallet = this.activeWallet
        if (!wallet) {
            this.cChainAddress = '-'
        } else {
            this.cChainAddress = wallet.getEvmChecksumAddress()
        }
        return this.cChainAddress
    }

    privateKeyC(): string | null {
        // if (this.walletType() !== 'ledger') {
        let wallet = this.$store.state.activeWallet
        console.log('Wallet///', wallet)
        console.log('Wallet Key', wallet.ethKey)
        return wallet.ethKey
        // } else return null
    }

    walletType(): WalletNameType {
        return this.wallet.type
    }

    getIp() {
        let ip = ''
        if (ava.getHRP() === 'costwo') {
            ip = 'coston2'
        } else if (ava.getHRP() === 'flare') {
            ip = 'flare'
        }
        const rpcUrl: string = `https://${ip}-api.flare.network/ext/C/rpc`
        return rpcUrl
    }

    getPAddress() {}
}
</script>
<style scoped lang="scss">
@use '../../main';

form {
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 90px;
}

.ins_col {
    max-width: 490px;
    padding-bottom: 8vh;
}

.amt {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #999;
    padding: 4px 14px;
}

.bigIn {
    flex-grow: 1;
}

input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.desc {
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

h4 {
    font-weight: bold;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;

    label > span {
        float: right;
        opacity: 0.4;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }
}

.submit_box {
    .v-btn {
        margin-top: 14px;
    }
}

.summary {
    border-left: 2px solid var(--bg-light);
    padding-left: 30px;

    > div {
        margin-bottom: 14px;

        p {
            font-size: 24px;
        }
    }

    .err {
        margin: 14px 0 !important;
        font-size: 14px;
    }
}

.success_cont {
    .check {
        font-size: 4em;
        color: var(--success);
    }

    .tx_id {
        font-size: 13px;
        color: var(--primary-color-light);
        word-break: break-all;
        margin: 14px 0 !important;
        font-weight: bold;
    }
}

.reward_in {
    transition-duration: 0.2s;

    &[type='local'] {
        .reward_addr_in {
            opacity: 0.3;
            user-select: none;
            pointer-events: none;
        }
    }
}

.reward_tabs {
    margin-bottom: 8px;
    font-size: 13px;

    button {
        color: var(--primary-color-light);

        &:hover {
            color: var(--primary-color);
        }

        &[selected] {
            color: var(--secondary-color);
        }
    }

    span {
        margin: 0px 12px;
    }
}

.amount_warning {
    color: var(--warning);
}

.tx_status {
    display: flex;
    justify-content: space-between;

    .status_icon {
        align-items: center;
        display: flex;
        font-size: 24px;
    }
}

.tx_status,
.reason_cont {
    background-color: var(--bg-light);
    padding: 4px 12px;
    margin-bottom: 6px;
}

@include main.mobile-device {
    form {
        grid-template-columns: 1fr;
    }

    .dates {
        grid-template-columns: 1fr;
    }

    .amt_in {
        width: 100%;
    }

    .summary {
        border-left: none;
        border-top: 2px solid var(--bg-light);
        padding-left: 0;
        padding-top: 30px;
    }
}
</style>
