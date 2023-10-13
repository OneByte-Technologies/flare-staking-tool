<template>
    <div class="avax_input">
        <div class="col1 hover_border">
            <button class="max_but" @click="maxOut" v-if="max">MAX</button>
            <BigNumInput
                ref="amt_in"
                class="amt_in"
                contenteditable="amt_in"
                :denomination="denomination"
                :max="max"
                placeholder="0.00"
                @change="amount_in"
            ></BigNumInput>
        </div>
        <p class="ticker">{{ symbol }}</p>
        <div v-if="balance" class="balance">
            <div>
                <p v-if="balanceText">
                    <Tooltip :text="balanceText">
                        <fa icon="wallet"></fa>
                    </Tooltip>
                </p>
                <p v-if="balanceText && symbol !== 'C2FLR'" class="usd-conversion">
                    <b>$</b>
                    {{ amountUSD.toLocaleString(2) }}
                </p>
            </div>
            <div></div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Model } from 'vue-property-decorator'
import { Big, bnToBig } from '@avalabs/avalanche-wallet-sdk'
import Tooltip from '@/components/misc/Tooltip.vue'
//@ts-ignore
import BigNumInput from '@/components/misc/CustomBigNumInput'
import { BN } from 'avalanche'
import { priceDict } from '../../store/types'

@Component({
    components: {
        BigNumInput,
        Tooltip,
    },
})
export default class AvaxInput extends Vue {
    @Model('change', { type: Object }) readonly amount!: BN

    @Prop({
        default: null,
    })
    max?: BN | null

    @Prop() balance?: Big | null
    @Prop() symbol!: string
    @Prop({ default: 9 }) denomination!: number

    $refs!: {
        amt_in: BigNumInput
    }

    maxOut(ev: MouseEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        this.$refs.amt_in.maxout()
    }

    clear() {
        this.$refs.amt_in.clear()
    }

    amount_in(val: BN) {
        this.$emit('change', val)
    }

    get balanceText(): String {
        if (!this.balance) return ''
        return this.$t('misc.balance') + ': ' + this.balance.toLocaleString()
    }

    get amountUSD(): Big {
        let usdPrice = this.priceDict.usd
        let amount = bnToBig(this.amount, 9)
        let usdBig = amount.times(usdPrice)
        return usdBig
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.avax_input {
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-gap: 0px 10px;
    color: var(--primary-color);
    width: 100%;
    height: 40px;

    input {
        overflow: hidden;
    }
    .amt_in {
        color: var(--primary-color);
        font-size: 15px;
        font-family: monospace;
        flex-grow: 1;
        flex-shrink: 1;
        display: block;
        box-sizing: content-box;
        outline: none !important;
        border: none !important;
        //padding: 0 12px !important;
    }

    .ticker,
    .amt_in,
    .max_but {
        background-color: var(--bg-light);
        //border-radius: 3px;
    }
}

.balance {
    display: grid;
    column-gap: 10px;
    font-size: 14px;
    color: var(--primary-color-light);
    padding: 2px 0px;

    > div {
        display: flex;
        justify-content: space-between;
    }

    p {
        text-align: left;
        padding: 2px 0px;
    }

    .usd-conversion {
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    p:last-child {
        text-align: right;
    }

    span {
        font-family: monospace;
        padding-left: 14px;
    }
}

.col1 {
    border-radius: 3px;
    background-color: var(--bg-light);
    border: 1px solid transparent;
    //display: flex;
    display: grid;
    grid-template-columns: max-content 1fr;
    width: 100%;
    box-sizing: border-box;
    //overflow: auto;
    padding: 8px 14px;
    position: relative;

    //&:hover {
    //    border-color: var(--primary-color-light);
    //}
    //&:focus-within {
    //    border-color: var(--secondary-color);
    //}
}

.ticker {
    border-radius: 3px;
    padding: 8px 14px;
}

p {
    text-align: center;
}

.max_but {
    font-size: 13px;
    opacity: 0.4;

    &:hover {
        opacity: 1;
    }
}

@include main.mobile-device {
    .balance {
        font-size: 12px;
    }
}
</style>
