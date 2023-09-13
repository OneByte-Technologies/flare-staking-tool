import { Avalanche, BN, Buffer } from '@flarenetwork/flarejs/dist'
import { AVMAPI, KeyChain as AVMKeyChain } from '@flarenetwork/flarejs/dist/apis/avm'
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
} from '@flarenetwork/flarejs/dist/utils'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()
const xchain: AVMAPI = ava.XChain()
const xKeychain: AVMKeyChain = xchain.keyChain()
const pKeychain: KeyChain = pChain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
pKeychain.importKey(privKey)
const xAddressStrings: string[] = xchain.keyChain().getAddressStrings()
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
const cChainBlockchainID: string = Defaults.network[networkID].C.blockchainID
const fee: BN = pChain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
    'PlatformVM utility method buildExportTx to export AVAX from the P-Chain to the C-Chain'
)
const asOf: BN = UnixNow()

const main = async (): Promise<any> => {
    const getBalanceResponse: any = await pChain.getBalance(pAddressStrings[0])
    const unlocked: BN = new BN(getBalanceResponse.unlocked)
    const platformVMUTXOResponse: any = await pChain.getUTXOs(pAddressStrings)
    const utxoSet: UTXOSet = platformVMUTXOResponse.utxos
    const unsignedTx: UnsignedTx = await pChain.buildExportTx(
        utxoSet,
        unlocked.sub(fee),
        cChainBlockchainID,
        xAddressStrings,
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
