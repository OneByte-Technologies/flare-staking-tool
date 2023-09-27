<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div v-show="!isConfirm" key="form" class="ins_col">
                        <div style="margin-bottom: 30px">
                            <h4>This is your original P chain address:</h4>
                            <p style="padding-bottom: 30px; color: #6e7479">
                                {{ pChainAddress }}
                            </p>
                            <h4>This is your encoded P chain Address</h4>
                            <p style="padding-bottom: 10px; color: #6e7479">{{ pAddress }}</p>
                            <input
                                type="text"
                                v-model="pAddress"
                                style="width: 100%"
                                placeholder="P chain address"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>This is your C chain address</h4>
                            <p style="padding-bottom: 10px; color: #6e7479">
                                {{ cChainAddressBinder }}
                            </p>
                            <input
                                type="text"
                                v-model="cChainAddress"
                                style="width: 100%"
                                placeholder="C chain address"
                            />
                            <p class="summary-warn">
                                {{ $t('staking.addressBinder.summary.warn') }}
                            </p>
                        </div>
                        <div style="margin: 30px 0">
                            <h4>This is your Public Key</h4>
                            <p
                                style="
                                    padding-bottom: 10px;
                                    color: #6e7479;
                                    word-break: break-all;
                                    font-size: 10px;
                                "
                            >
                                {{ pubKey }}
                            </p>
                            <input
                                type="text"
                                v-model="pubKey"
                                style="width: 100%"
                                placeholder="publickey"
                            />
                        </div>
                        <div v-if="success" class="complete">
                            <h4>{{ $t('staking.transfer.success.titleAddressBind') }}</h4>
                            <p style="color: var(--success); margin: 12px 0 !important">
                                <fa icon="check-circle"></fa>
                                {{ $t('staking.transfer.success.messageAddressBind') }}
                            </p>
                        </div>
                        <v-btn
                            v-else
                            v-bind:disabled="isDisabled"
                            @click="bindAddress"
                            block
                            class="button_secondary"
                            depressed
                        >
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
import {
    defaultContractAddresses,
    getAddressBinderABI,
    getFlareContractRegistryABI,
    addressBinderContractName,
} from './FlareContractConstants'
import { ethers } from 'ethers'
import { bech32 } from 'bech32'
import { cChain } from '@/AVA'
import { KeyChain } from 'avalanche/dist/apis/evm'
import { ava } from '@/AVA'
import Tooltip from '@/components/misc/Tooltip.vue'

@Component({})
export default class AddressBinder extends Vue {
    success: boolean = false
    registered: boolean = false
    isDisabled = false
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
        this.isDisabled = true
        this.$store.dispatch('Notifications/add', {
            type: 'In Progress',
            title: 'Ongoing Registration',
            message: 'Please wait for a moment',
        })
        const cAddress = this.wallet.getEvmChecksumAddress()
        this.cChainAddress = cAddress
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress = await this.getContractAddress(
            ava.getHRP(),
            addressBinderContractName
        )
        const abi = getAddressBinderABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const nonce = await provider.getTransactionCount(cAddress)

        const gasEstimate = await contract.estimateGas.registerAddresses(
            this.pubKey,
            this.pAddress,
            cAddress,
            { from: cAddress }
        )
        console.log('P-chain Address acc to tx', this.pAddress)
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
        const result = await contract.cAddressToPAddress(cAddress)

        if (result !== '0x0000000000000000000000000000000000000000') {
            console.log('Success. You are registered')
            this.registered = true
            this.onSuccess()
        } else {
            console.log('Please Register')
            this.registered = false
            this.onFail()
        }
    }

    onSuccess() {
        this.success = true
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Binding Complete',
            message: 'You have registered',
        })
    }

    onFail() {
        this.success = false
        this.$store.dispatch('Notifications/add', {
            type: 'Fail',
            title: 'Binding Error',
            message: 'Please register again',
        })
    }

    get activeWallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    privateKeyC(): string | null {
        // if (this.walletType() !== 'ledger') {
        let wallet = this.$store.state.activeWallet
        return wallet.ethKey
        // } else return null
    }

    get ethBalance() {
        const ethersWallet = new ethers.Wallet(this.$store.state.activeWallet.ethKey)
        return ethersWallet.getBalance()
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

    get cChainAddressBinder() {
        let wallet = this.activeWallet
        if (!wallet) {
            this.cChainAddress = '-'
        } else {
            this.cChainAddress = wallet.getEvmChecksumAddress()
        }
        return this.cChainAddress
    }

    async getContractAddress(network: string, contractName: string): Promise<string> {
        const rpcUrl = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

        const abi = getFlareContractRegistryABI() as ethers.ContractInterface
        if (network != 'flare' && network != 'costwo') throw new Error('Invalid network passed')
        const contract = new ethers.Contract(
            defaultContractAddresses.flareContractRegistryAddress[network],
            abi,
            provider
        )

        const result = await contract.getContractAddressByName(contractName)

        if (result !== '0x0000000000000000000000000000000000000000') return result

        const defaultAddress = defaultContractAddresses[contractName]?.[network]
        if (defaultAddress) return defaultAddress

        throw new Error('Contract Address not found')
    }
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

.summary-desc {
    word-break: break-all;
    font-size: 10px;
    color: #fff;
    font-style: italic;
}

.summary-descP {
    word-break: break-all;
    font-size: 10px;
    color: #fff;
    font-style: italic;
    padding-bottom: 1rem;
}

.summary-warn {
    color: red;
    font-style: italic;
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
