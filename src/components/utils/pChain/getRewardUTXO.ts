import { Avalanche } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { GetRewardUTXOsResponse } from '@flarenetwork/flarejs/dist/apis/platformvm/interfaces'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

const main = async (): Promise<any> => {
    const txID: string = '2nmH8LithVbdjaXsxVQCQfXtzN9hBbmebrsaEYnLM9T32Uy2Y4'
    const encoding: string = 'hex'
    const rewardUTXOs: GetRewardUTXOsResponse = await pChain.getRewardUTXOs(txID, encoding)
    console.log(rewardUTXOs)
}

main()
