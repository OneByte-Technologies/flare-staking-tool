import { Avalanche, BN, Buffer } from '@flarenetwork/flarejs/dist'
import {
    PlatformVMAPI,
    KeyChain,
    UTXOSet,
    UnsignedTx,
    Tx,
} from '@flarenetwork/flarejs/dist/apis/platformvm'
import {
    PrivateKeyPrefix,
    DefaultLocalGenesisPrivateKey,
    Defaults,
    UnixNow,
} from '@flarenetwork/flarejs/dist//utils'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()
const pKeychain: KeyChain = pChain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
pKeychain.importKey(privKey)
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
const cChainBlockchainID: string = Defaults.network[networkID].C.blockchainID
const pChainBlockchainID: string = Defaults.network[networkID].P.blockchainID
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
    'PlatformVM utility method buildImportTx to import AVAX to the P-Chain from the X-Chain'
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
    const platformVMUTXOResponse: any = await pChain.getUTXOs(pAddressStrings, cChainBlockchainID)
    const utxoSet: UTXOSet = platformVMUTXOResponse.utxos
    const unsignedTx: UnsignedTx = await pChain.buildImportTx(
        utxoSet,
        pAddressStrings,
        cChainBlockchainID,
        pAddressStrings,
        pAddressStrings,
        pAddressStrings,
        memo,
        asOf,
        locktime,
        threshold
    )
    const tx: Tx = unsignedTx.sign(pKeychain)
    const txid: string = await pChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}

main()
