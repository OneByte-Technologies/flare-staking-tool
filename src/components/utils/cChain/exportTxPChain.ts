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

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const cChain: EVMAPI = ava.CChain()
const pChain: PlatformVMAPI = ava.PChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const pKeychain: PlatformKeyChain = pChain.keyChain()
const cKeychain: EVMKeyChain = cChain.keyChain()
pKeychain.importKey(privKey)
cKeychain.importKey(privKey)
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
const cAddressStrings: string[] = cChain.keyChain().getAddressStrings()
const pChainBlockchainIdStr: string = Defaults.network[networkID].P.blockchainID
const avaxAssetID: string | undefined = Defaults.network[networkID].X.avaxAssetID
const cHexAddress: string = '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC'
const Web3 = require('web3')
const path: string = '/ext/bc/C/rpc'
const web3: any = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

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
