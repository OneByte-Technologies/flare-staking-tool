/* eslint-disable */
import { Avalanche } from '@flarenetwork/flarejs/dist'
import { PlatformVMAPI } from '@flarenetwork/flarejs/dist/apis/platformvm'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()

export const getBalance = async (activeAddress: string): Promise<any> => {
    const balance: object = await pChain.getBalance(activeAddress)
    console.log(balance)
    console.log('Balance Fetched', balance)
}
