import { Context } from './Interfaces'
import { Store } from 'vuex'
import { ethers } from 'ethers'
import {
    pChainStakeMirror,
    getPChainStakeMirrorABI,
    getFlareContractRegistryABI,
    defaultContractAddresses,
} from './FlareContractConstants'
import { integerToDecimal } from './utils'
import { getPendingDelegators } from '@/helpers/pendingDelegatorHelper'
import { ava } from '@/AVA'
import { TestnetConfig, MainnetConfig } from '@/store/modules/network/constants'

type DelegatedAmount = {
    nodeId: string
    stakeAmount: number
    startTime: Date
    endTime: Date
}

const nodes: string[] = []

////////// MIRROR FUND /////////
// fetches current validator info
const fetchValidatorInfo = async (ctx: Context) => {
    const validator = await ctx.pchain.getCurrentValidators()
    console.log('Validators', validator)
    return validator
}

// fetches the delegation stake (from both current and pending validator) for the current user
const fetchDelegateStake = async (ctx: Context, validatorFunction: (ctx: Context) => {}) => {
    const validatorsInfo = await validatorFunction(ctx)
    const validatorData = (validatorsInfo as any)?.validators
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
                const startDate = new Date(
                    parseInt(validatorData[i]?.delegators[j]?.startTime) * 1000
                )
                const endDate = new Date(parseInt(validatorData[i]?.delegators[j]?.endTime) * 1000)
                userStake.push({
                    nodeId: validatorData[i].nodeID,
                    stakeAmount: parseFloat(validatorData[i]?.delegators[j]?.stakeAmount) / 1e9,
                    startTime: startDate,
                    endTime: endDate,
                })
            }
        }
    }
    return userStake
}

// calculates the total amount of delegation
const getTotalFromDelegation = (data: DelegatedAmount[]) => {
    let total = 0

    for (let i = 0; i < data.length; i++) {
        total += data[i].stakeAmount
    }
    return total
}

/**
 * @description returns the mirror fund details
 * @param ctx - context
 * @returns - total mirror funds and funds with start and end time
 */
export async function fetchMirrorFunds(ctx: Context, store: Store<any>) {
    store.commit('updateMirrorFundsPending', true)
    // fetch from the contract
    const rpcUrl = getIp()
    const pChainStakeMirrorContractAddress = await getContractAddress(
        ava.getHRP(),
        pChainStakeMirror
    )
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const abi = getPChainStakeMirrorABI() as ethers.ContractInterface
    const contract = new ethers.Contract(pChainStakeMirrorContractAddress, abi, provider)
    const stakedAmount = await contract.balanceOf(ctx.cAddressHex)
    const stakedAmountInFLR = parseFloat(integerToDecimal(stakedAmount.toString(), 18))
    // fetch for the chain
    const delegationToCurrentValidator = await fetchDelegateStake(ctx, fetchValidatorInfo)
    populateNodesData(delegationToCurrentValidator)
    const nodes = getNodes()
    const currentAmt = getTotalFromDelegation(delegationToCurrentValidator)
    const totalDelegatedAmount = currentAmt
    const totalInFLR = parseFloat(totalDelegatedAmount.toString())
    store.commit('updateMirrorFundsPending', false)
    return {
        'Total Mirrored Amount': `${totalInFLR} FLR`,
        'Mirror Funds Details': {
            ...delegationToCurrentValidator,
        },
        'Delegation Count': nodes.length,
        'Total Current Amount': currentAmt,
    }
}

export async function getContractAddress(network: string, contractName: string): Promise<string> {
    const rpcUrl = getIp()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    const abi = getFlareContractRegistryABI() as ethers.ContractInterface
    if (network != 'flare' && network != 'costwo') throw new Error('Invalid network passed')
    const contract = new ethers.Contract(
        defaultContractAddresses.flareContractRegistryAddress[network],
        abi,
        provider
    )

    const result = await contract.getContractAddressByName(contractName)

    if (result !== '0x0000000000000000000000000000000000000000') return result

    const defaultAddress = defaultContractAddresses[contractName]?.[network]
    if (defaultAddress) return defaultAddress

    throw new Error('Contract Address not found')
}

const getIp = () => {
    let ip = ''
    if (ava.getHRP() === 'costwo') {
        ip = TestnetConfig.url
    } else if (ava.getHRP() === 'flare') {
        ip = MainnetConfig.url
    }
    const rpcUrl: string = `${ip}/ext/C/rpc`
    return rpcUrl
}

export function getNodes() {
    const pendingDelegators = getPendingDelegators()

    // Combine nodes and pendingDelegators
    const combinedNodes = nodes.concat(pendingDelegators)

    // Filter to keep unique values
    const uniqueNodes = combinedNodes.filter((value, index, self) => {
        return self.indexOf(value) === index
    })

    return uniqueNodes.slice(0, 3)
}

function populateNodesData(delegationInfo: DelegatedAmount[]) {
    delegationInfo.forEach((info) => {
        if (!nodes.includes(info.nodeId)) {
            nodes.push(info.nodeId)
        }
    })
    return nodes
}
