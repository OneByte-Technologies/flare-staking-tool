<template>
    <div>
        <div>
            <div class="page-title">Please select a standard for derivation and your address</div>
            <v-select
                class="ledger-input"
                v-model="selectedStandard"
                @change="onSelectStandard"
                :disabled="isFetchingAddresses"
                :items="standard"
                label="Please select a standard for derivation path"
                filled
            ></v-select>
            <v-select
                class="ledger-input"
                v-model="selectedAddress"
                :items="addressList"
                :placeholder="placeholder"
                :readonly="isFetchingAddresses"
                :loading="isFetchingAddresses"
                filled
            ></v-select>
            <v-btn
                class="ava_button button_primary"
                :disabled="!selectedAddress"
                @click="submit"
                depressed
            >
                Access Wallet
            </v-btn>
            <div style="margin-top: 12px">
                <router-link to="/access" class="link">Cancel</router-link>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from 'vue-property-decorator'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
//@ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
// @ts-ignore
import TransportWebHID from '@ledgerhq/hw-transport-webhid'
// @ts-ignore
import Transport from '@ledgerhq/hw-transport'
import Spinner from '@/components/misc/Spinner.vue'
import LedgerBlock from '@/components/modals/LedgerBlock.vue'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { LEDGER_EXCHANGE_TIMEOUT } from '@/store/modules/ledger/types'
import ImageDayNight from '@/components/misc/ImageDayNight.vue'
import { getLedgerProvider } from '@avalabs/avalanche-wallet-sdk'
import { MIN_LEDGER_V } from '@/js/wallets/constants'
import { derivedAddresses } from '@/js/wallets/LedgerWallet'
const { detect } = require('detect-browser')
const UnsupportedBrowsers = ['firefox', 'safari']
const addressCount = 10

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
    isFetchingAddresses: boolean = true
    version?: string = undefined
    addressList: string[] = []
    derivedAddress: derivedAddresses[] = []

    get path() {
        let pathArr: string[] = []
        for (let i = 0; i < addressCount; i++) {
            const pathStr =
                this.selectedStandard === 'BIP44' ? `m/44'/60'/0'/0/${i}` : `m/44'/60'/${i}'/0/0`
            pathArr.push(pathStr)
        }
        return pathArr
    }

    get standard() {
        return ['BIP44', 'Ledger Live']
    }

    get placeholder() {
        return this.isFetchingAddresses ? 'Fetching addresses...' : 'Please select an address'
    }

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
            console.log(' Transport Starts here')
            transport = await TransportWebHID.create()
            console.log(' Transport WebHID created')
            return transport
        } catch (e) {
            console.log('Web HID not supported.')
        }

        //@ts-ignore
        if (window.USB) {
            console.log('USB WINDOW')
            transport = await TransportWebUSB.create()
        } else {
            console.log('U2F Create')
            transport = await TransportU2F.create()
        }
        return transport
    }

    async init() {
        this.addressList = []
        this.isFetchingAddresses = true
        try {
            let transport = await this.getTransport()
            transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

            // Wait for app config
            await this.waitForConfig(transport)

            // Close the initial prompt modal if exists
            this.$store.commit('Ledger/setIsUpgradeRequired', false)

            if (!this.version) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                throw new Error('')
            }

            if (this.version < MIN_LEDGER_V) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                throw new Error('')
            }
            console.log('calculating addresses')
            this.derivedAddress = await LedgerWallet.getDerivedAddresses(transport, this.path)
            for (let i = 0; i < addressCount; i++) {
                const addr = '0x' + this.derivedAddress[i].ethAddress
                this.addressList.push(addr)
            }
            this.isFetchingAddresses = false
        } catch (e) {
            this.isFetchingAddresses = false
            this.onerror(e)
        }
    }

    findDp() {
        const selectedDerivedAddress = this.derivedAddress.find(
            (item) => item.ethAddress === this.selectedAddress.slice(2)
        )
        console.log('returning derivation path')

        return selectedDerivedAddress?.derivationPath
    }

    mounted() {
        this.init()
    }

    async onSelectStandard() {
        this.init()
    }

    async submit() {
        try {
            console.log('SUBMIT BUTTON PRESSED')
            let transport = await this.getTransport()
            transport.setExchangeTimeout(LEDGER_EXCHANGE_TIMEOUT)

            // Wait for app config
            await this.waitForConfig(transport)

            // Close the initial prompt modal if exists
            this.$store.commit('Ledger/setIsUpgradeRequired', false)

            if (!this.version) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                throw new Error('')
            }

            if (this.version < MIN_LEDGER_V) {
                this.$store.commit('Ledger/setIsUpgradeRequired', true)
                throw new Error('')
            }
            const dp = this.findDp()
            console.log('creating wallet using requested address')
            let wallet = await LedgerWallet.fromTransport(transport, dp!)
            try {
                await this.loadWallet(wallet)
                this.onsuccess()
            } catch (e) {
                this.onerror(e)
            }
        } catch (err) {
            console.log(err)
        }
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
        this.version = undefined
    }
    onerror(err: any) {
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

.page-title {
    margin-bottom: 32px;
    text-align: center;
}

.ledger-input {
    width: 50%;
    margin: 0 auto;
}

.link {
    color: var(--link-secondary);
}

.v-text-field:hover {
    border: none;
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
