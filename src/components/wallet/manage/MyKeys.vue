<template>
    <div class="my_keys">
        <p class="label">{{ $t('keys.active_wallet') }}</p>
        <key-row
            v-if="activeWallet"
            :wallet="activeWallet"
            :walletKey="activeAddressPVM"
            class="key_row"
            :is_default="true"
        ></key-row>
        <hr v-if="inactiveWallets.length > 0" />
        <p class="label" v-if="inactiveWallets.length > 0">Other Keys</p>
        <transition-group name="fade">
            <key-row
                v-for="wallet in inactiveWallets"
                :wallet="wallet"
                :key="wallet.id"
                class="key_row"
                @select="selectWallet"
                @remove="removeWallet(wallet)"
            ></key-row>
        </transition-group>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import KeyRow from '@/components/wallet/manage/KeyRow.vue'
import RememberKey from '@/components/misc/RememberKey.vue'
import { WalletType } from '@/js/wallets/types'
import { ChainIdType } from '@/constants'

@Component({
    components: {
        KeyRow,
        RememberKey,
    },
})
export default class MyKeys extends Vue {
    chainNow: ChainIdType = 'P'
    showBech = false // If true C-Chain shows the bech32 Address
    selectWallet(wallet: WalletType) {
        console.log('keys-selectWallet:', wallet)
        this.$store.dispatch('activateWallet', wallet)
        this.$store.dispatch('History/updateTransactionHistory')
        this.$store.dispatch('updateIsRegistered')
    }

    get account() {
        return this.$store.getters['Accounts/account']
    }

    async removeWallet(wallet: WalletType) {
        let msg = this.$t('keys.del_check') as string
        let isConfirm = confirm(msg)

        if (isConfirm) {
            await this.$store.dispatch('Accounts/deleteKey', wallet)
            await this.$store.dispatch('removeWallet', wallet)
            this.$store.dispatch('Notifications/add', {
                title: this.$t('keys.remove_success_title'),
                message: this.$t('keys.remove_success_msg'),
            })
        }
    }

    get inactiveWallets(): WalletType[] {
        let wallets = this.wallets

        let res = wallets.filter((wallet) => {
            if (this.activeWallet === wallet) return false
            return true
        })

        return res
    }

    get wallets(): WalletType[] {
        return this.$store.state.wallets
    }

    get activeWallet(): WalletType {
        console.log('keys-activeWallet:', this.$store.state.activeWallet)
        return this.$store.state.activeWallet
    }
    get address() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }
        console.log('address:', wallet.getCurrentAddressAvm()) // Add console.log here
        return wallet.getCurrentAddressAvm()
    }

    get addressPVM() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }
        console.log('addressPVM:', wallet.getCurrentAddressPlatform()) // Add console.log here
        return wallet.getCurrentAddressPlatform()
    }

    get addressEVM() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }

        return wallet.getEvmChecksumAddress()
    }

    get addressEVMBech32() {
        let wallet = this.activeWallet
        if (!wallet) {
            return '-'
        }

        return wallet.getEvmAddressBech()
    }

    get activeAddress(): string {
        switch (this.chainNow) {
            case 'X':
                return this.address
            case 'P':
                return this.addressPVM
            case 'C':
                return this.showBech ? this.addressEVMBech32 : this.addressEVM
        }
        return this.address
    }
    get activeAddressPVM(): string {
        console.log('activeAddressPVM:', this.addressPVM) // Add console.log here
        return this.addressPVM // Use the P-chain address here
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.default_key {
}

hr {
    border-top: 1px solid var(--bg-light);
    border-left: 1px solid var(--bg-light);
    border-right: 1px solid var(--bg-light);
    border-color: var(--bg-light) !important;
    margin: 12px 0;
}

.label {
    font-size: 13px;
    color: #999;
    font-weight: bold;
    padding: 2px 10px;
}
.key_row {
    background-color: var(--bg-light);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition-duration: 0.2s;
}

.my_keys {
    padding-top: 15px;
}
.addressItem {
    &[selected] {
    }
}

.volatile_cont {
    max-width: 380px;
    /*border-top: 1px solid #eee;*/
    margin-top: 20px;
    padding-top: 20px;
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}

.remember_comp {
    /*padding: 20px 0;*/
}

.alert_box {
    /*margin: 0px 25px;*/
    font-size: 0.9rem;
}
</style>
<style lang="scss">
.volatile_cont {
    .v-expansion-panel {
        background-color: transparent !important;
    }

    .passwords input {
        background-color: #d2e9fd;
    }

    .v-expansion-panel-header,
    .v-expansion-panel-content__wrap {
        padding: 8px 0;
    }
}
</style>
