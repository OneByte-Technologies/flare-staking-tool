import { BigNumber, ethers } from 'ethers'
import { BN } from 'ethereumjs-util'

let cBal: string = ''
let balBN: BN = new BN(0)

const getCBalance = async (address: string) => {
    try {
        const url: string = 'https://coston2-api.flare.network/ext/C/rpc'
        const provider = new ethers.providers.JsonRpcProvider(url)
        const result = await provider.getBalance(address)
        const balHex = result._hex.toString()
        balBN = new BN(parseInt(result._hex))
        cBal = ethers.utils.formatEther(balHex)
        return cBal
    } catch (err) {
        console.error('Promise rejected with error:', err)
    }
}
export { getCBalance, cBal, balBN }
