<template>
    <div class="earn_page">
        <div class="header">
            <h1>{{ $t('staking.title') }}</h1>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel">
                    <fa icon="times"></fa>
                </span>
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!pageNow">
                <p>{{ $t('staking.desc') }}</p>
                <div class="options">
                    <div>
                        <h4 class="title">
                            {{ $t('staking.address_binder_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('staking.address_binder_card.desc') }}
                        </p>
                        <div>
                            <div v-if="!registered">
                                <p class="no_balance">
                                    {{ $t('staking.warning_3') }}
                                </p>
                            </div>
                            <div v-else>
                                <p class="no_balance">
                                    {{ $t('staking.warning_4') }}
                                </p>
                            </div>
                        </div>
                        <v-btn
                            class="button_secondary"
                            data-cy="addressBinder"
                            @click="addressBinderPage"
                            depressed
                            small
                        >
                            {{ $t('staking.address_binder_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('staking.transfer_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('staking.transfer_card.desc') }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="swap"
                            @click="transfer"
                            depressed
                            small
                        >
                            {{ $t('staking.transfer_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('staking.delegate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('staking.delegate_card.desc') }}
                        </p>
                        <p class="no_balance">
                            {{ $t('staking.warning_2', [minDelegationAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="delegate"
                            @click="addDelegator"
                            depressed
                            small
                        >
                            {{ $t('staking.delegate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('staking.validate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('staking.validate_card.desc') }}
                        </p>
                        <p class="no_balance">
                            {{ $t('staking.warning_1', [minStakeAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="validate"
                            @click="addValidator"
                            depressed
                            small
                        >
                            {{ $t('staking.validate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('staking.rewards_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('staking.rewards_card.desc') }}
                        </p>
                        <v-btn class="button_secondary" @click="viewRewards" depressed small>
                            View Estimated Rewards
                        </v-btn>
                        <v-btn
                            class="button_secondary"
                            v-if="unclaimedRewards.gt(0)"
                            @click="claimRewards"
                            depressed
                            small
                        >
                            Claim Rewards
                        </v-btn>
                    </div>
                </div>
                <!--                <v-btn @click="viewRewards" depressed small>View Estimated Rewards</v-btn>-->
            </div>
            <div v-else>
                <component :is="pageNow" class="comp" @cancel="cancel"></component>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import AddValidator from '@/components/wallet/earn/Validate/AddValidator.vue'
import AddDelegator from '@/components/wallet/earn/Delegate/AddDelegator.vue'
import Register from '@/components/wallet/earn/Register.vue'
import { BN } from 'avalanche/dist'
import UserRewards from '@/components/wallet/earn/UserRewards.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { checkUnclaimedRewards, claimRewards } from '@/js/ValidatorRewardManager'
import { ethers } from 'ethers'
// import { isAddressRegistered, registerAddress } from '@/views/wallet/FlareContract'
import { ava } from '@/AVA'
import { ClaimRewardsInterface, RegisterAddressInterface, UnsignedTxJson } from './Interfaces'
import { issueC } from '@/helpers/issueTx'
import AddressBinder from '@/components/wallet/earn/AddressBinder/AddressBinder.vue'

@Component({
    name: 'earn',
    components: {
        UserRewards,
        AddValidator,
        AddDelegator,
        AddressBinder,
    },
})
export default class Earn extends Vue {
    pageNow: any = null
    subtitle: string = ''
    intervalID: any = null
    registered: boolean = false

    async isRegistered(): Promise<Boolean> {
        const wallet = this.$store.state.activeWallet
        const cHexAddr = wallet.getEvmChecksumAddress()
        const network: string = ava.getHRP()
        console.log('Network ??????', network)
        console.log(cHexAddr, 'cHexAddr')
        // this.registered = await isAddressRegistered(cHexAddr, network)
        return this.registered
    }

    async addressBinder() {
        // this.pageNow = AddressBinder
        const wallet = this.$store.state.activeWallet
        const network: string = ava.getHRP()
        const cAddress = wallet.getEvmChecksumAddress()
        const pAddress = wallet.getCurrentAddressPlatform()
        const publicKey: string = ''
        // const registerParams: RegisterAddressInterface = { publicKey, pAddress, cAddress, network, wallet1, dPath, pvtKey, txId }
        // const unsignedTx: object = registerAddress(registerParams)
        //issueC() + signC() ??
        console.log('Address Binding Completed')
    }
    addressBinderPage() {
        this.pageNow = 'AddressBinder'
        this.subtitle = 'Address Binder'
    }

    addValidator() {
        this.pageNow = AddValidator
        this.subtitle = this.$t('staking.subtitle1') as string
    }
    addDelegator() {
        this.pageNow = AddDelegator
        this.subtitle = this.$t('staking.subtitle2') as string
    }
    transfer() {
        this.$router.replace('/wallet/cross_chain')
    }
    unclaimedRewards: ethers.BigNumber = ethers.BigNumber.from(0)

    async viewRewards() {
        const config = {
            userAddress: '', // replace with the actual user address
            recipientAddress: '', // replace with the actual recipient address
            wrap: false, // replace with the actual wrap value
        }

        try {
            const rewardsInfo = await checkUnclaimedRewards(config)
            this.unclaimedRewards = rewardsInfo.totalReward.sub(rewardsInfo.claimedReward)
            console.log('Unclaimed rewards:', this.unclaimedRewards.toString())
        } catch (error) {
            console.error('Error checking unclaimed rewards on Coston2:', error)
        }
    }

    async claimRewards() {
        const config = {
            userAddress: '', // replace with the actual user address
            recipientAddress: '', // replace with the actual recipient address
            wrap: false, // replace with the actual wrap value
        }

        try {
            await claimRewards(config)
            console.log('Rewards claimed successfully on Coston2!')
            this.unclaimedRewards = ethers.BigNumber.from(0)
        } catch (error) {
            console.error('Error claiming rewards on Coston2:', error)
        }
    }
    cancel() {
        this.pageNow = null
        this.subtitle = ''
    }

    deactivated() {
        this.cancel()
    }

    destroyed() {
        clearInterval(this.intervalID)
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance'].available
    }

    get platformLockedStakeable(): BN {
        // return this.$store.getters.walletPlatformBalanceLockedStakeable
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get totBal(): BN {
        return this.platformUnlocked.add(this.platformLockedStakeable)
    }

    get pNoBalance() {
        return this.platformUnlocked.add(this.platformLockedStakeable).isZero()
    }

    get canDelegate(): boolean {
        let bn = this.$store.state.Platform.minStakeDelegation
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get canValidate(): boolean {
        let bn = this.$store.state.Platform.minStake
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get minStakeAmt(): Big {
        let bn = this.$store.state.Platform.minStake
        return bnToBig(bn, 9)
    }

    get minDelegationAmt(): Big {
        let bn = this.$store.state.Platform.minStakeDelegation
        return bnToBig(bn, 9)
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
}

.header {
    h1 {
        font-weight: normal;
    }

    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    .subtitle {
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}

.options {
    margin: 30px 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 14px;
    //display: flex;
    //justify-content: space-evenly;
    //padding: 60px;

    > div {
        width: 100%;
        justify-self: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        //max-width: 260px;
        padding: 30px;
        border-radius: 4px;
        background-color: var(--bg-light);
    }

    h4 {
        font-size: 32px !important;
        font-weight: lighter;
        color: var(--primary-color-light);
    }

    p {
        /*color: var(--primary-color-light);*/
        margin: 14px 0 !important;
    }

    .no_balance {
        color: var(--secondary-color);
    }

    .v-btn {
        margin-top: 14px;
    }
}

span {
    color: var(--primary-color-light);
    opacity: 0.5;
    float: right;
    font-weight: lighter;
}

.cancel {
    font-size: 13px;
    color: var(--secondary-color);
    justify-self: flex-end;
}

.comp {
    margin-top: 14px;
}

@include main.medium-device {
    .options {
        grid-template-columns: 1fr 1fr;
    }
}

@include main.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }
}
</style>
