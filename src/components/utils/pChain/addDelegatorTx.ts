import { Avalanche, BinTools, BN, Buffer } from '@flarenetwork/flarejs/dist'
import {
    PlatformVMAPI,
    KeyChain,
    SECPTransferOutput,
    SECPTransferInput,
    TransferableOutput,
    TransferableInput,
    UTXOSet,
    UTXO,
    AmountOutput,
    UnsignedTx,
    AddDelegatorTx,
    Tx,
    SECPOwnerOutput,
    ParseableOutput,
} from '@flarenetwork/flarejs/dist/apis/platformvm'
import { Output } from '@flarenetwork/flarejs/dist/common'
import {
    PrivateKeyPrefix,
    DefaultLocalGenesisPrivateKey,
    Defaults,
    NodeIDStringToBuffer,
    UnixNow,
} from '@flarenetwork/flarejs/dist/utils'

const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)
const pChain: PlatformVMAPI = ava.PChain()
const bintools: BinTools = BinTools.getInstance()
const pKeychain: KeyChain = pChain.keyChain()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
pKeychain.importKey(privKey)
const pAddresses: Buffer[] = pChain.keyChain().getAddresses()
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()
const pChainBlockchainID: string = Defaults.network[networkID].P.blockchainID
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const stakeOuts: TransferableOutput[] = []
const fee: BN = pChain.getDefaultTxFee()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from('Manually add a delegator to the primary subnet')
const nodeID: string = 'NodeID-DueWyGi3B9jtKfa9mPoecd4YSDJ1ftF69'
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(2630000))

export const addDelegatorTx = async (nodeID: string): Promise<any> => {
    const stakeAmount: any = await pChain.getMinStake()
    const avaxAssetID: Buffer = await pChain.getAVAXAssetID()
    const getBalanceResponse: any = await pChain.getBalance(pAddressStrings[0])
    const unlocked: BN = new BN(getBalanceResponse.unlocked)
    const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
        unlocked.sub(fee).sub(stakeAmount.minValidatorStake),
        pAddresses,
        locktime,
        threshold
    )
    const transferableOutput: TransferableOutput = new TransferableOutput(
        avaxAssetID,
        secpTransferOutput
    )
    outputs.push(transferableOutput)

    const stakeSECPTransferOutput: SECPTransferOutput = new SECPTransferOutput(
        stakeAmount.minValidatorStake,
        pAddresses,
        locktime,
        threshold
    )
    const stakeTransferableOutput: TransferableOutput = new TransferableOutput(
        avaxAssetID,
        stakeSECPTransferOutput
    )
    stakeOuts.push(stakeTransferableOutput)

    const rewardOutputOwners: SECPOwnerOutput = new SECPOwnerOutput(pAddresses, locktime, threshold)
    const rewardOwners: ParseableOutput = new ParseableOutput(rewardOutputOwners)

    const platformVMUTXOResponse: any = await pChain.getUTXOs(pAddressStrings)
    const utxoSet: UTXOSet = platformVMUTXOResponse.utxos
    const utxos: UTXO[] = utxoSet.getAllUTXOs()
    utxos.forEach((utxo: UTXO) => {
        const output: Output = utxo.getOutput()
        if (output.getOutputID() === 7) {
            const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
            const amt: BN = amountOutput.getAmount().clone()
            const txid: Buffer = utxo.getTxID()
            const outputidx: Buffer = utxo.getOutputIdx()

            const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
            secpTransferInput.addSignatureIdx(0, pAddresses[0])

            const input: TransferableInput = new TransferableInput(
                txid,
                outputidx,
                avaxAssetID,
                secpTransferInput
            )
            inputs.push(input)
        }
    })

    const addDelegatorTx: AddDelegatorTx = new AddDelegatorTx(
        networkID,
        bintools.cb58Decode(pChainBlockchainID),
        outputs,
        inputs,
        memo,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        stakeAmount.minDelegatorStake,
        stakeOuts,
        rewardOwners
    )

    const unsignedTx: UnsignedTx = new UnsignedTx(addDelegatorTx)
    const tx: Tx = unsignedTx.sign(pKeychain)
    const txid: string = await pChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}
