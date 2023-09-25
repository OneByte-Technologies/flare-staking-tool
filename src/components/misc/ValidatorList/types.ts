export interface ValidatorRaw {
    connected: boolean
    delegationFee: string
    delegators: Array<Delegators>
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: ValidatorRewardOwner //object in console
    stakeAmount: string
    startTime: string
    txID: string
    uptime: string
}

export interface Delegators {
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: Object
    stakeAmount: string
    startTime: string
    txID: string
}
//RewardOwner type ??
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
