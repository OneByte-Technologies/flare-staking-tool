<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div key="form" class="ins_col">
                        <div class="address-container" style="margin-top: 0px">
                            <h4 class="light-heading">This is your original P Chain Address</h4>
                            <p class="address-style" style="padding-bottom: 0px">
                                {{ basePChainAddress }}
                            </p>
                        </div>
                        <div class="address-container">
                            <h4 class="light-heading">This is your encoded P Chain Address</h4>
                            <p class="address-style">{{ encodePChainAddressToRegister }}</p>
                            <input
                                type="text"
                                v-model="encodePChainAddressToRegister"
                                style="width: 100%"
                                placeholder="P chain address"
                            />
                        </div>
                        <div class="address-container">
                            <h4 class="light-heading">This is your C Chain Address</h4>
                            <p class="address-style">
                                {{ cChainAddressBinder }}
                            </p>
                            <input
                                type="text"
                                v-model="cChainAddress"
                                style="width: 100%"
                                placeholder="C chain address"
                            />
                            <div class="summary-warn">
                                {{ $t('staking.addressBinder.summary.warn') }}
                            </div>
                        </div>
                        <div class="address-container">
                            <h4 class="light-heading">This is your Public Key</h4>
                            <p class="address-style">
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
                            @click="bindAddress"
                            block
                            :class="[
                                'button_secondary',
                                {
                                    'disabled-button':
                                        isAddressBindingPending ||
                                        registered ||
                                        isInsufficientFunds,
                                },
                            ]"
                            depressed
                        >
                            <span style="margin-right: 4px">Bind address</span>
                            <fa v-if="isAddressBindingPending" icon="cog" spin></fa>
                        </v-btn>
                        <div v-if="isInsufficientFunds" class="summary-warn">
                            <p>
                                <fa icon="times-circle"></fa>
                                {{ $t('staking.addressBinder.summary.insufficientFunds') }}
                            </p>
                        </div>
                        <div class="summary-warn">
                            <div v-if="bindingError" style="text-transform: capitalize">
                                <fa icon="times-circle" style="margin-right: 4px"></fa>
                                <span>{{ bindingError }}</span>
                                <Tooltip
                                    v-if="bindingDetailedError"
                                    style="display: inline-block; margin-left: 4px"
                                    :text="bindingDetailedError"
                                >
                                    <fa icon="question-circle"></fa>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { WalletType, WalletNameType } from '@/js/wallets/types'
import { Vue, Component } from 'vue-property-decorator'
import {
    defaultContractAddresses,
    getAddressBinderABI,
    getFlareContractRegistryABI,
    addressBinderContractName,
} from './FlareContractConstants'
import { ethers } from 'ethers'
import { bech32 } from 'bech32'
import { ava } from '@/AVA'
import Tooltip from '@/components/misc/Tooltip.vue'
import { BN } from 'avalanche'

@Component({
    components: { Tooltip },
})
export default class AddressBinder extends Vue {
    success: boolean = false //old
    registered: boolean = false //old
    isAddressBindingPending = false
    isInsufficientFunds: boolean = false
    bindingError: string = ''
    bindingDetailedError: string = ''
    cChainAddress: string = ''

    get ethersWallet(): any {
        return new ethers.Wallet(this.$store.state.activeWallet.ethKey)
    }

    get pubKey(): string {
        return this.$store.state.activeWallet.type === 'ledger'
            ? this.$store.state.activeWallet.publicKey
            : this.ethersWallet.publicKey
    }

    get wallet(): WalletType {
        return this.$store.state.activeWallet
    }

    get basePChainAddress(): string {
        const addr = this.wallet.getAllAddressesP()
        return addr[0]
    }

    get encodePChainAddressToRegister(): string {
        return (
            '0x' +
            Buffer.from(
                bech32.fromWords(bech32.decode(this.basePChainAddress.slice(2)).words)
            ).toString('hex')
        )
    }

