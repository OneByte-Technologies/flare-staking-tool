<template>
    <div style="max-width: 490px">
        <div>
            <div class="grid">
                <div>
                    <label style="text-align: center">
                        {{ $t('staking.rewards.total') }}
                    </label>
                    <p>
                        {{ totalRewardNumber.toString() }}
                    </p>
                </div>
                <div>
                    <label>
                        {{ $t('staking.rewards.claimed') }}
                    </label>
                    <p>
                        {{ claimedRewardNumber.toString() }}
                    </p>
                </div>
                <div>
                    <label>
                        {{ $t('staking.rewards.unclaimed') }}
                    </label>
                    <p>
                        {{ unclaimedRewards.toString() }}
                    </p>
                </div>
                <div>
                    <label>{{ $t('staking.rewards.claim') }}</label>
                    <AvaxInput :max="unclaimedRewards" v-model="rewardsAmt"></AvaxInput>
                </div>
                <div class="claimbutton">
                    <v-btn @click="claimRewards" :disabled="!isRewardAmountValid()">
                        {{ $t('staking.rewards_card.submit') }}
                    </v-btn>
                </div>
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
} from '@/views/wallet/FlareContractConstants'
import AvaxInput from '@/components/misc/AvaxInput.vue'

@Component({
    components: {
        UserRewardRow,
        AvaxInput,
    },
})
export default class UserRewards extends Vue {
    @Prop() maxAmt!: BN
    updateInterval: ReturnType<typeof setInterval> | undefined = undefined
    isRewards: boolean = false
    rewardsAmt: BN = new BN(0)
    totalRewardNumber: BN = new BN(0)
    claimedRewardNumber: BN = new BN(0)
    unclaimedRewards: BN = this.totalRewardNumber.sub(this.claimedRewardNumber)

    async viewRewards() {
        const wallet = this.$store.state.activeWallet
        const cAddress = wallet.getEvmChecksumAddress()
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress: string = defaultContractAddresses.ValidatorRewardManager.costwo
        const abi = getValidatorRewardManagerABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const rewards = await contract.getStateOfRewards(cAddress)
        const totalRewardNumber: BN = rewards[0]
        this.totalRewardNumber = totalRewardNumber
        const claimedRewardNumber: BN = rewards[1]
        this.claimedRewardNumber = claimedRewardNumber
        const unclaimedRewards: BN = totalRewardNumber.sub(claimedRewardNumber)
        this.unclaimedRewards = unclaimedRewards
        console.log('Unclaimed Rewards To String', unclaimedRewards.toString())
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

    isRewardAmountValid(): boolean {
        const rewardAmt = this.rewardsAmt.toNumber() // Assuming rewardsAmt is a BN
        const unclaimedAmt = this.unclaimedRewards.toNumber() // Assuming unclaimedRewards is a BN

        return rewardAmt > 0 && rewardAmt <= unclaimedAmt
    }

    async claimRewards() {
        const wallet = this.$store.state.activeWallet
        const cAddress = wallet.getEvmChecksumAddress()
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress: string = defaultContractAddresses.ValidatorRewardManager.costwo
        const abi = getValidatorRewardManagerABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        console.log(
            'Rewardsamt?????????',
            this.rewardsAmt,
            this.totalRewardNumber,
            this.claimedRewardNumber
        )
        this.isRewards = true
        const nonce = await provider.getTransactionCount(cAddress)
        let gasEstimate
        try {
            gasEstimate = await contract.estimateGas.claim(
                cAddress,
                cAddress,
                this.unclaimedRewards.toString(),
                false,
                {
                    from: cAddress,
                }
            )
        } catch {
            console.log('Incorrect arguments passed')
        }
        const gasPrice = await provider.getGasPrice()
        console.log('gas Price', gasPrice, 'gas Estimate', gasEstimate)
        const populatedTx = await contract.populateTransaction.claim(
            cAddress,
            cAddress,
            this.unclaimedRewards,
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
        // const txId = wallet.signC(unsignedTx)
        const ethersWallet = new ethers.Wallet(wallet.ethKey)
        const signedTx = await ethersWallet.signTransaction(unsignedTx)
        const txId = await contract.provider.sendTransaction(signedTx)
        console.log('txId', txId)
        // return unclaimedRewards
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

    // get maxAmt(): BN {
    //     let max = this.unclaimedRewards
    //     max = max.sub(this.gasFee)
    // }

    get rewardExist() {
        if (this.unclaimedRewards === new BN(0)) return false
        return true
    }

    get rewardBig(): Big {
        return Big(this.rewardsAmt.toString()).div(Math.pow(10, 9))
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
}
</script>
<style scoped lang="scss">
.user_rewards {
    padding-bottom: 5vh;
}

.box {
    display: flex;
    border: 1px solid white;
    padding: 10px;
}

.box > div {
    flex: 1; /* Equal width for both columns */
    margin-right: 10px;
}

.reward_row {
    margin-bottom: 12px;
}

.disabled-card {
    opacity: 0.4;
    pointer-events: none;
}

.disabled-card-parent::after {
    content: 'No Rewards';
    position: absolute;
    top: 50%; /* Center vertically from the top */
    left: 50%; /* Center horizontally from the left */
    transform: translate(-50%, -50%); /* Center alignment */
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    text-align: center;
    opacity: 0.9;
    z-index: 1;
    border: 2px solid #3498db;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    font-weight: bold;
    color: #333;
    width: 95%;
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
    grid-template-columns: 1fr; /* Start with one column */
    grid-row-gap: 20px;
    border: 1px solid white;
    padding: 10px;
}

@media (min-width: 600px) {
    .grid {
        grid-template-columns: repeat(2, 1fr); /* Two columns for larger screens */
    }
}

.claimbutton {
    margin-top: 20px;
    align-items: center;
    grid-column: span 2;
    display: flex;
    justify-content: center;
}

.amt {
    font-size: 2em;
}
</style>
