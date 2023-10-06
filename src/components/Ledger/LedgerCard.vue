<template>
    <div>
        <div ref="modal" class="modal_main">
            <div>
                <label>Please select a standard for Derivation and your Address</label>
                <v-select
                    v-model="selectedStandard"
                    :items="standard"
                    label="Please select a standard for derivation path"
                ></v-select>
                <v-select
                    v-model="selectedAddress"
                    :items="address"
                    label="Please select an address"
                ></v-select>
                <v-card-action>
                    <v-btn @click="submit">Submit</v-btn>
                </v-card-action>
            </div>
        </div>
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
    selectedStandard: string = 'BIP44'
    selectedAddress: string = ''

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

    get standard() {
        return ['BIP44', 'Ledger Live']
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
