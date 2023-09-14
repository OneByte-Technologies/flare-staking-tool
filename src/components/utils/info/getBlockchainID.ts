import { Avalanche } from '@flarenetwork/flarejs/dist'
import { InfoAPI } from '@flarenetwork/flarejs/dist/apis/info'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const info: InfoAPI = ava.Info()

const getBlockchainID = async (): Promise<any> => {
    const alias: string = 'P'
    const blockchainID: string = await info.getBlockchainID(alias)
    console.log(blockchainID)
}
