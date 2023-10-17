import { Context } from './Interfaces'
import { ethers } from 'ethers'
import {
    pChainStakeMirror,
    getPChainStakeMirrorABI,
    getFlareContractRegistryABI,
    defaultContractAddresses,
} from './FlareContractConstants'
import { integerToDecimal } from './utils'
import { ava } from '@/AVA'

type DelegatedAmount = {
    nodeId: string
    stakeAmount: number
    startTime: Date
    endTime: Date
}

let delegationCount: number
const nodes: string[] = []

////////// MIRROR FUND /////////
// fetches current validator info
const fetchValidatorInfo = async (ctx: Context) => {
    const validator = await ctx.pchain.getCurrentValidators()
    return validator
}

// fetches the delegation stake (from both current and pending validator) for the current user
const fetchDelegateStake = async (ctx: Context, validatorFunction: (ctx: Context) => {}) => {
    const validatorsInfo = await validatorFunction(ctx)
    const validatorData = (validatorsInfo as any)?.validators
    delegationCount = 0
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
export async function fetchMirrorFunds(ctx: Context) {
    delegationCount = 0
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
    allowedNode(delegationToCurrentValidator)
    const currentAmt = getTotalFromDelegation(delegationToCurrentValidator)
    const totalDelegatedAmount = currentAmt
    const totalInFLR = parseFloat(totalDelegatedAmount.toString())
    return {
        'Total Mirrored Amount': `${totalInFLR} FLR`,
        'Mirror Funds Details': {
            ...delegationToCurrentValidator,
        },
        'Delegation Count': delegationCount,
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
        ip = 'coston2'
    } else if (ava.getHRP() === 'flare') {
        ip = 'flare'
    }
    const rpcUrl: string = `https://${ip}-api.flare.network/ext/C/rpc`
    return rpcUrl
}

export function getDelCount() {
    return delegationCount
}

export function getNodes() {
    return nodes
}

async function allowedNode(delegationInfo: DelegatedAmount[]) {
    delegationInfo.forEach((info) => {
        if (!nodes.includes(info.nodeId)) {
            nodes.push(info.nodeId)
        }
    })
    delegationCount = nodes.length
    return nodes
}
