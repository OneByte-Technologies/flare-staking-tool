/*eslint-disable */
import { ethers } from 'ethers'

// Set up a provider
const providerUrl = 'https://coston2-api.flare.network:443' // Replace with your provider URL
const provider = new ethers.providers.JsonRpcProvider(providerUrl)

// Load the ValidatorRewardManager contract ABI and address for Coston2 network
const coston2ValidatorRewardManagerAddress = '0x33913AcE907F682E305f36d7538D3cCd37E2cA5B' // Coston2 network
const coston2ValidatorRewardManagerABI = [
    [
        {
            "type": "constructor",
            "stateMutability": "nonpayable",
            "inputs": [
              {
                "type": "address",
                "name": "_governance",
                "internalType": "address"
              },
              {
                "type": "address",
                "name": "_addressUpdater",
                "internalType": "address"
              },
              {
                "type": "address",
                "name": "_oldRewardManager",
                "internalType": "address"
              }
            ]
          },
          {
            "type": "event",
            "name": "AllowedClaimRecipientsChanged",
            "inputs": [
              {
                "type": "address",
                "name": "rewardOwner",
                "internalType": "address",
                "indexed": false
              },
              {
                "type": "address[]",
                "name": "recipients",
                "internalType": "address[]",
                "indexed": false
              }
            ],
            "anonymous": false
          },
        {
            type: 'event',
            name: 'ClaimExecutorsChanged',
            inputs: [
                { type: 'address', name: 'rewardOwner', internalType: 'address', indexed: false },
                { type: 'address[]', name: 'executors', internalType: 'address[]', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'DailyAuthorizedInflationSet',
            inputs: [
                {
                    type: 'uint256',
                    name: 'authorizedAmountWei',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'GovernanceCallTimelocked',
            inputs: [
                { type: 'bytes4', name: 'selector', internalType: 'bytes4', indexed: false },
                {
                    type: 'uint256',
                    name: 'allowedAfterTimestamp',
                    internalType: 'uint256',
                    indexed: false,
                },
                { type: 'bytes', name: 'encodedCall', internalType: 'bytes', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'GovernanceInitialised',
            inputs: [
                {
                    type: 'address',
                    name: 'initialGovernance',
                    internalType: 'address',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'GovernedProductionModeEntered',
            inputs: [
                {
                    type: 'address',
                    name: 'governanceSettings',
                    internalType: 'address',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'InflationReceived',
            inputs: [
                {
                    type: 'uint256',
                    name: 'amountReceivedWei',
                    internalType: 'uint256',
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'RewardClaimed',
            inputs: [
                { type: 'address', name: 'beneficiary', internalType: 'address', indexed: true },
                { type: 'address', name: 'sentTo', internalType: 'address', indexed: true },
                { type: 'uint256', name: 'amount', internalType: 'uint256', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'RewardManagerActivated',
            inputs: [
                { type: 'address', name: 'rewardManager', internalType: 'address', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'RewardManagerDeactivated',
            inputs: [
                { type: 'address', name: 'rewardManager', internalType: 'address', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'RewardsDistributed',
            inputs: [
                { type: 'address[]', name: 'addresses', internalType: 'address[]', indexed: false },
                { type: 'uint256[]', name: 'rewards', internalType: 'uint256[]', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'TimelockedGovernanceCallCanceled',
            inputs: [
                { type: 'bytes4', name: 'selector', internalType: 'bytes4', indexed: false },
                { type: 'uint256', name: 'timestamp', internalType: 'uint256', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'event',
            name: 'TimelockedGovernanceCallExecuted',
            inputs: [
                { type: 'bytes4', name: 'selector', internalType: 'bytes4', indexed: false },
                { type: 'uint256', name: 'timestamp', internalType: 'uint256', indexed: false },
            ],
            anonymous: false,
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'activate',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'active',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address[]', name: '', internalType: 'address[]' }],
            name: 'allowedClaimRecipients',
            inputs: [{ type: 'address', name: '_rewardOwner', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'cancelGovernanceCall',
            inputs: [{ type: 'bytes4', name: '_selector', internalType: 'bytes4' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'claim',
            inputs: [
                { type: 'address', name: '_rewardOwner', internalType: 'address' },
                { type: 'address', name: '_recipient', internalType: 'address payable' },
                { type: 'uint256', name: '_rewardAmount', internalType: 'uint256' },
                { type: 'bool', name: '_wrap', internalType: 'bool' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address[]', name: '', internalType: 'address[]' }],
            name: 'claimExecutors',
            inputs: [{ type: 'address', name: '_rewardOwner', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'deactivate',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'distributeRewards',
            inputs: [
                { type: 'address[]', name: '_addresses', internalType: 'address[]' },
                { type: 'uint256[]', name: '_rewardAmounts', internalType: 'uint256[]' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'executeGovernanceCall',
            inputs: [{ type: 'bytes4', name: '_selector', internalType: 'bytes4' }],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '_addressUpdater', internalType: 'address' }],
            name: 'getAddressUpdater',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'pure',
            outputs: [{ type: 'string', name: '', internalType: 'string' }],
            name: 'getContractName',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'getInflationAddress',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [
                { type: 'uint256', name: '_totalReward', internalType: 'uint256' },
                { type: 'uint256', name: '_claimedReward', internalType: 'uint256' },
            ],
            name: 'getStateOfRewards',
            inputs: [{ type: 'address', name: '_beneficiary', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [
                { type: 'uint256', name: '_lockedFundsWei', internalType: 'uint256' },
                { type: 'uint256', name: '_totalInflationAuthorizedWei', internalType: 'uint256' },
                { type: 'uint256', name: '_totalClaimedWei', internalType: 'uint256' },
            ],
            name: 'getTokenPoolSupplyData',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [
                { type: 'uint256', name: '_totalAwardedWei', internalType: 'uint256' },
                { type: 'uint256', name: '_totalClaimedWei', internalType: 'uint256' },
                { type: 'uint256', name: '_totalInflationAuthorizedWei', internalType: 'uint256' },
                { type: 'uint256', name: '_totalInflationReceivedWei', internalType: 'uint256' },
                {
                    type: 'uint256',
                    name: '_lastInflationAuthorizationReceivedTs',
                    internalType: 'uint256',
                },
                { type: 'uint256', name: '_dailyAuthorizedInflation', internalType: 'uint256' },
            ],
            name: 'getTotals',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'governance',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'contract IGovernanceSettings' }],
            name: 'governanceSettings',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'initialise',
            inputs: [{ type: 'address', name: '_initialGovernance', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'newRewardManager',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'oldRewardManager',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
            name: 'productionMode',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'payable',
            outputs: [],
            name: 'receiveInflation',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'address' }],
            name: 'rewardDistributor',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'setAllowedClaimRecipients',
            inputs: [{ type: 'address[]', name: '_recipients', internalType: 'address[]' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'setClaimExecutors',
            inputs: [{ type: 'address[]', name: '_executors', internalType: 'address[]' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'setDailyAuthorizedInflation',
            inputs: [{ type: 'uint256', name: '_toAuthorizeWei', internalType: 'uint256' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'setNewRewardManager',
            inputs: [{ type: 'address', name: '_newRewardManager', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'setRewardDistributor',
            inputs: [{ type: 'address', name: '_rewardDistributor', internalType: 'address' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'switchToProductionMode',
            inputs: [],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [
                { type: 'uint256', name: 'allowedAfterTimestamp', internalType: 'uint256' },
                { type: 'bytes', name: 'encodedCall', internalType: 'bytes' },
            ],
            name: 'timelockedCalls',
            inputs: [{ type: 'bytes4', name: '', internalType: 'bytes4' }],
        },
        {
            type: 'function',
            stateMutability: 'nonpayable',
            outputs: [],
            name: 'updateContractAddresses',
            inputs: [
                { type: 'bytes32[]', name: '_contractNameHashes', internalType: 'bytes32[]' },
                { type: 'address[]', name: '_contractAddresses', internalType: 'address[]' },
            ],
        },
        {
            type: 'function',
            stateMutability: 'view',
            outputs: [{ type: 'address', name: '', internalType: 'contract WNat' }],
            name: 'wNat',
            inputs: [],
        },
    ],
]

// Configuration Types object for Coston2 network
interface RewardConfig {
    userAddress: string
    recipientAddress: string
    wrap: boolean
}

// Function to get ValidatorRewardManager contract address on Coston2 network
export async function getValidatorRewardManagerAddress(): Promise<string> {
    try {
        // The address for the ValidatorRewardManager contract on Coston2 network is known
        return coston2ValidatorRewardManagerAddress
    } catch (error) {
        console.error('Error getting ValidatorRewardManager address on Coston2:', error)
        throw error
    }
}

// Function to check unclaimed rewards on Coston2 network
export async function checkUnclaimedRewards(
    config: RewardConfig
): Promise<{ totalReward: ethers.BigNumber; claimedReward: ethers.BigNumber }> {
    try {
        const { userAddress } = config

        // Connect to the Coston2 ValidatorRewardManager contract
        const validatorRewardManagerContract = new ethers.Contract(
            coston2ValidatorRewardManagerAddress,
            coston2ValidatorRewardManagerABI as ethers.ContractInterface,
            provider
        )

        // Check unclaimed rewards
        const rewardsInfo = await validatorRewardManagerContract.getStateOfRewards(userAddress)
        return rewardsInfo
    } catch (error) {
        console.error('Error checking unclaimed rewards on Coston2:', error)
        throw error
    }
}

// Function to claim rewards on Coston2 network
export async function claimRewards(config: RewardConfig): Promise<void> {
    try {
        const { userAddress, recipientAddress, wrap } = config

        // Connect to the Coston2 ValidatorRewardManager contract
        const validatorRewardManagerContract = new ethers.Contract(
            coston2ValidatorRewardManagerAddress,
            coston2ValidatorRewardManagerABI as ethers.ContractInterface,
            provider
        )

        // Check unclaimed rewards
        const rewardsInfo = await validatorRewardManagerContract.getStateOfRewards(userAddress)
        const totalReward = rewardsInfo._totalReward
        const claimedReward = rewardsInfo._claimedReward

        if (totalReward.gt(claimedReward)) {
            // Claim rewards on Coston2
            const tx = await validatorRewardManagerContract.claim(
                userAddress,
                recipientAddress,
                totalReward.sub(claimedReward),
                wrap
            )

            await tx.wait()

            console.log('Rewards claimed successfully on Coston2!')
        } else {
            console.log('No unclaimed rewards available on Coston2.')
        }
    } catch (error) {
        console.error('Error claiming rewards on Coston2:', error)
        throw error
    }
}

// Example usage:
// const validatorRewardManagerAddress = await getValidatorRewardManagerAddress();
// const userAddress = 'YOUR_USER_ADDRESS';
// const recipientAddress = 'YOUR_RECIPIENT_ADDRESS';
// const wrap = true; // Set to true or false as needed
// const rewardsInfo = await checkUnclaimedRewards({ userAddress, recipientAddress, wrap });
// console.log('Unclaimed rewards:', rewardsInfo);
// await claimRewards({ userAddress, recipientAddress, wrap });
