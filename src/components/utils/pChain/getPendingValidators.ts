import { Avalanche } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

const main = async (): Promise<any> => {
    const subnetID: string = '11111111111111111111111111111111LpoYY'
    const nodeIDs: string[] = []
    const pendingValidators: object = await pChain.getPendingValidators(subnetID)
    console.log(pendingValidators)
}

main()