    async bindAddress() {
        this.isAddressBindingPending = true
        this.bindingError = ''
        this.bindingDetailedError = ''
        try {
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
                this.encodePChainAddressToRegister,
                cAddress,
                { from: cAddress }
            )
            console.log('P-chain Address acc to tx', this.encodePChainAddressToRegister)
            console.log('Gas Estimate', gasEstimate)
            const gasPrice = await provider.getGasPrice()
            console.log('Gas Price', gasPrice)
            const balance = ethers.BigNumber.from((await this.getEthBalance()).toString())
            const gasCost = gasEstimate.mul(gasPrice) // Calculate the gas cost
            const hasEnoughFunds = balance.gte(gasCost)

            if (!hasEnoughFunds) {
                console.log('Insufficient funds')
                // Store a variable for use in the template
                this.isInsufficientFunds = true
                this.isAddressBindingPending = false
                return
            }

            const populatedTx = await contract.populateTransaction.registerAddresses(
                this.pubKey,
                this.encodePChainAddressToRegister,
                cAddress.toLowerCase()
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
            let signedTx

            if (this.wallet.type === 'ledger') {
                const serializedUnsignedTx = ethers.utils.serializeTransaction(unsignedTx)
                const txHash = ethers.utils.keccak256(serializedUnsignedTx).slice(2)
                const txBuffer = Buffer.from(txHash, 'hex')
                let signature = ''
                try {
                    signature = await this.wallet.signContractLedger(txBuffer)
                } catch (e) {
                    console.log(e)
                    this.isAddressBindingPending = false
                    this.bindingError = 'Ledger Device: Rejected Signing'
                    return
                }

                signedTx = ethers.utils.serializeTransaction(unsignedTx, '0x' + signature)
            } else {
                signedTx = await this.ethersWallet.signTransaction(unsignedTx)
            }
            const txId = await contract.provider.sendTransaction(signedTx)
            console.log('txId', txId)
            await txId.wait()
            const result = await contract.cAddressToPAddress(cAddress)

            if (result && result !== '0x0000000000000000000000000000000000000000') {
                console.log('Success. You are registered')
                this.registered = true
                this.onSuccess()
            } else {
                console.log('Please Register')
                this.registered = false
                this.onFail()
            }
        } catch (e: any) {
            const genericError =
                'Something went wrong while binding your address. Please try again.'
            this.bindingError = e?.reason || genericError
            this.bindingDetailedError = e?.error?.message || ''
        }
        this.isAddressBindingPending = false
    }

    onSuccess() {
        this.success = true
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Binding Complete',
            message: 'You have registered',
        })
        this.$store.dispatch('updateIsRegistered')
    }

    onFail() {
        this.success = false
        this.$store.dispatch('Notifications/add', {
            type: 'Fail',
            title: 'Binding Error',
            message: 'Please register again',
        })
    }

    async getEthBalance() {
        const bal: BN = await this.$store.state.activeWallet.getEthBalance()
        return bal
    }

    privateKeyC(): string | null {
        // if (this.walletType() !== 'ledger') {
        let wallet = this.$store.state.activeWallet
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

    get cChainAddressBinder() {
        let wallet = this.activeWallet
        if (!wallet) {
            this.cChainAddress = '-'
        } else {
            this.cChainAddress = wallet.getEvmChecksumAddress()
        }
        return this.cChainAddress.toLowerCase()
    }

    get activeWallet(): WalletType | null {
        return this.$store.state.activeWallet
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

.light-heading {
    font-weight: 400;
    margin-top: 30px;
}

.address-container {
    margin: 30px 0px;
}

.address-style {
    color: #6e7479;
    padding-bottom: 10px;
    font-size: 12px;
    word-break: break-all;
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
    color: var(--error);
    margin-top: 4px;
    font-size: 14px;
}

.disabled-button {
    opacity: 0.4;
    pointer-events: none;
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
