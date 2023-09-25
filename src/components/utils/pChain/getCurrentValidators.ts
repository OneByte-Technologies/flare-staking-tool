import { Avalanche } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

export const getCurrentValidators = async (): Promise<any> => {
    const subnetID: string = '11111111111111111111111111111111LpoYY'
    const nodeIDs: string[] = []
    const currentValidators: object = await pChain.getCurrentValidators(subnetID)
    console.log(currentValidators)
}
getCurrentValidators()
