<template>
    <div class="tx_history_panel">
        <div class="history_block" :disabled="!isActivityPage"></div>
        <div class="header">
            <h2>Transactions</h2>
            <!-- <Spinner v-if="isUpdating" class="spinner"></Spinner> -->
        </div>
        <!-- <div class="empty" v-if="!isExplorer">
            <h4>{{ $t('transactions.error_api') }}</h4>
            <p>{{ $t('transactions.error_api_desc') }}</p>
            
        </div>
        <div class="empty" v-else-if="isEmpty && !isUpdating">
            <p>{{ $t('transactions.notx') }}</p>
            
        </div> -->
        <div class="txn_comingsoon">
            <!-- <tx-history-row
                v-for="tx in transactions"
                :key="tx.txHash"
                :transaction="tx"
                class="tx_row"
            ></tx-history-row> -->
            <h2>Coming Soon</h2>
            <!-- You can customize the text below as needed -->
            <!-- <p>Transaction details will be available soon.</p> -->
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import TxHistoryRow from '@/components/SidePanels/TxHistoryRow.vue'
import { AvaNetwork } from '@/js/AvaNetwork'
import { TransactionType } from '@/js/Glacier/models'
import { ava } from '@/AVA'

@Component({
    components: {
        TxHistoryRow,
        Spinner,
    },
})
export default class TransactionHistoryPanel extends Vue {
    get isExplorer(): boolean {
        let network: AvaNetwork | null = this.$store.state.Network.selectedNetwork
        if (!network) return false
        if (network.explorerUrl) {
            return true
        }
        return false
    }

    get isEmpty(): boolean {
        if (this.transactions.length === 0) {
            return true
        }
        return false
    }
    get isUpdating(): boolean {
        return this.$store.state.History.isUpdating
    }
    get transactions(): TransactionType[] {
        return this.$store.state.History.recentTransactions
    }

    get isActivityPage() {
        if (this.$route.fullPath.includes('/activity')) {
            return true
        }
        return false
    }

    get explorerUrl(): string {
        let addr = this.$store.state.address.split('-')[1]
        if (ava.getNetworkID() === 114) {
            return `https://coston2-explorer.flare.network/address/${addr}`
        } else {
            return `https://flare-explorer.flare.network/address/${addr}`
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.tx_history_panel {
    display: grid;
    grid-template-rows: max-content 1fr;
    overflow: auto;
    position: relative;
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bg-light);
    padding: 8px 16px;

    h2 {
        font-weight: normal;
    }

    a {
        /*background-color: var(--primary-color);*/
        /*color: #fff !important;*/
        padding: 4px 18px;
        font-size: 12px;
    }
}

.spinner {
    display: block;
    align-self: center;
    margin: 0 !important;
}
.list {
    overflow: scroll;
    padding: 8px 16px;
    padding-bottom: 20px;
}

.empty {
    font-size: 12px;
    text-align: center;
    padding: 30px;
}

.tx_row {
    border-bottom: 1px solid var(--bg-light);

    &:last-of-type {
        border: none;
    }
}
.warn {
    background-color: var(--bg-light);
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    padding: 15px;
}

.history_block {
    position: absolute;
    background-color: var(--bg-wallet);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0.8;
    pointer-events: none;
    transition-duration: 0.2s;

    &[disabled] {
        opacity: 0;
    }
}

.txn_comingsoon {
    margin-top: 50%;
    margin-bottom: 50%;
    margin-left: 70px;
    margin-right: 35px;
}
@include main.medium-device {
}
</style>
