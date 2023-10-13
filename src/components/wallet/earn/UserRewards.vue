<template>
    <div>
        <div class="grid">
            <div>
                <label style="text-align: center">
                    {{ $t('staking.rewards.total') }}
                </label>
                <p>
                    {{ rewardBig(totalRewardNumber) }}
                </p>
            </div>
            <div>
                <label>
                    {{ $t('staking.rewards.claimed') }}
                </label>
                <p>
                    {{ rewardBig(claimedRewardNumber) }}
                </p>
            </div>
            <div>
                <label>
                    {{ $t('staking.rewards.unclaimed') }}
                </label>
                <p>
                    {{ rewardBig(unclaimedRewards) }}
                </p>
            </div>
            <div>
                <label>{{ $t('staking.rewards.claim') }}</label>
                <AvaxInput
                    :max="unclaimedRewards"
                    v-model="inputReward"
                    :symbol="symbol"
                ></AvaxInput>
            </div>
            <div class="claimbutton">
                <p class="err">{{ err }}</p>
                <v-btn
                    v-if="canClaim"
                    @click="claimRewards"
                    :disabled="!isRewardValid()"
                    :class="[
                        'button_secondary',
                        {
                            'disabled-button': isClaimRewardPending,
                        },
                    ]"
                >
                    {{ $t('staking.rewards_card.submit') }}
                    <fa style="margin-left: 4px" v-if="isClaimRewardPending" icon="cog" spin></fa>
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaWalletCore } from '../../../js/wallets/types'
import UserRewardRow from '@/components/wallet/earn/UserRewardRow.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { BN } from 'avalanche'
import { EarnState } from '@/store/modules/earn/types'
import { ava } from '@/AVA'
import { ethers } from 'ethers'
import {
    defaultContractAddresses,
    getValidatorRewardManagerABI,
    getFlareContractRegistryABI,
    validatorRewardManagerContractName,
} from '@/views/wallet/FlareContractConstants'
import AvaxInput from '@/components/misc/AvaxInput.vue'

@Component({
    components: {
        UserRewardRow,
        AvaxInput,
    },
})
export default class UserRewards extends Vue {
    updateInterval: ReturnType<typeof setInterval> | undefined = undefined
    canClaim: boolean = false
    totalRewardNumber: BN = new BN(0)
    claimedRewardNumber: BN = new BN(0)
    unclaimedRewards: BN = this.totalRewardNumber.sub(this.claimedRewardNumber)
    inputReward: BN = new BN(0)
    isClaimRewardPending = false
    err = ''
    sendTo: string = 'myWallet' // Default to 'My Wallet'
    customAddress: string = ''

    async viewRewards() {
        const wallet = this.$store.state.activeWallet
        const cAddress = wallet.getEvmChecksumAddress()
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress = await this.getContractAddress(
            ava.getHRP(),
            validatorRewardManagerContractName
        )
        const abi = getValidatorRewardManagerABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const rewards = await contract.getStateOfRewards(cAddress)
        const totalRewardNumber: BN = new BN(rewards[0].toString())
        this.totalRewardNumber = totalRewardNumber
        const claimedRewardNumber: BN = new BN(rewards[1].toString())
        this.claimedRewardNumber = claimedRewardNumber
        const unclaimedRewards: BN = totalRewardNumber.sub(claimedRewardNumber)
        this.unclaimedRewards = unclaimedRewards
        console.log('Unclaimed Rewards To String', unclaimedRewards.toString())
        this.rewardExist()
    }

    async mounted() {
        console.log('mounted')
        this.viewRewards()
    }

    get userAddresses() {
        let wallet: AvaWalletCore = this.$store.state.activeWallet
        if (!wallet) return []

        return wallet.getAllAddressesP()
    }

