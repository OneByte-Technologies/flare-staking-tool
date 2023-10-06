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
                    :items="res"
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
import Modal from '../modals/Modal.vue'
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
//@ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
// @ts-ignore
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
// @ts-ignore
import Eth from '@ledgerhq/hw-app-eth'
import Transport from '@ledgerhq/hw-transport'
import Spinner from '@/components/misc/Spinner.vue'
import LedgerBlock from '@/components/modals/LedgerBlock.vue'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { AVA_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from '@/js/wallets/MnemonicWallet'
import { LEDGER_EXCHANGE_TIMEOUT } from '@/store/modules/ledger/types'
import ImageDayNight from '@/components/misc/ImageDayNight.vue'
import { getLedgerProvider } from '@avalabs/avalanche-wallet-sdk'
import { MIN_LEDGER_V } from '@/js/wallets/constants'
import { derivedAddresses } from '@/js/wallets/LedgerWallet'
const { detect } = require('detect-browser')
const UnsupportedBrowsers = ['firefox', 'safari']

@Component({
    components: {
        ImageDayNight,
        Spinner,
        LedgerBlock,
    },
})
export default class LedgerCard extends Vue {
    selectedStandard: string = 'BIP44'
    selectedAddress: string = ''

    get path() {
        if (this.selectedStandard === 'BIP44') {
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

    isLoading: boolean = false
    version?: string = undefined

    get browser() {
        return detect()
    }

    // For display
    get browserName() {
        return this.browser ? this.browser.name[0].toUpperCase() + this.browser.name.slice(1) : ''
    }

    get disabled() {
        // If unsupported return true
        if (this.browser && UnsupportedBrowsers.includes(this.browser.name)) return true
        return false
    }

    async getTransport() {
        let transport

        try {
            transport = await TransportWebHID.create()
            return transport
        } catch (e) {
            console.log('Web HID not supported.')
        }

        //@ts-ignore
        if (window.USB) {
            transport = await TransportWebUSB.create()
        } else {
            transport = await TransportU2F.create()
        }
        return transport
    }
    res: string[] = []
    async init() {
        try {
            let transport = await this.getTransport()
            transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

            // Wait for app config
            await this.waitForConfig(transport)

            // Close the initial prompt modal if exists
            this.$store.commit('Ledger/setIsUpgradeRequired', false)
            this.isLoading = true

            if (!this.version) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }

            if (this.version < MIN_LEDGER_V) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }

            let derivedAddress: derivedAddresses[] = await LedgerWallet.getDerivedAddresses(
                transport,
                this.path
            )
            for (let i = 0; i < 5; i++) {
                const addr = derivedAddress[i].ethAddress
                this.res.push(addr)
            }

            const selectedDerivedAddress = derivedAddress.find(
                (item) => item.ethAddress == this.selectedAddress
            )
            return selectedDerivedAddress?.derivationPath
        } catch (e) {
            this.onerror(e)
        }
    }

    mounted() {
        this.init()
    }

    async submit() {
        try {
            let transport = await this.getTransport()
            transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

            // Wait for app config
            await this.waitForConfig(transport)

            // Close the initial prompt modal if exists
            this.$store.commit('Ledger/setIsUpgradeRequired', false)
            this.isLoading = true

            if (!this.version) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }

            if (this.version < MIN_LEDGER_V) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                this.isLoading = false
                throw new Error('')
            }
            const dp = await this.init()
            let wallet = await LedgerWallet.fromTransport(transport, dp!)
            try {
                await this.loadWallet(wallet)
                this.onsuccess()
            } catch (e) {
                this.onerror(e)
            }
        } catch (err) {}
    }

    async waitForConfig(t: Transport) {
        // Config is found immediately if the device is connected and the app is open.
        // If no config was found that means user has not opened the Avalanche app.
        setTimeout(() => {
            if (this.version) return
            this.$store.commit('Ledger/setIsUpgradeRequired', true)
        }, 1000)

        try {
            const prov = await getLedgerProvider(t)
            this.version = await prov.getVersion(t)
        } catch (e) {
            // this.version = await (app as AvalancheApp).
        }
    }

    async loadWallet(wallet: LedgerWallet) {
        this.showWalletLoading()
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.$store
                    .dispatch('accessWalletLedger', wallet)
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }, 1000)
        })
    }

    selectAddrModal() {}

    showWalletLoading() {
        this.$store.commit('Ledger/closeModal')
        this.$store.commit('Ledger/setIsWalletLoading', true)
    }
    onsuccess() {
        this.$store.commit('Ledger/setIsWalletLoading', false)
        this.isLoading = false
        this.version = undefined
    }
    onerror(err: any) {
        this.isLoading = false
        this.version = undefined
        this.$store.commit('Ledger/closeModal')
        console.error(err)

        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Ledger Access Failed',
            message: 'Failed to get public key from ledger device.',
        })
    }
}
</script>
<style scoped lang="scss">
.spinner {
    width: 100% !important;
    color: inherit;
}

.ledger_img {
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.spinner::v-deep p {
    color: inherit;
}

.no_firefox {
    font-size: 0.8em;
    color: var(--primary-color-light);
}
</style>
