import { Avalanche } from '@flarenetwork/flarejs/dist'
import { EVMAPI } from '@flarenetwork/flarejs/dist/apis/evm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const cChain: EVMAPI = ava.CChain()

const main = async (): Promise<any> => {
    const address: string = '0x304b0a0b4afD794E9dE11180e397AB2e2623Abf0'
    const blockHeight: string = 'latest'
    const assetID: string = '8eqonZUiJZ655TLQdhFDCqY8oV4SPDMPzqfoVMVsSNE4wSMWu'
    const balance: object = await cChain.getAssetBalance(address, blockHeight, assetID)
    console.log(balance)
}

main()
