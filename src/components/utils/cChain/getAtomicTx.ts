import { Avalanche } from '@flarenetwork/flarejs/dist'
import { EVMAPI } from '@flarenetwork/flarejs/dist/apis/evm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const cChain: EVMAPI = ava.CChain()

export const main = async (): Promise<any> => {
    const txID: string = '0x5fd5f81772f0edbf1c34a37462525126498bdb57f8d7dcbc3aadf5b408d6d26c'
    const status: string = await cChain.getAtomicTx(txID)
    console.log(status)
}
