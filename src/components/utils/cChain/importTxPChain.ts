import { Avalanche, BN } from '@flarenetwork/flarejs/dist'
import {
    PlatformVMAPI,
    KeyChain as PlatformVMKeyChain,
} from '@flarenetwork/flarejs/dist/apis/platformvm'
import {
    EVMAPI,
    KeyChain as EVMKeyChain,
    UnsignedTx,
    Tx,
    UTXOSet,
} from '@flarenetwork/flarejs/dist/apis/evm'
import {
    PrivateKeyPrefix,
    DefaultLocalGenesisPrivateKey,
    Defaults,
    costImportTx,
} from '@flarenetwork/flarejs/dist/utils'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const cChain: EVMAPI = ava.CChain()
const pChain: PlatformVMAPI = ava.PChain()
const pKeychain: PlatformVMKeyChain = pChain.keyChain()
const cHexAddress: string = '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC'
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const cKeychain: EVMKeyChain = cChain.keyChain()
pKeychain.importKey(privKey)
cKeychain.importKey(privKey)
const cAddressStrings: string[] = cChain.keyChain().getAddressStrings()
const pChainBlockchainId: string = Defaults.network[networkID].P.blockchainID

const main = async (): Promise<any> => {
    const baseFeeResponse: string = await cChain.getBaseFee()
    const baseFee = new BN(parseInt(baseFeeResponse, 16) / 1e9)
    let fee: BN = baseFee
    const evmUTXOResponse: any = await cChain.getUTXOs(cAddressStrings, pChainBlockchainId)
    const utxoSet: UTXOSet = evmUTXOResponse.utxos
    let unsignedTx: UnsignedTx = await cChain.buildImportTx(
        utxoSet,
        cHexAddress,
        cAddressStrings,
        pChainBlockchainId,
        cAddressStrings,
        fee
    )
    const importCost: number = costImportTx(unsignedTx)
    fee = baseFee.mul(new BN(importCost))

    unsignedTx = await cChain.buildImportTx(
        utxoSet,
        cHexAddress,
        cAddressStrings,
        pChainBlockchainId,
        cAddressStrings,
        fee
    )

    const tx: Tx = unsignedTx.sign(cKeychain)
    const txid: string = await cChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}

main()
