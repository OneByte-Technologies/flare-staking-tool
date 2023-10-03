/*eslint-disable */
import { ethers } from 'ethers'
import {
    defaultContractAddresses,
    getAddressBinderABI,
    getFlareContractRegistryABI,
    addressBinderContractName,
} from '../views/wallet/FlareContractConstants'
import { ava } from '@/AVA'

function getIp(): string {
    let ip: string = ''

    if (ava.getHRP() === 'costwo') {
        ip = 'coston2'
    } else if (ava.getHRP() === 'flare') {
        ip = 'flare'
    }

    const rpcUrl: string = `https://${ip}-api.flare.network/ext/C/rpc`
    return rpcUrl
}

export async function checkIsRegistered(userAddress: string): Promise<Boolean> {
    const rpcUrl: string = getIp()
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const contractAddress: string = await getContractAddress(
        ava.getHRP(),
        addressBinderContractName
    )
    const abi = getAddressBinderABI() as ethers.ContractInterface
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const result = await contract.cAddressToPAddress(userAddress)

    if (result !== '0x0000000000000000000000000000000000000000') {
        console.log('Success. You are registered')
        const registered = true
        return registered
    } else {
        console.log('Please Register')
        const registered = false
        return registered
    }
}

async function getContractAddress(network: string, contractName: string): Promise<string> {
    const rpcUrl: string = getIp()
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
