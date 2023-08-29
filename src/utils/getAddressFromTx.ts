import { BaseTx as AVMBaseTx, TransferableOutput } from '@flarenetwork/flarejs/dist/apis/avm'
import { BaseTx as PlatformBaseTx } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { EVMBaseTx } from '@flarenetwork/flarejs/dist/apis/evm'
import { AddDelegatorTx, AddValidatorTx } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { bintools, ava as avalanche } from '@/AVA'

import { UnsignedTx as AVMUnsignedTx } from '@flarenetwork/flarejs/dist/apis/avm/tx'
import { UnsignedTx as PlatformUnsignedTx } from '@flarenetwork/flarejs/dist/apis/platformvm/tx'
import { UnsignedTx as EVMUnsignedTx } from '@flarenetwork/flarejs/dist/apis/evm/tx'

/**
 * Returns an array of unique addresses that are found on stake outputs of a tx.
 * @param tx
 */
export function getStakeOutAddresses(tx: AVMBaseTx | PlatformBaseTx | EVMBaseTx): string[] {
    if (tx instanceof AddValidatorTx || tx instanceof AddDelegatorTx) {
        const allAddrs = tx
            .getStakeOuts()
            .map((out) =>
                out
                    .getOutput()
                    .getAddresses()
                    .map((addr) => {
                        return bintools.addressToString(avalanche.getHRP(), 'P', addr)
                    })
            )
            .flat()
        // Remove duplicates
        return [...new Set(allAddrs)]
    }

    return []
}

export function getOutputAddresses(tx: AVMBaseTx | PlatformBaseTx) {
    const chainID = tx instanceof AVMBaseTx ? 'X' : 'P'
    const outAddrs = tx
        .getOuts()
        //@ts-ignore
        .map((out: TransferableOutput) =>
            out
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(avalanche.getHRP(), chainID, addr)
                })
        )
        .flat()
    return [...new Set(outAddrs)] as string[]
}

/**
 * Returns every output address for the given transaction.
 * @param unsignedTx
 */
export function getTxOutputAddresses<
    UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx
>(unsignedTx: UnsignedTx): string[] {
    if (unsignedTx instanceof EVMUnsignedTx) {
        return []
    }

    const tx = unsignedTx.getTransaction()
    if (tx instanceof AVMBaseTx) {
        const outAddrs = getOutputAddresses(tx)
        return outAddrs
    } else if (tx instanceof PlatformBaseTx) {
        const stakeAddrs = getStakeOutAddresses(tx)
        const outAddrs = getOutputAddresses(tx)

        return [...new Set([...stakeAddrs, ...outAddrs])]
    }

    return []
}
