<template>
    <tr class="validator_row">
        <td class="id">
            <div>
                <span style="display: inline-block">{{ validator.nodeID }}</span>
                <span v-if="isDelegated" class="dot"></span>
            </div>
        </td>
        <td class="amount">{{ amtText }}</td>
        <td class="amount">{{ remainingAmtText }}</td>
        <td style="text-align: center">{{ numDelegators }}</td>
        <td>{{ remainingTimeText }}</td>
        <!-- <td>{{ feeText }}%</td> -->
        <td class="action" v-if="canDelegate || isDelegated">
            <button class="button_secondary" @click="select">Select</button>
        </td>
        <td class="action" v-else>
            <Tooltip
                style="display: inline-block; margin-left: 4px"
                text="You can only delegate to three unique nodes at once"
            >
                <fa icon="lock"></fa>
            </Tooltip>
        </td>
    </tr>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import moment from 'moment'
import { BN } from 'avalanche'
import { bnToBig } from '@/helpers/helper'
import { ValidatorListItem } from '@/store/modules/platform/types'
import { getNodes } from '@/views/wallet/FlareContract'
import Tooltip from '@/components/misc/Tooltip.vue'

@Component({
    components: { Tooltip },
})
export default class ValidatorsRow extends Vue {
    @Prop() validator!: ValidatorListItem
    @Prop(Boolean) canDelegate!: boolean

    get remainingMs(): number {
        let end = this.validator.endTime
        let remain = end.getTime() - Date.now()
        return remain
    }

    get remainingTimeText() {
        let ms = this.remainingMs
        let duration = moment.duration(ms, 'milliseconds')
        return duration.humanize(true)
    }

    get stakeAmt(): BN {
        return this.validator.validatorStake
    }

    get amtText() {
        let amt = this.stakeAmt
        let big = bnToBig(amt, 9)
        return big.toLocaleString(0)
    }

    get feeText() {
        return this.validator.fee
    }

    get numDelegators() {
        return this.validator.numDelegators
    }

    get totalDelegated(): BN {
        return this.validator.delegatedStake
    }

    get remainingStake(): BN {
        return this.validator.remainingStake
    }

    get remainingAmtText(): string {
        let big = bnToBig(this.remainingStake, 9)
        return big.toLocaleString(0)
    }

    select() {
        this.$emit('select', this.validator)
    }

    get isDelegated() {
        const nodes = getNodes()
        return nodes.includes(this.validator.nodeID)
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.amount {
    text-align: right;
    font-family: monospace;
}

button {
    padding: 3px 12px;
    font-size: 13px;
    border-radius: 3px;
}

.id {
    // word-break: break-all;
    position: relative;
}

.action {
    text-align: center;
    min-height: 34.5px;
}

td {
    padding: 4px 12px;
    background-color: var(--bg-light);
    border: 1px solid var(--bg);
    font-size: 13px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: limegreen;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}

@include main.medium-device {
    td {
        font-size: 10px !important;
    }
}
</style>
