<template>
    <input
        type="number"
        inputmode="decimal"
        :placeholder="placeholder"
        v-model="val"
        :min="min"
        :max="maxNumString"
        :step="stepNum"
        @change="onChange"
    />
</template>

<script lang="ts">
import { Vue, Prop, Watch, Component } from 'vue-property-decorator'
import { bnToBig, bigToBN, stringToBN, BN, Big } from '@avalabs/avalanche-wallet-sdk'

@Component
export default class CustomBigNumInput extends Vue {
    @Prop({ type: Number, default: 0 }) denomination!: number
    @Prop({ default: null, type: [BN, Object] }) max!: BN
    @Prop({ type: Number, default: 0 }) min!: number
    @Prop({ type: [BN, Object], default: null }) step!: BN
    @Prop(String) placeholder!: string
    @Prop(BN) value!: BN

    val: string | null = null

    get maxNumString() {
        return this.bnToString(this.maxNumBN)
    }

    get maxNumBN() {
        return this.max
    }

    get stepNum() {
        if (!this.step) {
            if (this.denomination >= 2) {
                return 0.01
            } else {
                return Math.pow(10, -this.denomination)
            }
        }
        try {
            return this.bnToString(this.step)
        } catch (e) {
            console.error(e)
            return '0.01'
        }
    }

    @Watch('val')
    onValChange(val: string) {
        if (!val) {
            this.$emit('change', new BN(0))
            return
        }

        try {
            const splitVal = val.toString().split('.')
            const wholeVal = splitVal[0]
            const denomVal = splitVal[1]
            if (denomVal) {
                if (denomVal.length > this.denomination) {
                    const newDenom = denomVal.substring(0, this.denomination)
                    this.val = `${wholeVal}.${newDenom}`
                    return
                }
            }
        } catch (e) {
            console.log(e)
        }

        if (parseFloat(val) < this.min) {
            this.val = this.min.toString()
            return
        }

        const valBn = stringToBN(val, this.denomination)
        this.$emit('change', valBn)
    }

    @Watch('value')
    onValueChange(valBn: BN) {
        this.val = this.bnToString(valBn)
    }

    bnToString(val: BN) {
        return bnToBig(val, this.denomination).toString()
    }

    maxout() {
        if (this.maxNumBN != null) {
            this.val = this.bnToString(this.maxNumBN)
        }
    }

    clear() {
        this.val = null
    }

    onChange() {
        const valBig = Big(this.val || '0')
        const valBN = bigToBN(valBig, this.denomination)
        if (this.maxNumBN != null) {
            if (valBN.gt(this.maxNumBN)) {
                this.val = this.bnToString(this.maxNumBN)
            }
        }
    }
}
</script>

<style scoped>
input {
    text-align: right;
    outline: none;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}
</style>
