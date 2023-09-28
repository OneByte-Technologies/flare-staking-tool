<!-- <template>
    <w3m-button ref="mm" />
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { flare, flareTestnet } from '@wagmi/core/chains'
import { getAccount } from '@wagmi/core'

const projectId: string = '840225684ae4d115861536c0ecc5537d'

const metadata = {
    name: 'Flare-Staking-Tool',
    url: 'https://web3modal.com',
    description: 'Flare Web3 Wallet',
}

const chains = [flare, flareTestnet]
const wagmiConfig = defaultWagmiConfig({ projectId, chains, metadata })

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    defaultChain: flare,
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    ],
    includeWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    ],
    termsConditionsUrl: '',
    privacyPolicyUrl: '',
})

export default class Web3Modal extends Vue {
    // $refs!: {
    //     mm?: any
    // }
    // get address() {
    //     const { address, isConnecting, isConnected, isDisconnected } = getAccount()
    //     return address
    // }
}
</script> -->
