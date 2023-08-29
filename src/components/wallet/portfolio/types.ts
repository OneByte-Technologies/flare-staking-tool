import { UTXO } from '@flarenetwork/flarejs/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
