<template v-if="true">
    <!-- <div>
        <template v-if="totLength > 0">
            <div>
                <label>{{ $t('staking.rewards.total') }}</label>
                <p class="amt">{{ totalRewardBig.toLocaleString(9) }} FLR</p>
            </div>
            <div v-if="validatorTxs.length > 0">
                <h3>{{ $t('staking.rewards.validation') }}</h3>
                <UserRewardRow
                    v-for="v in validatorTxs"
                    :key="v.txHash"
                    :tx="v"
                    class="reward_row"
                ></UserRewardRow>
            </div>

            <div v-if="delegatorTxs.length > 0">
                <h3>{{ $t('staking.rewards.delegation') }}</h3>
                <UserRewardRow
                    v-for="v in delegatorTxs"
                    :key="v.txHash"
                    :tx="v"
                    class="reward_row"
                ></UserRewardRow>
            </div>
        </template> -->
    <template>
        <div>
            <div>
                <label>
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
        </div>
    </template>
    <!-- <template v-else>
            <p style="text-align: center">{{ $t('staking.rewards.empty') }}</p>
        </template> -->
    <template v-if="!rewardExist">
        <div :class="{ 'disabled-card-parent': !isRewards }">
            <div :class="{ 'disabled-card': !isRewards }">
                <v-btn class="button_secondary" @click="claimRewards">
                    {{ $t('staking.rewards_card.submit2') }}
                </v-btn>
            </div>
        </div>
    </template>
    <!--</div>-->
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

@Component({
    components: {
        UserRewardRow,
    },
})
export default class UserRewards extends Vue {
    updateInterval: ReturnType<typeof setInterval> | undefined = undefined
    isRewards: boolean = false
    rewardsAmt: BN = new BN(0)
    totalRewardNumber: BN = new BN(0)
    claimedRewardNumber: BN = new BN(0)
    unclaimedRewards: BN = this.totalRewardNumber.sub(this.claimedRewardNumber)

    get userAddresses() {
        let wallet: AvaWalletCore = this.$store.state.activeWallet
        if (!wallet) return []

        return wallet.getAllAddressesP()
    }

    created() {
        this.$store.dispatch('Earn/refreshRewards')

        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.$store.dispatch('Earn/refreshRewards')
        }, 5 * 60 * 1000)
    }

    destroyed() {
        // Clear interval if exists
        this.updateInterval && clearInterval(this.updateInterval)
    }

    async claimRewards() {
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
        this.rewardsAmt = unclaimedRewards
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
                unclaimedRewards.toString(),
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
            unclaimedRewards,
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

.amt {
    font-size: 2em;
}
</style>
