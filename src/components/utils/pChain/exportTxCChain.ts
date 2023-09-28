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

const ip = 'coston2-api.flare.network'
const port = 443
const protocol = 'https'
const networkID = 114
const ava = new Avalanche(ip, port, protocol, networkID)
const pChain = ava.PChain()
const xchain = ava.XChain()
const xKeychain = xchain.keyChain()
const pKeychain = pChain.keyChain()
const privKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
xKeychain.importKey(privKey)
pKeychain.importKey(privKey)
const xAddressStrings = xchain.keyChain().getAddressStrings()
const pAddressStrings = pChain.keyChain().getAddressStrings()
export const cChainBlockchainID = Defaults.network[networkID].C.blockchainID
const fee = pChain.getDefaultTxFee()
const threshold = 1
const locktime = new BN(0)
const memo = Buffer.from(
    'PlatformVM utility method buildExportTx to export AVAX from the P-Chain to the C-Chain'
)
const asOf = UnixNow()

const main = async () => {
    const getBalanceResponse = await pChain.getBalance(pAddressStrings[0])
    const unlocked = new BN(getBalanceResponse.unlocked)
    const platformVMUTXOResponse = await pChain.getUTXOs(pAddressStrings)
    const utxoSet = platformVMUTXOResponse.utxos
    const unsignedTx = await pChain.buildExportTx(
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
    const tx = unsignedTx.sign(pKeychain)
    const txid = await pChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}

main()
