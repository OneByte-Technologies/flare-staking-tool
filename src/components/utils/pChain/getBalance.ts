/* eslint-disable */
import { Avalanche } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { RequestResponseData } from '@flarenetwork/flarejs/dist/common'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

export const getBalance = async (activeAddress: string): Promise<any> => {
    const bal: RequestResponseData = await pChain.callMethod('platform.getBalance', {
        activeAddress,
    })
    return bal.data.result.balance
}
