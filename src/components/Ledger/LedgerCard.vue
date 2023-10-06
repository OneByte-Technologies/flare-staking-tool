<template>
    <div>
        <modal ref="modal" title="Ledger Account Selection" class="modal_main">
            <v-dialog max-width="600px">
                <v-btn icon @click="closeModal">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title>Ledger Account Selection</v-card-title>
                <v-card-text>
                    <v-select
                        v-model="selectedStandard"
                        :items="$options"
                        label="Please select a standard for derivation path"
                    ></v-select>
                    <v-select
                        v-model="selectedAddress"
                        :items="address"
                        label="Please select an address"
                    ></v-select>
                </v-card-text>
                <v-card-action>
                    <v-btn @click="submit">Submit</v-btn>
                </v-card-action>
            </v-dialog>
        </modal>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AVA_ACCOUNT_PATH } from '@/js/wallets/MnemonicWallet'
import Modal from '../modals/Modal.vue'

@Component({
    components: {
        Modal,
    },
})
export default class LedgerCard extends Vue {
    isClose: boolean = false
    selectedStandard: string = ''
    selectedAddress: string = ''
    data() {
        return {
            isClose: false,
            options: ['BIP44', 'Ledger Live'],
        }
    }
    async submit() {}

    get address() {
        if (this.selectedStandard === 'BIP44') {
            let res: string[] = []
            for (let i = 0; i < 5; i++) {
                const pathStr = `${AVA_ACCOUNT_PATH}/0/${i}`
                res.push(pathStr)
            }
            return res
        } else {
            let res: string[] = []
            for (let i = 0; i < 5; i++) {
                const pathStr = `m/44'/60'/${i}'/0/0`
                res.push(pathStr)
            }
            return res
        }
    }

    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    closeModal() {
        let modal = this.$refs.modal as Modal
        modal.close()
    }
}
</script>
<style></style>
