import { Avalanche } from 'avalanche/dist'
import { PlatformVMAPI, KeyChain } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { GetStakeResponse } from '@flarenetwork/flarejs/dist/apis/platformvm/interfaces'
import { PrivateKeyPrefix, DefaultLocalGenesisPrivateKey } from '@flarenetwork/flarejs/dist/utils'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI | any = ava.PChain()
const pKeychain: KeyChain = pChain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
pKeychain.importKey(privKey)
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
const encoding: string = 'hex'

const main = async (): Promise<any> => {
    const getStakeResponse: GetStakeResponse = await pChain.getStake(pAddressStrings, encoding)
    console.log(getStakeResponse)
}

main()
