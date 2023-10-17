<template>
    <tr class="validator_row">
        <td class="id">
            {{ validator.nodeID }}
            <span v-if="isDelegated" class="dot"></span>
        </td>
        <td class="amount">{{ amtText }}</td>
        <td class="amount">{{ remainingAmtText }}</td>
        <td style="text-align: center">{{ numDelegators }}</td>
        <td>{{ remainingTimeText }}</td>
        <!-- <td>{{ feeText }}%</td> -->
        <td>
            <button
                :class="[
                    'button_secondary',
                    {
                        'disabled-button': !canDelegate,
                    },
                ]"
                @click="select"
            >
                Select
            </button>
            <Tooltip
                v-if="!canDelegate"
                style="display: inline-block; margin-left: 4px"
                text="You can only delegate to three unique nodes at once"
            >
                <fa icon="question-circle"></fa>
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
export default class ValidatorsList extends Vue {
    @Prop() validator!: ValidatorListItem
    @Prop(Boolean) canDelegate!: boolean

    mounted() {
        console.log('Validator', this.validator, 'Can Delegate', this.canDelegate)
    }

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
        if (getNodes().length < 3 || getNodes().includes(this.validator.nodeID)) return true
        return false
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

.disabled-button {
    opacity: 0.3;
    pointer-events: none;
}

.id {
    word-break: break-all;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
td {
    padding: 4px 14px;
    background-color: var(--bg-light);
    border: 1px solid var(--bg);
    font-size: 13px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: lightgreen;
}

@include main.medium-device {
    td {
        font-size: 10px !important;
    }
}
</style>
