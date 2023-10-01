/*eslint-disable */
import { ethers } from 'ethers'
import {defaultContractAddresses, getAddressBinderABI} from '../views/wallet/FlareContractConstants'
import { ava } from '@/AVA'

// Set up a provider
// const providerUrl = 'https://coston2-api.flare.network/ext/C/rpc' // Replace with your provider URL
// const provider = new ethers.providers.JsonRpcProvider(providerUrl)

// const getIp() {
//     let ip = ''
//     if (ava.getHRP() === 'costwo') {
//         ip = 'coston2'
//     } else if (ava.getHRP() === 'flare') {
//         ip = 'flare'
//     }
//     const rpcUrl: string = `https://${ip}-api.flare.network/ext/C/rpc`
//     return rpcUrl
// }



export async function checkIsRegistered( userAddress : string): Promise<Boolean> {
    let ip = ''
    if (ava.getHRP() === 'costwo') {
        ip = 'coston2'
    } else if (ava.getHRP() === 'flare') {
        ip = 'flare'
    }
    const rpcUrl: string = `https://${ip}-api.flare.network/ext/C/rpc`
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const contractAddress: string = defaultContractAddresses.AddressBinder.flare
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


