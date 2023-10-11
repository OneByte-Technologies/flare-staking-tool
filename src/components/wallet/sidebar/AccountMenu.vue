<template>
    <div>
        <div v-if="!isLedger && wallet">
            <template v-if="account">
                <button class="account_but" @click="openSettings">
                    <Identicon :value="account.baseAddresses.join('')" diameter="18"></Identicon>
                    <p>{{ account.name }}</p>
                </button>
                <AccountSettingsModal ref="settings_modal"></AccountSettingsModal>
            </template>
            <template v-else>
                <SaveAccountModal ref="save_modal"></SaveAccountModal>
                <button class="save_account" @click="save">
                    <fa icon="exclamation-triangle" class="volatile_alert"></fa>
                    Save Account
                </button>
            </template>
        </div>
        <div class="app-version">
            <span>App Version:&nbsp;</span>
            <span>{{ appVersion }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'
import { WalletType } from '@/js/wallets/types'

@Component({
    components: {
        AccountSettingsModal,
        SaveAccountModal,
        Identicon,
    },
})
export default class AccountMenu extends Vue {
    $refs!: {
        save_modal: SaveAccountModal
        settings_modal: AccountSettingsModal
    }

    get account(): iUserAccountEncrypted | null {
        return this.$store.getters['Accounts/account']
    }

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get isLedger() {
        let w = this.wallet
        if (!w) return false
        return w.type === 'ledger'
    }

    get appVersion() {
        return `v${process.env.VUE_APP_VERSION}`
    }

    openSettings() {
        this.$refs.settings_modal.open()
    }

    save() {
        this.$refs.save_modal.open()
    }
}
</script>
<style scoped lang="scss">
.account_but {
    color: var(--primary-color);
    display: flex;
    flex-direction: row;
    align-items: center;

    p {
        text-align: left;
        margin-left: 8px !important;
    }

    &:hover {
        opacity: 0.5;
    }
}

.save_account {
    color: var(--warning);

    &:hover {
        opacity: 0.5;
    }
}

.app-version {
    font-size: 14px;
    margin-top: 8px;
    color: var(--primary-color-light);
}
</style>
