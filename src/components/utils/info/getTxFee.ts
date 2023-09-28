import { Avalanche } from '@flarenetwork/flarejs/dist'
import { GetTxFeeResponse } from '@flarenetwork/flarejs/dist/apis/info/interfaces'
import { InfoAPI } from '@flarenetwork/flarejs/dist/apis/info'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const info: InfoAPI = ava.Info()

const getTxFee = async (): Promise<any> => {
    const iGetTxFeeResponse: GetTxFeeResponse = await info.getTxFee()
    console.log(iGetTxFeeResponse)
}
