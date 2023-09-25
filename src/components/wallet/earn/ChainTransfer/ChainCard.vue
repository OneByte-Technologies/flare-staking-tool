<template>
    <div class="chain_card">
        <div class="input_group">
            <h4 v-if="isSource">{{ $t('cross_chain.card.source') }}</h4>
            <h4 v-else>{{ $t('cross_chain.card.destination') }}</h4>
            <p style="font-size: 3em" class="chain_alias">{{ chain }}</p>
        </div>
        <div>
            <div class="input_group">
                <label>{{ $t('cross_chain.card.name') }}</label>
                <p>{{ chainNames[chain] }}</p>
            </div>
            <div class="input_group">
                <label>{{ $t('cross_chain.card.balance') }}</label>
                <p class="balance">{{ balanceText }}</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator'
import { UTXO } from 'avalanche/dist/apis/platformvm'
import { ChainIdType } from '@/constants'
import { BN } from 'avalanche'
import AvaAsset from '@/js/AvaAsset'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { WalletType } from '@/js/wallets/types'

import { bnToBig } from '@/helpers/helper'
import NumberCounter from '@/components/misc/NumberCounter.vue'
import { getBalance as getPBalance } from '@/components/utils/pChain/getBalance'
import { ethers } from 'ethers'

const chainTypes: ChainIdType[] = ['X', 'P', 'C']
const chainNames = {
    X: 'Exchange Chain',
    C: 'Contract Chain',
    P: 'Platform Chain',
}

@Component({
    components: {
        NumberCounter,
    },
})
export default class ChainCard extends Vue {
    // @Model('change', { type: String }) readonly chain!: ChainIdType
    @Prop() chain!: ChainIdType
    // @Prop() exclude!: ChainIdType
    @Prop({ default: true }) isSource?: boolean

    onChange(ev: any) {
        let val: ChainIdType = ev.target.value
        this.$emit('change', val)
    }
    pBalance: number = 0
    cBalance: string = ''
    balanceDollar: string = ''
    totBal: number = 0

    // ... other properties and methods ...

    async fetchPBalance() {
        const activeWallet = this.$store.state.activeWallet
        const pChainCustomAddr = activeWallet.getCurrentAddressPlatform()
        const pChainAddress: string = 'P-costwo' + pChainCustomAddr.slice(8)
        console.log(pChainAddress)
        if (pChainAddress) {
            this.pBalance = await getPBalance(pChainAddress)
            console.log('pBalance:', this.pBalance)
            this.totalBal() // Calculate the total balance
        } else {
            console.error('No P-Chain address found')
        }
    }

    async fetchCBalance() {
        try {
            const activeWallet = this.$store.state.activeWallet
            const cChainAddress: string = activeWallet.getEvmChecksumAddress()
            const url: string = 'https://coston2-api.flare.network/ext/C/rpc'
            const provider = new ethers.providers.JsonRpcProvider(url)
            const result = await provider.getBalance(cChainAddress)
            const balHex = result._hex.toString()
            const balBN = parseInt(result._hex)
            this.cBalance = ethers.utils.formatEther(balHex)
            console.log('cBalance', this.cBalance)
            this.totalBal() // Calculate the total balance
        } catch (err) {
            console.error('Promise rejected with error:', err)
        }
    }

    totalBal() {
        const cChainBal = parseFloat(this.cBalance.toString())
        const pChainBal = parseFloat(this.pBalance.toString())
        const usdPerFlr = parseFloat(this.priceDict.usd.toString())
        this.totBal = pChainBal + cChainBal
        const totalUsd = this.totBal * usdPerFlr
        this.balanceDollar = totalUsd.toString()
    }

    get priceDict(): { usd: number } {
        return this.$store.state.prices
    }

    get chainNames() {
        return chainNames
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get wallet(): WalletType {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance'].available
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get evmUnlocked(): BN {
        let balRaw = this.wallet.ethBalance
        return balRaw.div(new BN(Math.pow(10, 9)))
    }

    get balance() {
        if (this.chain === 'P') {
            const pChainBal = parseFloat(this.pBalance.toString())
            return new BN(pChainBal)
        } else if (this.chain === 'C') {
            const cChainBal = parseFloat(this.cBalance.toString()) * Math.pow(10, 9)
            return new BN(cChainBal)
        } else {
            return this.avmUnlocked
        }
    }

    get balanceBig() {
        return bnToBig(this.balance, 9)
    }
    get balanceText() {
        return this.balanceBig.toLocaleString()
    }

    mounted() {
        setInterval(() => {
            this.fetchPBalance()
        }, 1000)
        setInterval(() => {
            this.fetchCBalance()
        }, 1000)
        setInterval(() => {
            this.totalBal()
        }, 5000)
    }
}
</script>
<style scoped lang="scss">
@use '../../../../main';

label {
    text-align: left;
    color: var(--primary-color-light);
    font-size: 13px;
}

.chain_card {
    //height: max-content;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
}

.input_group {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

p {
    font-size: 14px;
    word-break: break-all;
}

@include main.mobile-device {
    .chain_card {
        display: block;
    }
    h4,
    .chain_alias {
        text-align: center;
    }
}
</style>