    created() {
        this.$store.dispatch('Earn/refreshRewards')
        this.$store.dispatch('Earn/rewardCheck')

        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.$store.dispatch('Earn/refreshRewards')
        }, 5 * 60 * 1000)
    }

    destroyed() {
        // Clear interval if exists
        this.updateInterval && clearInterval(this.updateInterval)
    }

    isRewardValid(): boolean {
        const rewardAmt = this.inputReward.mul(new BN(1000000000))
        console.log('Reward Amount ', rewardAmt)
        return rewardAmt.gte(new BN(0)) && this.unclaimedRewards.gte(rewardAmt)
    }

    async claimRewards() {
        try {
            this.isClaimRewardPending = true
            const wallet = this.$store.state.activeWallet
            const cAddress = wallet.getEvmChecksumAddress()
            const recipientAddress = this.sendTo === 'anotherWallet' ? this.customAddress : cAddress
            const rpcUrl: string = this.getIp()
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
            const contractAddress = await this.getContractAddress(
                ava.getHRP(),
                validatorRewardManagerContractName
            )
            const abi = getValidatorRewardManagerABI() as ethers.ContractInterface
            const contract = new ethers.Contract(contractAddress, abi, provider)
            const nonce = await provider.getTransactionCount(cAddress)
            let gasEstimate
            try {
                gasEstimate = await contract.estimateGas.claim(
                    cAddress,
                    recipientAddress,
                    this.inputReward.mul(new BN(1000000000)).toString(),
                    false,
                    {
                        from: cAddress,
                    }
                )
            } catch (error) {
                console.log('error', error)
                console.log('Incorrect arguments passed')
            }
            const gasPrice = await provider.getGasPrice()
            console.log('gas Price', gasPrice, 'gas Estimate', gasEstimate)
            const populatedTx = await contract.populateTransaction.claim(
                cAddress,
                recipientAddress,
                this.inputReward.mul(new BN(1000000000)).toString(),
                false
            )
            console.log('Populated Tx', populatedTx)
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

            if (wallet.type === 'ledger') {
                const serializedUnsignedTx = ethers.utils.serializeTransaction(unsignedTx)
                const txHash = ethers.utils.keccak256(serializedUnsignedTx).slice(2)
                const txBuffer = Buffer.from(txHash, 'hex')
                let signature = ''
                try {
                    signature = await wallet.signContractLedger(txBuffer)
                } catch (e: any) {
                    console.log(e)
                    this.isClaimRewardPending = false
                    if (e.includes('Rejected')) {
                        this.err = 'Ledger Device: Rejected Signing'
                    } else {
                        this.err = e.message
                    }
                    throw this.err
                }

                signedTx = ethers.utils.serializeTransaction(unsignedTx, '0x' + signature)
            } else {
                const ethersWallet = new ethers.Wallet(wallet.ethKey)
                signedTx = await ethersWallet.signTransaction(unsignedTx)
            }

            const txId = await contract.provider.sendTransaction(signedTx)
            this.isClaimRewardPending = false
            console.log('txId', txId)
            this.viewRewards()
            this.$store.dispatch('Notifications/add', {
                title: 'Claim Reward',
                message: 'Reward claimed successfully',
                type: 'success',
            })
        } catch (e: any) {
            this.isClaimRewardPending = false
            const msg: string = e.message
            if (msg.includes('0x6986')) {
                this.err = 'Ledger Device: Rejected Signing'
            } else {
                this.err = e.message
            }
            throw this.err
        }
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
    get symbol() {
        let symbol = ''
        if (ava.getNetworkID() === 2) {
            symbol = 'FLR'
        } else if (ava.getNetworkID() === 114) {
            symbol = 'C2FLR'
        }
        return symbol
    }

    rewardExist() {
        if (this.unclaimedRewards.eq(new BN(0))) {
            this.canClaim = false
        }
        this.canClaim = true
    }

    rewardBig(amt: BN): Big {
        return Big(amt.toString()).div(Math.pow(10, 18))
    }

    get stakingTxs() {
        return this.$store.state.Earn.stakingTxs as EarnState['stakingTxs']
    }

    get validatorTxs() {
        return this.stakingTxs.filter((tx) => tx.txType === 'AddValidatorTx')
    }

    get delegatorTxs() {
        return this.stakingTxs.filter((tx) => tx.txType === 'AddDelegatorTx')
    }

    get totLength() {
        return this.validatorTxs.length + this.delegatorTxs.length
    }

    get totalReward() {
        let tot = this.stakingTxs.reduce((acc, val) => {
            return acc.add(new BN(val.estimatedReward ?? 0))
        }, new BN(0))
        return tot
    }

    get totalRewardBig(): Big {
        return bnToBig(this.totalReward, 9)
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
@use '../../../main';
.disabled-button {
    opacity: 0.4;
    pointer-events: none;
}
.user_rewards {
    padding-bottom: 5vh;
}

.reward_row {
    margin-bottom: 12px;
}

h3 {
    margin-top: 0.3em;
    font-size: 2em;
    color: var(--primary-color-light);
    font-weight: lighter;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.grid {
    margin: 20px auto;
    width: 100%; /* Set width to 100% for responsiveness */
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-row-gap: 20px;
    padding: 10px;
}

@include main.mobile-device {
    .grid {
        display: block;
    }
    .grid > div {
        margin: 10px;
    }
}

.err {
    margin: 14px 0 !important;
    font-size: 14px;
}

.claimbutton {
    margin-top: 20px;
    align-items: center;
    grid-column: span 2;
    display: flex;
    justify-content: center;
}
</style>
