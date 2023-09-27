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
                            v-if="!registered"
                            class="button_secondary"
                            data-cy="addressBinder"
                            @click="addressBinder"
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
                    <div :class="{ 'disabled-card-parent': !registered }">
                        <div :class="{ 'disabled-card': !registered }">
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
                                v-if="registered"
                                class="button_secondary"
                                data-cy="delegate"
                                @click="addDelegator"
                                depressed
                                small
                            >
                                {{ $t('staking.delegate_card.submit') }}
                            </v-btn>
                        </div>
                    </div>
                    <div :class="{ 'disabled-card-parent': !registered }">
                        <div :class="{ 'disabled-card': !registered }">
                            <h4 class="title">
                                {{ $t('staking.validate_card.title') }}
                            </h4>
                            <p style="flex-grow: 1">
                                {{ $t('staking.validate_card.desc') }}
                            </p>
                            <p style="padding-top: 24px" class="no_balance">
                                {{ $t('staking.warning_1', [minStakeAmt.toLocaleString()]) }}
                            </p>
                            <v-btn
                                v-if="registered"
                                class="button_secondary"
                                data-cy="validate"
                                @click="addValidator"
                                depressed
                                small
                            >
                                {{ $t('staking.validate_card.submit') }}
                            </v-btn>
                        </div>
                    </div>
                    <div :class="{ 'disabled-card-parent': !registered }">
                        <div :class="{ 'disabled-card': !registered }">
                            <h4 class="title">
                                {{ $t('staking.rewards_card.title') }}
                            </h4>
                            <p style="flex-grow: 1">
                                {{ $t('staking.rewards_card.desc') }}
                            </p>
                            <div v-if="registered">
                                <v-btn
                                    v-if="registered"
                                    class="button_secondary"
                                    data-cy="rewards"
                                    @click="viewRewards"
                                    depressed
                                    small
                                >
                                    {{ $t('staking.rewards_card.submit') }}
                                </v-btn>
                            </div>
                        </div>
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
import Tooltip from '@/components/misc/Tooltip.vue'
import Register from '@/components/wallet/earn/Register.vue'
import { BN } from 'avalanche/dist'
import UserRewards from '@/components/wallet/earn/UserRewards.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'
import { ava } from '@/AVA'
import {
    defaultContractAddresses,
    getAddressBinderABI,
    getValidatorRewardManagerABI,
} from './FlareContractConstants'
import AddressBinder from '@/views/wallet/AddressBinder.vue'
import { ethers } from 'ethers'

@Component({
    name: 'earn',
    components: {
        UserRewards,
        AddValidator,
        AddDelegator,
    },
})
export default class Earn extends Vue {
    pageNow: any = null
    subtitle: string = ''
    intervalID: any = null
    registered: Boolean = false
    isRewards: boolean = false

    async isRegistered(): Promise<Boolean> {
        const wallet = this.$store.state.activeWallet
        const cHexAddr = wallet.getEvmChecksumAddress()
        const rpcUrl: string = this.getIp()
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
        const contractAddress: string = defaultContractAddresses.AddressBinder.flare
        const abi = getAddressBinderABI() as ethers.ContractInterface
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const result = await contract.cAddressToPAddress(cHexAddr)

        if (result !== '0x0000000000000000000000000000000000000000') {
            console.log('Success. You are registered')
            this.registered = true
            return this.registered
        } else {
            console.log('Please Register')
            this.registered = false
            return this.registered
        }
    }
    res = this.isRegistered()

    addressBinder() {
        this.pageNow = AddressBinder
        this.subtitle = this.$t('staking.subtitle5') as string
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

    viewRewards() {
        this.pageNow = UserRewards
        this.subtitle = this.$t('staking.subtitle4') as string
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
        if (this.totBal.lt(bn) && !this.isRegistered) {
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

    get register(): Promise<Boolean> {
        return this.isRegistered()
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
}
.disabled-card {
    opacity: 0.4;
    pointer-events: none;
}

.disabled-card-parent::after {
    content: 'Complete Address Binding';
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
.disabled-card-parent {
    position: relative;
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
