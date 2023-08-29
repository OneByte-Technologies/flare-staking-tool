import { AmountOutput as AmountOutputX, UTXO as UTXOX } from '@flarenetwork/flarejs/dist/apis/avm'
import { AmountOutput as AmountOutputP, UTXO as UTXOP } from '@flarenetwork/flarejs/dist/apis/platformvm'
import { BN } from '@flarenetwork/flarejs'

type UTXO = UTXOX | UTXOP
type AmountOutput = AmountOutputX | AmountOutputP

/**
 * Return the sum of given UTXOs
 * @param utxos
 */
export function sumUtxos(utxos: UTXO[]) {
    // Get final amount
    return utxos.reduce((tot, utxo) => {
        const amt = (utxo.getOutput() as AmountOutput).getAmount()
        return tot.add(amt)
    }, new BN(0))
}
