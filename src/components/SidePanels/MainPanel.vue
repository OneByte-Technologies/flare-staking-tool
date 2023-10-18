<template>
    <div class="main_panel">
        <ConfirmLogout ref="logout"></ConfirmLogout>
        <div class="panel_nav">
            <Tooltip text="Close right sidebar" class="hover_but close_icon">
                <fa size="lg" icon="times" @click="closeMainPanel"></fa>
            </Tooltip>
            <DayNightToggle class="hover_but"></DayNightToggle>
            <network-menu class="net_menu"></network-menu>
            <button @click="logout" class="logout">
                {{ $t('logout.button') }}
            </button>
        </div>
        <transaction-history-panel class="panel_content"></transaction-history-panel>
    </div>
</template>
<script>
import NetworkMenu from '../NetworkSettings/NetworkMenu'
import TransactionHistoryPanel from './TransactionHistoryPanel'
import DayNightToggle from '@/components/misc/DayNightToggle'
import ConfirmLogout from '@/components/modals/ConfirmLogout.vue'
import Tooltip from '@/components/misc/Tooltip.vue'

export default {
    components: {
        NetworkMenu,
        TransactionHistoryPanel,
        DayNightToggle,
        ConfirmLogout,
        Tooltip,
    },
    props: {
        onClose: Function,
    },
    methods: {
        logout() {
            // this.$store.dispatch('logout');
            // @ts-ignore
            this.$refs.logout.open()
        },
        closeMainPanel() {
            this.onClose()
        },
    },
}
</script>
<style scoped lang="scss">
@use '../../main';

.main_panel {
    display: grid;
    grid-template-rows: max-content 1fr;
    row-gap: 6px;
}

.panel_nav {
    background-color: var(--bg-wallet-light);
    display: flex;
    align-items: center;
    padding: 24px 16px;
    font-size: 14px;

    > * {
        outline: none !important;
        padding: 4px 8px;
        border-radius: 4px;
    }
}

.hover_but {
    transition-duration: 0.2s;
    cursor: pointer;
    &:hover {
        box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.3);
    }
}

.panel_content {
    overflow: auto;
    background-color: var(--bg-wallet-light);
    height: 100%;
}

.close_icon {
    margin-top: 3px;
}

.logout {
    margin-left: auto;
}

@include main.medium-device {
    .panel_nav {
        padding: 12px 16px;
    }
}
</style>
