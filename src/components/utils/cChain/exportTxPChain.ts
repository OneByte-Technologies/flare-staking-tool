import { Avalanche, BN } from '@flarenetwork/flarejs/dist'
import {
    PlatformVMAPI,
    KeyChain as PlatformKeyChain,
} from '@flarenetwork/flarejs/dist/apis/platformvm'
import {
    EVMAPI,
    KeyChain as EVMKeyChain,
    UnsignedTx,
    Tx,
} from '@flarenetwork/flarejs/dist/apis/evm'
import {
    PrivateKeyPrefix,
    DefaultLocalGenesisPrivateKey,
    Defaults,
    costExportTx,
} from '@flarenetwork/flarejs/dist/utils'

export const ip: string = 'coston2-api.flare.network'
export const port: number = 443
export const protocol: string = 'https'
export const networkID: number = 114
export const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
export const cChain: EVMAPI = ava.CChain()
export const pChain: PlatformVMAPI = ava.PChain()
export const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
export const pKeychain: PlatformKeyChain = pChain.keyChain()
export const cKeychain: EVMKeyChain = cChain.keyChain()
pKeychain.importKey(privKey)
cKeychain.importKey(privKey)
export const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
export const cAddressStrings: string[] = cChain.keyChain().getAddressStrings()
export const pChainBlockchainIdStr: string = Defaults.network[networkID].P.blockchainID
export const avaxAssetID: string | undefined = Defaults.network[networkID].X.avaxAssetID
export const cHexAddress: string = '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC'
export const Web3 = require('web3')
export const path: string = '/ext/bc/C/rpc'
export const web3: any = new Web3(`${protocol}://${ip}:${port}${path}`)
export const threshold: number = 1


const main = async (): Promise<any> => {
    let balance: BN = await web3.eth.getBalance(cHexAddress)
    balance = new BN(balance.toString().substring(0, 17))
    const baseFeeResponse: string = await cChain.getBaseFee()
    const baseFee = new BN(parseInt(baseFeeResponse, 16))
    const txcount = await web3.eth.getTransactionCount(cHexAddress)
    const nonce: number = txcount
    const locktime: BN = new BN(0)
    let avaxAmount: BN = new BN(1e7)
    let fee: BN = baseFee.div(new BN(1e9))
    fee = fee.add(new BN(1e6))

    let unsignedTx: UnsignedTx = await cChain.buildExportTx(
        avaxAmount,
        avaxAssetID as any,
        pChainBlockchainIdStr,
        cHexAddress,
        cAddressStrings[0],
        pAddressStrings,
        nonce,
        locktime,
        threshold,
        fee
    )

    const tx: Tx = unsignedTx.sign(cKeychain)
    const txid: string = await cChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}

main()
