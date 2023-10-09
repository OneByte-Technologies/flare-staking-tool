export interface ValidatorRaw {
    connected: boolean
    delegationFee: string
    delegators: Array<Delegators>
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: ValidatorRewardOwner
    stakeAmount: string
    startTime: string
    txID: string
    uptime: string
}

export interface Delegators {
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: RewardOwner
    stakeAmount: string
    startTime: string
    txID: string
}

export interface RewardOwner {
    address: Array<string>
    lockTime: string
    threshold: string
}

export interface DelegatorPendingRaw {
    startTime: string
    endTime: string
    stakeAmount: string
    nodeID: string
}

export interface ValidatorPendingRaw {
    startTime: string
    endTime: string
    stakeAmount: string
    nodeID: string
    delegationFee: string
    connected: boolean
}

export interface ValidatorRewardOwner {
    addresses: string[]
    locktime: string
    threshold: string
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
