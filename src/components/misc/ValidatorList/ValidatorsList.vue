<template>
    <div class="validator_list">
        <FilterSettings
            class="filter_modal"
            v-show="showFilter"
            @close="showFilter = false"
            @change="applyFilter"
            :validators="validators"
        ></FilterSettings>
        <div class="icon-info" v-if="delegationCount > 0">
            <div class="dot"></div>
            <div class="text">Currently delegated nodes</div>
        </div>
        <div class="table_cont">
            <table>
                <thead>
                    <tr class="header_tr">
                        <th>
                            {{ $t('staking.delegate.list.id') }}
                        </th>
                        <th style="text-align: right">
                            {{ $t('staking.delegate.list.val_stake') }}
                        </th>
                        <th style="text-align: right">
                            {{ $t('staking.delegate.list.aval_stake') }}
                            <Tooltip
                                style="display: inline-block"
                                :text="$t('staking.delegate.list.aval_stake_tip')"
                            >
                                <fa icon="question-circle"></fa>
                            </Tooltip>
                        </th>
                        <th>
                            <Tooltip text="Number of Delegators"><fa icon="users"></fa></Tooltip>
                        </th>
                        <th>{{ $t('staking.delegate.list.end') }}</th>
                        <!-- <th>{{ $t('staking.delegate.list.fee') }}</th> -->
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <ValidatorRow
                        v-for="v in validatorsFiltered"
                        :key="v.nodeID"
                        :validator="v"
                        @select="onselect"
                        :canDelegate="delegationCount < 3"
                    ></ValidatorRow>
                </tbody>
            </table>
        </div>
        <div v-if="validators.length === 0" class="empty_list">
            <h4>{{ $t('staking.delegate.list.empty.title') }}</h4>
            <p>{{ $t('staking.delegate.list.empty.desc') }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ava, pChain } from '@/AVA'
import { BN } from 'avalanche'

import ValidatorRow from '@/components/misc/ValidatorList/ValidatorRow.vue'
import FilterSettings from '@/components/misc/ValidatorList/FilterSettings.vue'
import { ValidatorRaw, ValidatorDict } from '@/components/misc/ValidatorList/types'
import Tooltip from '@/components/misc/Tooltip.vue'
import { ValidatorListItem } from '@/store/modules/platform/types'
import { ValidatorListFilter } from '@/components/wallet/earn/Delegate/types'
import { filterValidatorList } from '@/components/wallet/earn/Delegate/helper'
import { getNodes } from '@/views/wallet/FlareContract'

@Component({
    components: { Tooltip, ValidatorRow, FilterSettings },
})
export default class ValidatorsList extends Vue {
    @Prop() search!: string
    showFilter = false
    filter: ValidatorListFilter | null = null

    openFilters() {
        this.showFilter = true
    }

    hideFilters() {
        this.showFilter = false
    }

    applyFilter(filter: ValidatorListFilter | null) {
        this.filter = filter
    }

    get validators(): ValidatorListItem[] {
        let list: ValidatorListItem[] = this.$store.getters['Platform/validatorListEarn']

        if (this.search) {
            list = list.filter((v) => {
                return v.nodeID.includes(this.search)
            })
        }

        // order by stake amount
        list = list.sort((a, b) => {
            let amtA = a.validatorStake
            let amtB = b.validatorStake

            if (amtA.gt(amtB)) {
                return -1
            } else if (amtA.lt(amtB)) {
                return 1
            } else {
                return 0
            }
        })

        return list
    }

    get delegationCount() {
        return getNodes().length
    }

    get validatorsFiltered(): ValidatorListItem[] {
        return filterValidatorList(this.validators, this.filter)
    }

    onselect(val: ValidatorListItem) {
        this.$emit('select', val)
    }
}
</script>
<style scoped lang="scss">
.validator_list {
    position: relative;
    width: 100%;
}

.table_cont {
    overflow: scroll;
    max-height: 450px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    position: sticky;
    top: -1px;
    padding: 2px 14px;
    font-size: 14px;
    background-color: var(--bg-wallet-light);
    z-index: 1;
}

.empty_list {
    padding: 30px;
    text-align: center;
}

.filter_modal {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
}

.icon-info {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    background-color: limegreen;
}

.text {
    font-weight: normal;
    font-size: 12px;
}
</style>
