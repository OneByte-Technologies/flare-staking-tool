import { ethers } from 'ethers'
import {
    rpcFromNetwork,
    pChainStakeMirrorContractFromNetwork,
    DelegatedAmount,
    pChainStakeMirrorABI,
} from './constant'
import { EVMAPI, KeyChain as EVMKeyChain } from '@flarenetwork/flarejs/dist/apis/evm'
import {
    PlatformVMAPI as PVMAPI,
    KeyChain as PVMKeyChain,
} from '@flarenetwork/flarejs/dist/apis/platformvm'
import Avalanche from 'avalanche'

export interface NetworkConfig {
    protocol: string
    ip: string
    port?: number
    networkID: number
    hrp: string
}

export interface Context {
    privkHex?: string
    privkCB58?: string
    publicKey?: string
    rpcurl: string
    web3: any
    avalanche: Avalanche
    cchain: EVMAPI
    pchain: PVMAPI
    cKeychain: EVMKeyChain
    pKeychain: PVMKeyChain
    pAddressBech32?: string
    cAddressBech32?: string
    cAddressHex?: string
    cChainBlockchainID: string
    pChainBlockchainID: string
    avaxAssetID: string
    config: NetworkConfig
}

export function integerToDecimal(int: string, offset: number): string {
    int = int.padStart(offset, '0')
    const part1 = int.slice(0, -offset)
    const part2 = int.slice(-offset)
    return part1 + '.' + part2
}
// creates contract instance
const getContractInstance = async (
    contractAddress: string,
    contractABI: any,
    rpcUrl: string
): Promise<ethers.Contract> => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddress, contractABI, provider)
    console.log('contractAddress:', contractAddress)
    console.log('contractABI:', contractABI)
    console.log('rpcUrl:', rpcUrl)
    console.log('provider:', provider)
    console.log('contract:', contract)
    return contract
}

// creates pChainMirrorContract instance
const getPChainMirrorContractInstance = async (ctx: Context): Promise<ethers.Contract> => {
    const rpcUrl = rpcFromNetwork(ctx.config.hrp)
    console.log('rpcUrl:', rpcUrl)
    const mirrorContractAddress = pChainStakeMirrorContractFromNetwork(ctx.config.hrp)
    console.log('mirrorContractAddress:', mirrorContractAddress)
    const contractInstance = await getContractInstance(
        mirrorContractAddress,
        pChainStakeMirrorABI,
        rpcUrl
    )
    console.log('contractInstance:', contractInstance)
    return contractInstance
}

// fetches staked amount from the mirror contract
const fetchStakedAmount = async (ctx: Context) => {
    const pMirrorContract = await getPChainMirrorContractInstance(ctx)
    console.log('pMirrorContract:', pMirrorContract)
    const stakedAmount = await pMirrorContract.stakesOf(ctx.cAddressHex)
    console.log('stakedAmount:', stakedAmount)
    const result = stakedAmount[1].length == 0 ? 0 : parseInt(stakedAmount[1])
    console.log('result: staked amount', result)
    return result
}

// fetches current validator info
const fetchValidatorInfo = async (ctx: Context) => {
    const validator = await ctx.pchain.getCurrentValidators()
    console.log('validator:', validator)
    return validator
}

// fetches pending validator info
const fetchPendingValidatorInfo = async (ctx: Context) => {
    const pendingValidator = await ctx.pchain.getPendingValidators()
    console.log('pendingValidator:', pendingValidator)
    return pendingValidator
}

// fetches the delegation stake (from both current and pending validator) for the current user
const fetchDelegateStake = async (ctx: Context, validatorFunction: (ctx: Context) => {}) => {
    const validatorsInfo = await validatorFunction(ctx)
    console.log('validatorsInfo:', validatorsInfo)
    const validatorData = (validatorsInfo as any)?.validators
    console.log('validatorData:', validatorData)
    const userStake = []
    for (let i = 0; i < validatorData.length; i++) {
        for (
            let j = 0;
            j < (validatorData[i].delegators && validatorData[i].delegators?.length);
            j++
        ) {
            if (
                validatorData[i].delegators[j] &&
                validatorData[i].delegators[j].rewardOwner.addresses.includes(ctx.pAddressBech32)
            ) {
                userStake.push({
                    stakeAmount: parseInt(validatorData[i]?.delegators[j]?.stakeAmount),
                    startTime: parseInt(validatorData[i]?.delegators[j]?.startTime),
                    endTime: parseInt(validatorData[i]?.delegators[j]?.endTime),
                })
            }
        }
    }
    console.log('userStake:', userStake)
    return userStake
}

// calculates the total amount of delegation
const getTotalFromDelegation = (data: DelegatedAmount[]) => {
    let total = 0
    for (let i = 0; i < data.length; i++) {
        console.log('data[i].stakeAmount:', data[i].stakeAmount)
        total += data[i].stakeAmount
    }
    console.log('total:de', total)
    return total
}

/**
 * @description returns the mirror fund details
 * @param ctx - context
 * @returns - total mirror funds and funds with start and end time
 */
export const fetchMirrorFunds = async (ctx: Context) => {
    const stakeFromMirrorContract = await fetchStakedAmount(ctx)
    console.log('stakeFromMirrorContract:', stakeFromMirrorContract)
    const delegationToCurrentValidator = await fetchDelegateStake(ctx, fetchValidatorInfo)
    console.log('delegationToCurrentValidator:', delegationToCurrentValidator)
    const delegationToPendingValidator = await fetchDelegateStake(ctx, fetchPendingValidatorInfo)
    console.log('delegationToPendingValidator:', delegationToPendingValidator)
    const totalDelegatedAmount =
        getTotalFromDelegation(delegationToCurrentValidator) +
        getTotalFromDelegation(delegationToPendingValidator) +
        stakeFromMirrorContract
    console.log('totalDelegatedAmount:', totalDelegatedAmount)
    const totalInFLR = integerToDecimal(totalDelegatedAmount.toString(), 9)
    return {
        TotalAmount: totalInFLR,
        MirrorFunds: {
            ...delegationToCurrentValidator,
            ...delegationToPendingValidator,
        },
    }
}
