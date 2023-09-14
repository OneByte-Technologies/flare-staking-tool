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
    AddValidatorTx,
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

// Initialize Avalanche instance
const ip: string = 'coston2-api.flare.network'
const port: number = 443
const protocol: string = 'https'
const networkID: number = 114
const ava: Avalanche = new Avalanche(ip, port, protocol, networkID)

// Initialize PlatformVMAPI instance
const pChain: PlatformVMAPI = ava.PChain()

// Initialize BinTools instance
const bintools: BinTools = BinTools.getInstance()

// Initialize KeyChain instance
const pKeychain: KeyChain = pChain.keyChain()

// Set the private key
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
pKeychain.importKey(privKey)

// Get the addresses and address strings
const pAddresses: Buffer[] = pChain.keyChain().getAddresses()
const pAddressStrings: string[] = pChain.keyChain().getAddressStrings()

// Get the P-Chain blockchain ID
const pChainBlockchainID: string = Defaults.network[networkID].P.blockchainID

// Initialize arrays for outputs, inputs, and stake outputs
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const stakeOuts: TransferableOutput[] = []

// Get the default transaction fee
const fee: BN = pChain.getDefaultTxFee()

// Set the threshold for the validator
const threshold: number = 1

// Set the locktime for the validator
const locktime: BN = new BN(0)

// Set the memo for the validator
const memo: Buffer = Buffer.from('Manually add a validator to the primary subnet')

// Set the node ID for the validator
const nodeID: string = 'NodeID-DueWyGi3B9jtKfa9mPoecd4YSDJ1ftF69'

// Set the start and end times for the validator
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(26300000))

// Set the delegation fee for the validator
const delegationFee: number = 10

// Main function
export const addValidatorTx = async (nodeID: string): Promise<any> => {
    // Get the minimum stake amount
    const stakeAmount: any = await pChain.getMinStake()

    // Get the AVAX asset ID
    const avaxAssetID: Buffer = await pChain.getAVAXAssetID()

    // Get the balance of the active address
    const getBalanceResponse: any = await pChain.getBalance(pAddressStrings[0])
    const unlocked: BN = new BN(getBalanceResponse.unlocked)

    // Create the SECP transfer output for the unlocked balance
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

    // Create the SECP transfer output for the stake amount
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

    const addValidatorTx: AddValidatorTx = new AddValidatorTx(
        networkID,
        bintools.cb58Decode(pChainBlockchainID),
        outputs,
        inputs,
        memo,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        stakeAmount.minValidatorStake,
        stakeOuts,
        rewardOwners,
        delegationFee
    )
    const unsignedTx: UnsignedTx = new UnsignedTx(addValidatorTx)
    const tx: Tx = unsignedTx.sign(pKeychain)
    const txid: string = await pChain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
}

