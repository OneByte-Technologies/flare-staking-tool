import { Avalanche, BN } from '@flarenetwork/flarejs/dist'
import { EVMAPI } from '@flarenetwork/flarejs/dist/apis/evm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const cChain: EVMAPI = ava.CChain()

const main = async (): Promise<any> => {
    const maxPriorityFeePerGas: string = await cChain.getMaxPriorityFeePerGas()
    console.log(maxPriorityFeePerGas)
}

main()
