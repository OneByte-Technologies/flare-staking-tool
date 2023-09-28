import { Avalanche, BN } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

const main = async (): Promise<any> => {
    const currentSupply: BN = await pChain.getCurrentSupply()
    console.log(currentSupply.toString())
}

main()
